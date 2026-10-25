import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import AlertMessage from '../components/AlertMessage';

const CATEGORIES = [
  'General',
  'Web Development',
  'MERN Stack',
  'JavaScript',
  'Backend & Security',
  'Career & Tutorials',
];

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.successMessage || '');

  // Filter tab: 'my' (user's own posts) or 'all' (admin view of all posts)
  const [activeTab, setActiveTab] = useState(isAdmin ? 'all' : 'my');

  // Form state for Create / Edit post
  const [showForm, setShowForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    content: '',
  });

  const fetchDashboardPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/posts');
      setPosts(response.data.posts || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to load dashboard blog posts.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardPosts();
  }, [fetchDashboardPosts]);

  // Handle URL query params (?create=true or ?edit=<postId>)
  useEffect(() => {
    const createParam = searchParams.get('create');
    const editParam = searchParams.get('edit');

    if (createParam === 'true') {
      setEditingPostId(null);
      setFormData({ title: '', category: 'General', content: '' });
      setShowForm(true);
    } else if (editParam && posts.length > 0) {
      const targetPost = posts.find((p) => p._id === editParam);
      if (targetPost) {
        setEditingPostId(targetPost._id);
        setFormData({
          title: targetPost.title,
          category: targetPost.category || 'General',
          content: targetPost.content,
        });
        setShowForm(true);
      }
    }
  }, [searchParams, posts]);

  const resetForm = () => {
    setEditingPostId(null);
    setFormData({ title: '', category: 'General', content: '' });
    setShowForm(false);
    setSearchParams({});
  };

  const handleOpenCreate = () => {
    setError('');
    setSuccess('');
    setEditingPostId(null);
    setFormData({ title: '', category: 'General', content: '' });
    setShowForm(true);
    setSearchParams({ create: 'true' });
  };

  const handleStartEdit = (post) => {
    setError('');
    setSuccess('');
    setEditingPostId(post._id);
    setFormData({
      title: post.title,
      category: post.category || 'General',
      content: post.content,
    });
    setShowForm(true);
    setSearchParams({ edit: post._id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validatePostForm = () => {
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setError('Post title must be at least 3 characters long.');
      return false;
    }
    if (!formData.content.trim() || formData.content.trim().length < 10) {
      setError('Post content must be at least 10 characters long.');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePostForm()) return;

    try {
      setSubmitting(true);

      if (editingPostId) {
        const response = await api.put(`/posts/${editingPostId}`, {
          title: formData.title.trim(),
          category: formData.category,
          content: formData.content.trim(),
        });
        const updated = response.data.post;
        setPosts((prev) =>
          prev.map((item) => (item._id === editingPostId ? updated : item))
        );
        setSuccess('Blog post updated successfully!');
      } else {
        const response = await api.post('/posts', {
          title: formData.title.trim(),
          category: formData.category,
          content: formData.content.trim(),
        });
        const created = response.data.post;
        setPosts((prev) => [created, ...prev]);
        setSuccess('New blog post published successfully!');
      }

      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'An error occurred while saving the blog post.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((item) => item._id !== postId));
      setSuccess('Blog post deleted successfully!');
      if (editingPostId === postId) {
        resetForm();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete the blog post.'
      );
    }
  };

  const myPosts = posts.filter((post) => {
    const authorId =
      typeof post.author === 'object' ? post.author?._id : post.author;
    return authorId === user?._id;
  });

  const displayedPosts = isAdmin && activeTab === 'all' ? posts : myPosts;

  return (
    <div className="container main-section">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-title-row">
            <h1>{isAdmin ? 'Admin & Author Dashboard' : 'Author Dashboard'}</h1>
            <span
              className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}
            >
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.name}</strong> ({user?.email}).{' '}
            {isAdmin
              ? 'As an Admin, you have full permission to create, edit, and delete any blog post on the platform.'
              : 'Create new articles and manage the blog posts you have authored.'}
          </p>
        </div>

        <div className="dashboard-header-actions">
          {!showForm ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="btn btn-primary"
            >
              + Create New Post
            </button>
          ) : (
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-outline"
            >
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">My Published Posts</span>
          <strong className="stat-value">{myPosts.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Platform Posts</span>
          <strong className="stat-value">{posts.length}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Access Level</span>
          <strong className="stat-value">
            {isAdmin ? 'Full Admin (All Posts)' : 'Author (Own Posts)'}
          </strong>
        </div>
      </div>

      <AlertMessage
        type="error"
        message={error}
        onClose={() => setError('')}
      />
      <AlertMessage
        type="success"
        message={success}
        onClose={() => setSuccess('')}
      />

      {/* Create / Edit Post Form */}
      {showForm && (
        <section className="editor-card">
          <div className="editor-card-header">
            <h2>{editingPostId ? '✏️ Edit Blog Post' : '✍️ Create New Blog Post'}</h2>
            <button
              type="button"
              className="btn btn-text"
              onClick={resetForm}
            >
              Close ✕
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="editor-form" noValidate>
            <div className="form-row">
              <div className="form-group form-group-grow">
                <label htmlFor="title">Post Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter an engaging blog post title..."
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="form-input"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content">Blog Content</label>
              <textarea
                id="content"
                name="content"
                rows="8"
                placeholder="Write your article content here (minimum 10 characters)..."
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="form-input form-textarea"
                required
              />
            </div>

            <div className="editor-actions">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : editingPostId
                  ? 'Update Blog Post'
                  : 'Publish Blog Post'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Posts Management Section */}
      <div className="dashboard-posts-section">
        <div className="section-header">
          <div className="tabs-group">
            {isAdmin && (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                🛡️ All Platform Posts ({posts.length})
              </button>
            )}
            <button
              type="button"
              className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
              onClick={() => setActiveTab('my')}
            >
              📄 My Posts ({myPosts.length})
            </button>
          </div>
          <Link to="/" className="btn btn-text">
            View Public Feed →
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard posts...</p>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✍️</div>
            <h3>No posts to display</h3>
            <p>
              You haven&apos;t published any blog posts yet. Click the button
              below to write your first post!
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="btn btn-primary"
            >
              + Write Your First Post
            </button>
          </div>
        ) : (
          <div className="posts-grid">
            {displayedPosts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onEdit={handleStartEdit}
                onDelete={handleDeletePost}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
