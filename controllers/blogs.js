const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res) => {
    let blogs = await Blog.find({});
    return res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
    const newBlog = new Blog(req.body);

    const savedBlog = await newBlog.save();
    return res.status(201).json(savedBlog);
});

module.exports = blogsRouter;