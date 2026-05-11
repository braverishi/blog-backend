const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.list = async (req, res, next) => {
  try {
    const { search, tag, author, page = 1, limit = 10 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };
    if (tag) query.tags = tag.toLowerCase();
    if (author) query.author = author;

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(query),
    ]);
    res.json({ posts, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email bio');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ post });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, tags = [], coverImage = '' } = req.body;
    const post = await Post.create({
      title,
      content,
      tags: Array.isArray(tags)
        ? tags
        : String(tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
      coverImage,
      author: req.user._id,
    });
    const populated = await post.populate('author', 'name email');
    res.status(201).json({ post: populated });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to edit this post' });
    }

    const { title, content, tags, coverImage } = req.body;
    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }
    await post.save();
    const populated = await post.populate('author', 'name email');
    res.json({ post: populated });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to delete this post' });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const userId = req.user._id.toString();
    const idx = post.likes.findIndex((u) => u.toString() === userId);
    if (idx >= 0) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx < 0 });
  } catch (err) {
    next(err);
  }
};
