import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { documentAPI } from './services/api';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import UploadBox, { formatFileSize } from './components/UploadBox';
import DocumentList from './components/DocumentList';

const Dashboard = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchDocuments = useCallback(async () => {
    setLoadingDocs(true);
    setFetchError('');
    try {
      const { data } = await documentAPI.list();
      setDocuments(data.documents || []);
    } catch (err) {
      setFetchError(
        err.response?.data?.message || 'Unable to load documents from the server.'
      );
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteSuccess = (deletedId) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== deletedId));
  };

  const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);

  return (
    <main className="container dashboard-container">
      <div className="stats-grid">
        <div className="stat-card card">
          <span className="stat-label">Total Documents</span>
          <strong className="stat-value">{documents.length}</strong>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Storage Used</span>
          <strong className="stat-value">{formatFileSize(totalSize)}</strong>
        </div>
        <div className="stat-card card">
          <span className="stat-label">Account Owner</span>
          <strong className="stat-value stat-truncate">{user?.email}</strong>
        </div>
      </div>

      {fetchError && (
        <div className="alert alert-error" role="alert">
          {fetchError}
        </div>
      )}

      <UploadBox onUploadSuccess={handleUploadSuccess} />

      <DocumentList
        documents={documents}
        loading={loadingDocs}
        onDeleteSuccess={handleDeleteSuccess}
        onRefresh={fetchDocuments}
      />
    </main>
  );
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" aria-hidden="true" />
        <p>Initializing DocVault...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      {user ? <Dashboard /> : <AuthForm />}
      <footer className="app-footer">
        <div className="container">
          Practical 13 &bull; Full-Stack MERN Document Management System (MongoDB Atlas, Express, React, Node.js)
        </div>
      </footer>
    </div>
  );
};

export default AppContent;
