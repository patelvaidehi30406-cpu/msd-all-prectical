const mongoose = require('mongoose');
const Post = require('../models/Post');

/**
 * @desc    Get all blog posts (with optional search & category filter)
 * @route   GET /api/posts
 * @access  Public
 */
const getPosts = async (req, res) => {
  try {
    const { search, category, author } = req.query;
    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { content: regex }, { category: regex }];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (author && mongoose.Types.ObjectId.isValid(author)) {
      query.author = author;
    }

    const posts = await Post.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog posts.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single blog post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
const getPostById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog post ID format.',
      });
    }

    const post = await Post.findById(req.params.id).populate(
      'author',
      'name email role'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch the blog post.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new blog post
 * @route   POST /api/posts
 * @access  Private (Authenticated Users & Admins)
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a title and content for the blog post.',
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters long.',
      });
    }

    if (content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 10 characters long.',
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      category: category && category.trim() ? category.trim() : 'General',
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully!',
      post: populatedPost,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create blog post.',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a blog post
 * @route   PUT /api/posts/:id
 * @access  Private (Post Author OR Admin)
 */
const updatePost = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog post ID format.',
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Role-based access control: Only the post author or an admin can update
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only edit your own blog posts.',
      });
    }

    const { title, content, category } = req.body;

    if (title !== undefined && title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters long.',
      });
    }

    if (content !== undefined && content.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Content must be at least 10 characters long.',
      });
    }

    post.title = title ? title.trim() : post.title;
    post.content = content ? content.trim() : post.content;
    post.category = category ? category.trim() : post.category;

    await post.save();

    const updatedPost = await Post.findById(post._id).populate(
      'author',
      'name email role'
    );

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully!',
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update blog post.',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/posts/:id
 * @access  Private (Post Author OR Admin)
 */
const deletePost = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog post ID format.',
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found.',
      });
    }

    // Role-based access control: Only the post author or an admin can delete
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only delete your own blog posts.',
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog post.',
      error: error.message,
    });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};
