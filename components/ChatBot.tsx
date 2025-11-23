
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { Course, Assignment, UserStats } from '../types';
import { useCourses } from '../hooks/useCourses';
import { useAssignments } from '../hooks/useAssignments';
import { useStats } from '../hooks/useStats';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const STORAGE_KEY = 'semesterflow_chat_history';

export const ChatBot = () => {
  const { courses } = useCourses();
  const { assignments } = useAssignments();
  const { userStats } = useStats();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any | null>(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
        } catch (e) {
          console.error("Failed to parse chat history", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setIsHistoryLoaded(true);
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (isHistoryLoaded) {
      if (messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [messages, isHistoryLoaded]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !chatSession && isHistoryLoaded) {
      initChat();
    }
  }, [isOpen, chatSession, isHistoryLoaded]);

  const initChat = async () => {
    // Chat session is managed on the server or stateless for this simple implementation
    // We'll just set a flag that we are ready
    setChatSession({} as any);
    if (messages.length === 0) {
      setMessages([{ role: 'model', text: "Hi! I'm here to help you crush your semester. Ask me about your schedule or specific course topics if you've added notes!" }]);
    }
  };

  const handleResetChat = () => {
    setChatSession(null);
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      // Prepare context data
      const contextData = {
        currentDate: new Date().toLocaleDateString(),
        stats: userStats,
        courses: courses.map(c => ({
          name: c.name,
          progress: `${c.hoursCompleted}/${c.totalHoursTarget}h`,
          nextExam: c.nextExamDate,
          completedAssignments: c.completedAssignments,
          knowledgeBase: c.knowledge || "No notes provided."
        })),
        upcomingAssignments: assignments
          .filter(a => a.status !== 'COMPLETED')
          .map(a => ({
            name: a.name,
            due: a.dueDate,
            hoursEstimated: a.estimatedHours
          }))
      };

      const systemInstruction = `You are the AI Study Assistant for SemesterFlow.
Your goal is to help the student manage their time, clarify deadlines, and stay motivated.
Data:
${JSON.stringify(contextData, null, 2)}

Guidelines:
1. Be concise, friendly, and encouraging.
2. If asked about deadlines, reference the "upcomingAssignments".
3. If asked about progress, reference specific course stats.
4. If the user asks a technical question about a course, CHECK THE "knowledgeBase" field.
5. If the user seems stressed, offer break suggestions.`;

      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: history,
          systemInstruction: systemInstruction
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                setMessages(prev => {
                  const newHistory = [...prev];
                  newHistory[newHistory.length - 1] = {
                    role: 'model',
                    text: fullText
                  };
                  return newHistory;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data', e);
            }
          }
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the server. Please ensure the backend is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-300 transform hover:scale-105 border-2 border-black ${isOpen ? 'bg-red-600 rotate-90 text-white' : 'bg-indigo-600 text-white'
          }`}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-gray-900 rounded-2xl shadow-2xl border-2 border-indigo-500 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-indigo-900/80 backdrop-blur-sm p-4 flex items-center justify-between border-b border-indigo-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#6366f1]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Study Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-indigo-200 text-xs">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="New Chat / Reload Context"
                className="p-1.5 text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-[0_4px_6px_rgba(0,0,0,0.3)]'
                    : 'bg-gray-800 text-gray-100 border border-gray-700 rounded-tl-none shadow-sm'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 shadow-sm">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about notes, deadlines..."
                className="flex-1 bg-gray-700 border-gray-600 text-white border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-gray-600 transition-all outline-none placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-[10px] text-center text-gray-500 mt-2">
              AI uses your latest uploaded notes.
            </div>
          </div>
        </div>
      )}
    </>
  );
};