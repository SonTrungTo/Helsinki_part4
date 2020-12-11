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