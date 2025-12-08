import React, { useState, useRef } from 'react';
import { CalendarCheck, Plus, Trash2, CheckCircle, Circle, AlertCircle, Clock, X, BrainCircuit, Upload, Loader2, FileText, ExternalLink, Download } from 'lucide-react';
import { Assignment, AssignmentStatus, Course, AttachmentLink, FileAttachment } from '../types';
import { useAssignments } from '../hooks/useAssignments';
import { useCourses } from '../hooks/useCourses';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { CalendarMenu } from './CalendarMenu';
import { AttachmentLinks } from './AttachmentLinks';
import { FileUpload } from './FileUpload';
import { formatFileSize, getFileTypeIcon } from '../services/storageService';
import { AssignmentCsvImport } from './AssignmentCsvImport';
import { SkeletonList } from './Skeletons';
import { API_ENDPOINTS } from '../config';

// Helper function to format date for datetime-local input
const formatDateTimeLocal = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  // Format as YYYY-MM-DDTHH:mm (required format for datetime-local input)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const AssignmentsView = () => {
  const { assignments, addAssignment, updateAssignment, deleteAssignment, toggleAssignmentStatus, loading } = useAssignments();
  const { courses } = useCourses();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAssignmentId, setPendingAssignmentId] = useState<string>('');
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    name: '',
    estimatedHours: 5,
    status: AssignmentStatus.NOT_STARTED,
    attachments: [],
    files: []
  });

  // AI Grader State
  const [reviewAssignment, setReviewAssignment] = useState<Assignment | null>(null);
  const [viewAttachmentsFor, setViewAttachmentsFor] = useState<Assignment | null>(null);
  const [questionContext, setQuestionContext] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const questionFileRef = useRef<HTMLInputElement>(null);
  const answerFileRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-white font-mono uppercase tracking-tight">Assignment Manager</h2>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.name || !newAssignment.courseId || !user) return;

    setIsSubmitting(true);
    try {
      // First, create the assignment WITHOUT files (to get DB-generated ID)
      const assignment: Assignment = {
        id: '', // Will be replaced by DB-generated ID
        courseId: newAssignment.courseId,
        name: newAssignment.name,
        dueDate: newAssignment.dueDate,
        estimatedHours: newAssignment.estimatedHours || 5,
        status: AssignmentStatus.NOT_STARTED,
        notes: '',
        attachments: newAssignment.attachments || [],
        files: [], // Start empty - will add after upload
        createdAt: new Date().toISOString()
      };

      // Create assignment and get the DB-generated ID
      const dbId = await addAssignment(assignment);

      // If there are pending files, update the assignment with them
      // Note: Files were uploaded to pendingAssignmentId storage path, which is fine
      // The file URLs remain valid regardless of assignment ID
      if (newAssignment.files && newAssignment.files.length > 0) {
        const assignmentWithFiles: Assignment = {
          ...assignment,
          id: dbId,
          files: newAssignment.files
        };
        await updateAssignment(assignmentWithFiles);
      }

      setIsModalOpen(false);
      setNewAssignment({ name: '', estimatedHours: 5, status: AssignmentStatus.NOT_STARTED, attachments: [], files: [] });
      setPendingAssignmentId('');
      addToast({ type: 'success', message: 'Assignment created successfully!' });
    } catch (error) {
      console.error("Failed to create assignment:", error);
      addToast({ type: 'error', message: 'Failed to create assignment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    // Generate ID upfront so we can upload files before saving
    setPendingAssignmentId(crypto.randomUUID());
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setNewAssignment({ name: '', estimatedHours: 5, status: AssignmentStatus.NOT_STARTED, attachments: [], files: [] });
    setPendingAssignmentId('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'question' | 'answer') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessingFile(true);

    try {
      let extractedText = '';
      if (file.type === 'application/pdf') {
        // @ts-ignore 
        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) {
          addToast({ type: 'error', message: 'PDF processing library not loaded. Please refresh.' });
          setIsProcessingFile(false);
          return;
        }
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        extractedText = `\n--- START FILE: ${file.name} ---\n`;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += `[Page ${i}] ${pageText}\n`;
        }
        extractedText += `--- END FILE ---\n`;
      } else {
        const text = await file.text();
        extractedText = `\n--- START FILE: ${file.name} ---\n${text}\n--- END FILE ---\n`;
      }

      if (target === 'question') {
        setQuestionContext(prev => prev + extractedText);
      } else {
        setStudentAnswer(prev => prev + extractedText);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      addToast({ type: 'error', message: 'Failed to read file.' });
    } finally {
      setIsProcessingFile(false);
      e.target.value = '';
    }
  };

  const handleAnalyzeAssignment = async () => {
    if (!questionContext.trim() || !studentAnswer.trim()) {
      addToast({ type: 'info', message: 'Please provide both the assignment question and your answer.' });
      return;
    }
    setIsAnalyzing(true);
    setFeedback('');
    try {
      const response = await fetch(API_ENDPOINTS.GRADE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionContext,
          studentAnswer
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setFeedback(data.feedback || 'No feedback received.');
    } catch (error) {
      console.error("Grading error:", error);
      setFeedback("Sorry, I encountered an error while grading. Please try again and ensure the backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const closeReviewModal = () => {
    setReviewAssignment(null);
    setQuestionContext('');
    setStudentAnswer('');
    setFeedback('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white font-mono uppercase tracking-tight">Assignment Manager</h2>
        <button
          onClick={openCreateModal}
          className="retro-btn bg-indigo-600 text-white px-4 py-2 rounded-none text-sm font-bold hover:bg-indigo-500 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          NEW ASSIGNMENT
        </button>
      </div>

      <AssignmentCsvImport />

      <div className="retro-card overflow-hidden p-0 border-2 border-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-xs uppercase text-white font-bold font-mono border-b-2 border-black">
                <th className="p-4 border-r-2 border-black">Status</th>
                <th className="p-4 border-r-2 border-black">Assignment</th>
                <th className="p-4 border-r-2 border-black">Course</th>
                <th className="p-4 border-r-2 border-black">Due Date</th>
                <th className="p-4 border-r-2 border-black">Est. Hours</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-bold uppercase">
                    No assignments yet. Initialize tasks.
                  </td>
                </tr>
              ) : (
                assignments
                  .sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  })
                  .map(assignment => {
                    const course = courses.find(c => c.id === assignment.courseId);
                    const isCompleted = assignment.status === AssignmentStatus.COMPLETED;
                    const dueDateObj = assignment.dueDate ? new Date(assignment.dueDate) : undefined;
                    const startDateObj = dueDateObj ? new Date(dueDateObj) : undefined;
                    if (startDateObj) startDateObj.setHours(startDateObj.getHours() - 1);

                    return (
                      <tr key={assignment.id} className={`border-b-2 border-black hover:bg-gray-800 transition-colors group ${isCompleted ? 'bg-gray-800/50' : 'bg-gray-900'}`}>
                        <td className="p-4 border-r-2 border-black">
                          <button
                            onClick={() => toggleAssignmentStatus(assignment.id)}
                            className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${isCompleted
                              ? 'bg-green-500 text-black'
                              : assignment.status === AssignmentStatus.IN_PROGRESS
                                ? 'bg-yellow-400 text-black'
                                : 'bg-gray-700 text-white'
                              }`}
                          >
                            {isCompleted ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 bg-black"></div>}
                            {assignment.status.replace('_', ' ')}
                          </button>
                        </td>
                        <td className="p-4 border-r-2 border-black font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className={isCompleted ? 'line-through text-gray-500' : ''}>{assignment.name}</span>
                            {((assignment.attachments && assignment.attachments.length > 0) || (assignment.files && assignment.files.length > 0)) && (
                              <button
                                onClick={() => setViewAttachmentsFor(assignment)}
                                className="text-xs bg-indigo-600 text-white px-2 py-0.5 border border-black font-bold hover:bg-indigo-500 cursor-pointer"
                                title="View attachments & files"
                              >
                                {(assignment.attachments?.length || 0) + (assignment.files?.length || 0)} 📎
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-4 border-r-2 border-black">
                          <span className={`px-2 py-1 text-[10px] font-bold border border-black shadow-[2px_2px_0px_0px_#000] uppercase ${course?.bg} ${course?.text?.replace('700', '900') || 'text-black'}`}>
                            {course?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="p-4 border-r-2 border-black text-gray-400">
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No Due Date'}
                        </td>
                        <td className="p-4 border-r-2 border-black text-gray-400">{assignment.estimatedHours}H</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setReviewAssignment(assignment)}
                              title="AI Grader & Feedback"
                              className="retro-btn p-1.5 bg-purple-600 text-white border border-black hover:bg-purple-500"
                            >
                              <BrainCircuit className="w-4 h-4" />
                            </button>

                            <div className="retro-btn p-0 border border-black bg-indigo-600 text-white hover:bg-indigo-500 flex items-center justify-center">
                              {dueDateObj && startDateObj ? (
                                <CalendarMenu
                                  title={`Due: ${assignment.name}`}
                                  description={`Course: ${course?.name}\nEstimated Hours: ${assignment.estimatedHours}`}
                                  startDate={startDateObj}
                                  endDate={dueDateObj}
                                  buttonClass="p-1.5 text-white w-full h-full flex items-center justify-center"
                                  iconClass="w-4 h-4"
                                />
                              ) : (
                                <div className="p-1.5 text-gray-400 w-full h-full flex items-center justify-center cursor-not-allowed" title="No due date">
                                  <Clock className="w-4 h-4" />
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => deleteAssignment(assignment.id)}
                              title="Delete Assignment"
                              className="retro-btn p-1.5 bg-red-600 text-white border border-black hover:bg-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assignment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="retro-card w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up border-2 border-white shadow-[8px_8px_0px_0px_#fff]">
            <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-800 flex-shrink-0">
              <h3 className="font-black text-white font-mono uppercase">Add New Assignment</h3>
              <button onClick={closeCreateModal} className="text-gray-400 hover:text-white hover:rotate-90 transition-transform">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-900 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Description / Name</label>
                <input
                  type="text"
                  required
                  className="retro-input w-full p-3 font-mono text-sm"
                  placeholder="e.g., Maman 14"
                  value={newAssignment.name}
                  onChange={e => setNewAssignment({ ...newAssignment, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Course</label>
                <select
                  required
                  className="retro-input w-full p-3 font-mono text-sm"
                  value={newAssignment.courseId || ''}
                  onChange={e => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                >
                  <option value="">SELECT COURSE</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Due Date</label>
                  <input
                    type="datetime-local"
                    className="retro-input w-full p-3 font-mono text-sm"
                    value={formatDateTimeLocal(newAssignment.dueDate)}
                    onInvalid={e => e.preventDefault()}
                    onChange={e => {
                      const value = e.target.value;
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: value ? new Date(value).toISOString() : undefined
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 font-mono uppercase">Est. Hours</label>
                  <input
                    type="number"
                    min="1"
                    className="retro-input w-full p-3 font-mono text-sm"
                    value={newAssignment.estimatedHours}
                    onChange={e => setNewAssignment({ ...newAssignment, estimatedHours: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {/* Link Attachments */}
              <div>
                <AttachmentLinks
                  attachments={newAssignment.attachments || []}
                  onAttachmentsChange={(attachments) => setNewAssignment({ ...newAssignment, attachments })}
                  maxAttachments={10}
                />
              </div>

              {/* File Uploads */}
              {user && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <FileUpload
                    uid={user.uid}
                    assignmentId={pendingAssignmentId}
                    files={newAssignment.files || []}
                    onFilesChange={(files) => setNewAssignment({ ...newAssignment, files })}
                    maxFiles={5}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="retro-btn w-full bg-green-500 text-black font-black py-4 uppercase tracking-widest hover:bg-green-400 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    CREATING...
                  </>
                ) : (
                  'Create Assignment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Grader Modal */}
      {reviewAssignment && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="retro-card w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-fade-in-up border-2 border-white shadow-[8px_8px_0px_0px_#fff]">
            {/* Header */}
            <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white font-mono uppercase">AI Grader</h3>
                  <p className="text-xs text-gray-400 font-mono">TARGET: {reviewAssignment.name}</p>
                </div>
              </div>
              <button onClick={closeReviewModal} className="text-gray-400 hover:text-white hover:rotate-90 transition-transform">
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
              {!feedback && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-gray-300 flex items-center gap-2 font-mono text-xs uppercase">
                        <FileText className="w-4 h-4" />
                        Requirements / Question
                      </label>
                      <button
                        onClick={() => questionFileRef.current?.click()}
                        className="retro-btn text-xs bg-indigo-600 text-white px-2 py-1 flex items-center gap-1 hover:bg-indigo-500 border border-black"
                      >
                        <Upload className="w-3 h-3" />
                        PDF
                      </button>
                      <input
                        type="file"
                        className="hidden"
                        ref={questionFileRef}
                        accept=".pdf,.txt,.md"
                        onChange={(e) => handleFileUpload(e, 'question')}
                      />
                    </div>
                    <textarea
                      className="flex-1 retro-input w-full p-4 text-sm font-mono resize-none"
                      placeholder="Paste assignment requirements here..."
                      value={questionContext}
                      onChange={(e) => setQuestionContext(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-bold text-gray-300 flex items-center gap-2 font-mono text-xs uppercase">
                        <FileText className="w-4 h-4" />
                        Your Submission
                      </label>
                      <button
                        onClick={() => answerFileRef.current?.click()}
                        className="retro-btn text-xs bg-emerald-600 text-white px-2 py-1 flex items-center gap-1 hover:bg-emerald-500 border border-black"
                      >
                        <Upload className="w-3 h-3" />
                        PDF
                      </button>
                      <input
                        type="file"
                        className="hidden"
                        ref={answerFileRef}
                        accept=".pdf,.txt,.md"
                        onChange={(e) => handleFileUpload(e, 'answer')}
                      />
                    </div>
                    <textarea
                      className="flex-1 retro-input w-full p-4 text-sm font-mono resize-none focus:border-emerald-500"
                      placeholder="Paste your answer here..."
                      value={studentAnswer}
                      onChange={(e) => setStudentAnswer(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {feedback && (
                <div className="animate-fade-in bg-gray-800 border-2 border-black shadow-[4px_4px_0px_0px_#000] p-8 min-h-full">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-indigo-400 flex items-center gap-2 font-mono font-black uppercase border-b-2 border-gray-700 pb-2">
                      <BrainCircuit className="w-6 h-6" />
                      Evaluation Report
                    </h3>
                    <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono text-sm mt-4">
                      {feedback}
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => setFeedback('')}
                      className="text-indigo-400 font-bold font-mono hover:text-indigo-300 border-b-2 border-transparent hover:border-indigo-400"
                    >
                      &lt; CHECK ANOTHER DRAFT
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {!feedback && (
              <div className="p-4 border-t-2 border-black bg-gray-800 flex justify-between items-center">
                <div className="text-xs text-gray-500 font-mono">
                  {isProcessingFile && <span className="flex items-center gap-1 text-indigo-400"><Loader2 className="w-3 h-3 animate-spin" /> PROCESSING DATA...</span>}
                </div>
                <button
                  onClick={handleAnalyzeAssignment}
                  disabled={isAnalyzing || isProcessingFile}
                  className="retro-btn px-6 py-3 bg-white text-black border-2 border-black font-black uppercase hover:bg-gray-200 disabled:opacity-50 disabled:shadow-none disabled:translate-x-[2px] disabled:translate-y-[2px] flex items-center gap-2"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                  {isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Attachments Modal */}
      {viewAttachmentsFor && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="retro-card w-full max-w-2xl overflow-hidden animate-fade-in-up border-2 border-white shadow-[8px_8px_0px_0px_#fff]">
            <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-800">
              <div>
                <h3 className="font-black text-white font-mono uppercase">Attachments</h3>
                <p className="text-xs text-gray-400 font-mono mt-1">{viewAttachmentsFor.name}</p>
              </div>
              <button
                onClick={() => setViewAttachmentsFor(null)}
                className="text-gray-400 hover:text-white hover:rotate-90 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 bg-gray-900 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Uploaded Files Section */}
              {viewAttachmentsFor.files && viewAttachmentsFor.files.length > 0 && (
                <div>
                  <h4 className="text-green-400 font-bold font-mono text-xs uppercase mb-3 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Uploaded Files ({viewAttachmentsFor.files.length})
                  </h4>
                  <div className="space-y-3">
                    {viewAttachmentsFor.files.map((file) => (
                      <div
                        key={file.id}
                        className="retro-card bg-gray-800 p-4 border-green-500 hover:border-green-400"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                            <span className="text-2xl">{getFileTypeIcon(file.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold font-mono text-sm mb-1 truncate">
                                {file.name}
                              </p>
                              <p className="text-gray-500 text-xs font-mono">
                                {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="retro-btn bg-green-600 text-white hover:bg-green-500 px-4 py-2 text-sm font-bold flex items-center gap-2 flex-shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            Open
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link Attachments Section */}
              {viewAttachmentsFor.attachments && viewAttachmentsFor.attachments.length > 0 && (
                <div>
                  <h4 className="text-indigo-400 font-bold font-mono text-xs uppercase mb-3 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Cloud Links ({viewAttachmentsFor.attachments.length})
                  </h4>
                  <div className="space-y-3">
                    {viewAttachmentsFor.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="retro-card bg-gray-800 p-4 border-indigo-500 hover:border-indigo-400"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-white font-bold font-mono text-sm mb-1 truncate">
                              {attachment.name}
                            </p>
                            <p className="text-gray-500 text-xs font-mono truncate">
                              {attachment.service} • {attachment.url}
                            </p>
                          </div>
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="retro-btn bg-indigo-600 text-white hover:bg-indigo-500 px-4 py-2 text-sm font-bold flex items-center gap-2 flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!viewAttachmentsFor.attachments || viewAttachmentsFor.attachments.length === 0) &&
                (!viewAttachmentsFor.files || viewAttachmentsFor.files.length === 0) && (
                  <div className="text-center py-8 text-gray-500 font-mono">
                    <p>No attachments or files</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
