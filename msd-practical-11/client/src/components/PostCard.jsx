import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PostCard = ({ post, onEdit, onDelete }) => {
  const { canManagePost } = useAuth();
  const hasPermission = canManagePost(post);

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const excerpt =
    post.content.length > 160
      ? `${post.content.substring(0, 160)}...`
      : post.content;

  return (
    <article className="post-card">
      <div className="post-card-header">
        <span className="category-pill">{post.category || 'General'}</span>
        <span className="post-date">{formattedDate}</span>
      </div>

      <h3 className="post-card-title">
        <Link to={`/posts/${post._id}`}>{post.title}</Link>
      </h3>

      <p className="post-card-excerpt">{excerpt}</p>

      <div className="post-card-footer">
        <div className="author-info">
          <div className="author-avatar">
            {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <p className="author-name">
              {post.author?.name || 'Unknown Author'}
            </p>
            {post.author?.role && (
              <span
                className={`role-badge role-badge-xs ${
                  post.author.role === 'admin' ? 'role-admin' : 'role-user'
                }`}
              >
                {post.author.role}
              </span>
            )}
          </div>
        </div>

        <div className="post-card-actions">
          <Link to={`/posts/${post._id}`} className="btn btn-text">
            Read More →
          </Link>
          {hasPermission && (onEdit || onDelete) && (
            <div className="owner-actions">
              {onEdit && (
                <button
                  type="button"
                  className="btn btn-secondary btn-xs"
                  onClick={() => onEdit(post)}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  className="btn btn-danger btn-xs"
                  onClick={() => onDelete(post._id)}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default PostCard;
