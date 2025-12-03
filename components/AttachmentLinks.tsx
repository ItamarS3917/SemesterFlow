import React, { useState } from 'react';
import { ExternalLink, Plus, X, Link2, Shield, AlertCircle } from 'lucide-react';
import { AttachmentLink } from '../types';
import { validateAttachmentUrl, getServiceName, shortenUrl } from '../utils/urlValidator';

interface AttachmentLinksProps {
  attachments: AttachmentLink[];
  onAttachmentsChange: (attachments: AttachmentLink[]) => void;
  maxAttachments?: number;
}

export const AttachmentLinks: React.FC<AttachmentLinksProps> = ({
  attachments,
  onAttachmentsChange,
  maxAttachments = 10
}) => {
  const [inputUrl, setInputUrl] = useState('');
  const [inputName, setInputName] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleAddLink = () => {
    // Clear previous error
    setError('');

    // Validate URL
    const validation = validateAttachmentUrl(inputUrl);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid URL');
      return;
    }

    // Check attachment limit
    if (attachments.length >= maxAttachments) {
      setError(`Maximum ${maxAttachments} attachments allowed`);
      return;
    }

    // Get service name from URL
    const service = getServiceName(validation.url!);

    // Use custom name or extract from URL
    const displayName = inputName.trim() || extractFileName(validation.url!);

    // Create new attachment
    const newAttachment: AttachmentLink = {
      url: validation.url!,
      name: displayName,
      service,
      addedAt: new Date().toISOString()
    };

    // Add to list
    onAttachmentsChange([...attachments, newAttachment]);

    // Reset form
    setInputUrl('');
    setInputName('');
    setShowForm(false);
    setError('');
  };

  const handleRemoveLink = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(newAttachments);
  };

  const extractFileName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/').filter(Boolean);

      // Try to get filename from path
      if (pathSegments.length > 0) {
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment && !lastSegment.includes('?')) {
          return decodeURIComponent(lastSegment);
        }
      }

      return 'Attachment';
    } catch {
      return 'Attachment';
    }
  };

  const getServiceIcon = (service: string) => {
    const lowerService = service.toLowerCase();

    if (lowerService.includes('dropbox')) {
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#0061FF" d="M7.06 1L0 5.61l7.06 4.61L12 6.58 16.94 1 24 5.61l-7.06 4.61L12 14.25l-4.94-4.03L0 14.83l7.06 4.61L12 14.83l4.94 4.61L24 14.83l-7.06-4.61L12 14.25z" />
        </svg>
      );
    }

    return <Link2 className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-indigo-400" />
          <label className="text-sm font-bold text-white font-mono uppercase">
            Attachments ({attachments.length}/{maxAttachments})
          </label>
        </div>

        {!showForm && attachments.length < maxAttachments && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-xs retro-btn bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Link
          </button>
        )}
      </div>

      {/* Security Notice */}
      <div className="retro-card bg-gray-800/50 p-3 border-green-500/30">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-400 font-mono">
            <p className="text-green-400 font-bold mb-1">Secured by URL Validation</p>
            <p>Only trusted services accepted: Dropbox, OneDrive, Box, iCloud, MEGA</p>
          </div>
        </div>
      </div>

      {/* Add Link Form */}
      {showForm && (
        <div className="retro-card bg-gray-800 p-4 border-indigo-500 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold font-mono text-sm">Add Attachment Link</h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setInputUrl('');
                setInputName('');
                setError('');
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1">
              Link URL *
            </label>
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://dropbox.com/s/..."
              className="retro-input w-full text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 font-mono mb-1">
              Display Name (optional)
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Assignment Guidelines.pdf"
              className="retro-input w-full text-sm"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-900/20 border border-red-500 p-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-400 font-mono">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddLink}
            disabled={!inputUrl.trim()}
            className="retro-btn w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-2"
          >
            Add Attachment
          </button>
        </div>
      )}

      {/* Attachment List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="retro-card bg-gray-800 p-3 flex items-center justify-between group hover:border-indigo-500 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getServiceIcon(attachment.service)}

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-mono font-bold truncate">
                    {attachment.name}
                  </p>
                  <p className="text-gray-500 text-xs font-mono">
                    {attachment.service} • {shortenUrl(attachment.url, 40)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="retro-btn bg-gray-700 text-white hover:bg-indigo-600 px-3 py-1 text-xs flex items-center gap-1"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>

                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove attachment"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length === 0 && !showForm && (
        <div className="text-center py-6 text-gray-500 font-mono text-sm">
          <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No attachments yet</p>
          <p className="text-xs mt-1">Add links to files stored in the cloud</p>
        </div>
      )}
    </div>
  );
};
