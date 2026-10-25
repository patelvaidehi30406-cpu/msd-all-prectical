import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canManagePost, isAdmin, user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/posts/${id}`);
        setPost(response.data.post);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Could not load the requested blog post.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this post?')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/posts/${id}`);
      navigate('/dashboard', {
        state: { successMessage: 'Blog post deleted successfully.' },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete the blog post.'
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container main-section">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container main-section">
        <AlertMessage type="error" message={error || 'Post not found.'} />
        <Link to="/" className="btn btn-outline">
          ← Back to All Posts
        </Link>
      </div>
    );
  }

  const hasPermission = canManagePost(post);
  const isOwner = user && post.author?._id === user._id;

  const createdDate = new Date(post.createdAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const updatedDate = new Date(post.updatedAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="container main-section">
      <div className="post-detail-wrapper">
        <div className="post-detail-top">
          <Link to="/" className="back-link">
            ← Back to Blog Listing
          </Link>

          {hasPermission && (
            <div className="detail-actions">
              {isAdmin && !isOwner && (
                <span className="admin-override-badge">
                  🛡️ Admin Management Access
                </span>
              )}
              <Link
                to={`/dashboard?edit=${post._id}`}
                className="btn btn-secondary btn-sm"
              >
                ✏️ Edit Post
              </Link>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : '🗑️ Delete Post'}
              </button>
            </div>
          )}
        </div>

        <article className="post-detail-card">
          <div className="post-detail-meta">
            <span className="category-pill">{post.category || 'General'}</span>
            <span className="post-date">Published on {createdDate}</span>
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-author-banner">
            <div className="author-avatar author-avatar-lg">
              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="author-banner-row">
                <strong>{post.author?.name || 'Unknown Author'}</strong>
                {post.author?.role && (
                  <span
                    className={`role-badge role-badge-xs ${
                      post.author.role === 'admin' ? 'role-admin' : 'role-user'
                    }`}
                  >
                    {post.author.role.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="author-email">{post.author?.email}</p>
            </div>
          </div>

          <div className="post-detail-body">
            {post.content.split('\n').map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index}>{paragraph}</p>
              ) : (
                <br key={index} />
              )
            )}
          </div>

          {post.updatedAt !== post.createdAt && (
            <div className="post-detail-footer">
              <small>Last updated: {updatedDate}</small>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default PostDetailsPage;
