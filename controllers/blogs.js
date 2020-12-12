const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getTokenFrom = req => {
    const authorization = req.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7);
    }
    return null;
};

blogsRouter.get('/', async (req, res) => {
    let blogs = await Blog.find({})
        .populate('user', { username: 1, name: 1 });
    return res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id) {
        return res.status(401).json({
            error: 'missing or invalid token'
        });
    }

    const user = await User.findOne({ _id: decodedToken.id });
    req.body.user = user._id;
    const newBlog = new Blog(req.body);

    const savedBlog = await newBlog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();
    return res.status(201).json(savedBlog);
});

blogsRouter.delete('/:blogId', async (req, res) => {
    const targetBlog = await Blog.findById(req.params.blogId);

    if (targetBlog) {
        await targetBlog.remove();
    } else {
        return res.status(404).end();
    }
    return res.status(204).end();
});

blogsRouter.put('/:blogId', async (req, res) => {
    const updatedBlog = await Blog.findByIdAndUpdate( req.params.blogId, {
        likes: req.body.likes
    }, { new: true, runValidators: true });
    if (updatedBlog) {
        return res.json(updatedBlog);
    } else {
        return res.status(404).end();
    }
});

module.exports = blogsRouter;