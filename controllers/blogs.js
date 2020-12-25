const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (req, res) => {
    let blogs = await Blog.find({})
        .populate('user', { username: 1, name: 1 });
    return res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!req.token || !decodedToken.id) {
        return res.status(401).json({
            error: 'missing or invalid token'
        });
    }

    const user = await User.findOne({ _id: decodedToken.id });
    req.body.user = user._id;
    const newBlog = new Blog(req.body);

    const savedBlog = await newBlog.save();
    const populatedBlog = await Blog.findById(savedBlog._id)
        .populate('user', { username: 1, name: 1 });
    user.blogs = user.blogs.concat(populatedBlog._id);
    await user.save();
    return res.status(201).json(populatedBlog);
});

blogsRouter.delete('/:blogId', async (req, res) => {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!req.token || !decodedToken.id) {
        return res.status(401).json({
            error: 'missing or invalid token'
        });
    }

    const loggedInUserId = decodedToken.id;
    const targetBlog = await Blog.findById(req.params.blogId);
    if (!targetBlog) return res.status(404).end();
    if (targetBlog.user.toString() !== loggedInUserId.toString()) {
        return res.status(403).json({
            error: 'Action is forbidden'
        });
    }

    await targetBlog.remove();
    return res.status(204).end();
});

blogsRouter.put('/:blogId', async (req, res) => {
    const updatedBlog = await Blog.findByIdAndUpdate( req.params.blogId, {
        likes: req.body.likes
    }, { new: true, runValidators: true })
        .populate('user', { username: 1, name: 1 });
    if (updatedBlog) {
        return res.json(updatedBlog);
    } else {
        return res.status(404).end();
    }
});

blogsRouter.post('/:blogId/comments', async (req, res) => {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!req.token || !decodedToken.id) {
        return res.status(401).json({
            error: 'missing or invalid token'
        });
    }

    const targetBlog = await Blog.findByIdAndUpdate( req.params.blogId, {
        $push: { comments: req.body.comment }
    }, { new: true, runValidators: true })
        .populate('user', { username: 1, name: 1 });
    if (targetBlog) {
        return res.json(targetBlog);
    } else {
        return res.status(404).end();
    }
});

module.exports = blogsRouter;