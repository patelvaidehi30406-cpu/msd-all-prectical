import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import AlertMessage from '../components/AlertMessage';

const CATEGORIES = [
  'All',
  'General',
  'Web Development',
  'MERN Stack',
  'JavaScript',
  'Backend & Security',
  'Career & Tutorials',
];

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = useCallback(async (search = '', category = 'All') => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;

      const response = await api.get('/posts', { params });
      setPosts(response.data.posts || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load blog posts. Please make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(searchQuery, selectedCategory);
  }, [fetchPosts, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts(searchQuery, selectedCategory);
  };

  const handleEdit = (post) => {
    navigate(`/dashboard?edit=${post._id}`);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      setError('');
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((item) => item._id !== postId));
      setSuccessMsg('Blog post deleted successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to delete the blog post.'
      );
    }
  };

  return (
    <div className="page-wrapper">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="container hero-content">
          <span className="hero-eyebrow">Practical 11 • MERN Stack Application</span>
          <h1>Discover, Write & Manage Engaging Tech Articles</h1>
          <p>
            A full-featured Blog Management System built with MongoDB Atlas,
            Express.js, React (Vite), and Node.js — featuring JWT Authentication
            and Role-Based Access Control.
          </p>
          <div className="hero-cta">
            {isAuthenticated ? (
              <Link to="/dashboard?create=true" className="btn btn-primary">
                ✍️ Write a Blog Post
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="container main-section">
        {/* Search and Category Filter Bar */}
        <div className="filter-bar">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search posts by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchQuery('');
                  fetchPosts('', selectedCategory);
                }}
              >
                Clear
              </button>
            )}
          </form>

          <div className="category-tabs">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-tab ${
                  selectedCategory === category ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <AlertMessage
          type="error"
          message={error}
          onClose={() => setError('')}
        />
        <AlertMessage
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
        />

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading blog posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No blog posts found</h3>
            <p>
              {searchQuery || selectedCategory !== 'All'
                ? 'Try clearing your search or selecting a different category.'
                : 'Be the first to publish an article on DevPulse!'}
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard?create=true" className="btn btn-primary">
                Create First Post
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login to Create a Post
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="section-header">
              <h2>Latest Articles ({posts.length})</h2>
            </div>
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
