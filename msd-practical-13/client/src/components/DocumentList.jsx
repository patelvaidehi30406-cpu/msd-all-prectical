import React, { useState } from 'react';
import { documentAPI } from '../services/api';
import { formatFileSize } from './UploadBox';

/**
 * Helper to return a short human-readable badge label for a MIME type / filename
 */
const getFileTypeBadge = (fileType, originalName = '') => {
  const ext = originalName.includes('.')
    ? originalName.split('.').pop().toUpperCase()
    : '';
  if (ext) return ext;
  if (!fileType) return 'FILE';
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('word')) return 'DOCX';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'XLSX';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'PPTX';
  if (fileType.includes('image/')) return fileType.split('/')[1].toUpperCase();
  if (fileType.includes('text/')) return 'TXT';
  return 'DOC';
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const DocumentList = ({ documents, loading, onDeleteSuccess, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const filteredDocuments = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleDownload = async (doc) => {
    setActionError('');
    setDownloadingId(doc._id);
    try {
      await documentAPI.download(doc._id, doc.originalName);
    } catch (err) {
      setActionError('Failed to download document. It may have been removed.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (doc) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${doc.originalName}"?`
    );
    if (!confirmed) return;

    setActionError('');
    setDeletingId(doc._id);
    try {
      await documentAPI.remove(doc._id);
      if (onDeleteSuccess) {
        onDeleteSuccess(doc._id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete document.';
      setActionError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="card documents-card">
      <div className="section-header documents-header">
        <div>
          <h2>My Documents ({documents.length})</h2>
          <p className="section-subtitle">
            Only you can view, download, or delete documents uploaded to your account.
          </p>
        </div>

        <div className="documents-toolbar">
          <input
            type="search"
            className="search-input"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search documents by filename"
          />
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-error" role="alert">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="spinner" aria-hidden="true" />
          <p>Loading your documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="empty-state">
          <h3>
            {searchQuery
              ? 'No matching documents found'
              : 'No documents uploaded yet'}
          </h3>
          <p>
            {searchQuery
              ? `No files matched "${searchQuery}". Try clearing the search filter.`
              : 'Use the upload panel above to store your first document securely.'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => {
                const badge = getFileTypeBadge(doc.fileType, doc.originalName);
                const isDownloading = downloadingId === doc._id;
                const isDeleting = deletingId === doc._id;

                return (
                  <tr key={doc._id}>
                    <td className="doc-name-cell">
                      <span className="doc-title" title={doc.originalName}>
                        {doc.originalName}
                      </span>
                      <span className="doc-stored-name">{doc.fileType}</span>
                    </td>
                    <td>
                      <span className="type-badge">{badge}</span>
                    </td>
                    <td className="nowrap">{formatFileSize(doc.fileSize)}</td>
                    <td className="nowrap">{formatDate(doc.uploadDate || doc.createdAt)}</td>
                    <td className="actions-col">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDownload(doc)}
                          disabled={isDownloading || isDeleting}
                        >
                          {isDownloading ? 'Downloading...' : 'Download'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(doc)}
                          disabled={isDeleting || isDownloading}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default DocumentList;
