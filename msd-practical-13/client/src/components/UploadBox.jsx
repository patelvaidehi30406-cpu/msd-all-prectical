import React, { useRef, useState } from 'react';
import { documentAPI } from '../services/api';

const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const UploadBox = ({ onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validateAndSelectFile = (file) => {
    setError('');
    setSuccessMsg('');

    if (!file) return;

    const ext = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(
        `Invalid file format (${ext}). Allowed: PDF, Word, Excel, PowerPoint, TXT, CSV, JPG, PNG, WEBP.`
      );
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        `File is too large (${formatFileSize(file.size)}). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSelectFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    validateAndSelectFile(file);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a document before clicking upload.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');
    setSuccessMsg('');

    try {
      const { data } = await documentAPI.upload(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        }
      });

      setSuccessMsg(`"${data.document.originalName}" uploaded successfully!`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUploadSuccess) {
        onUploadSuccess(data.document);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to upload document. Please check the file type and size.';
      setError(msg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <section className="card upload-card">
      <div className="section-header">
        <div>
          <h2>Upload Document</h2>
          <p className="section-subtitle">
            Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG, WEBP (Max {MAX_FILE_SIZE_MB} MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" role="status">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleUpload}>
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''} ${
            selectedFile ? 'has-file' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden-file-input"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={handleFileChange}
          />

          {!selectedFile ? (
            <div className="dropzone-prompt">
              <div className="dropzone-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="dropzone-title">
                <span>Click to browse</span> or drag and drop a file here
              </p>
              <p className="dropzone-hint">Private &amp; encrypted access per user account</p>
            </div>
          ) : (
            <div className="selected-file-info" onClick={(e) => e.stopPropagation()}>
              <div className="file-preview-main">
                <span className="file-badge">READY</span>
                <div className="file-preview-text">
                  <strong>{selectedFile.name}</strong>
                  <span>
                    {formatFileSize(selectedFile.size)} &bull; {selectedFile.type || 'Document'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={clearSelection}
                disabled={uploading}
              >
                Change
              </button>
            </div>
          )}
        </div>

        {uploading && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="upload-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!selectedFile || uploading}
          >
            {uploading ? `Uploading (${progress}%)...` : 'Upload Document'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default UploadBox;
