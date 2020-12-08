const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', (req, res, next) => {
    Blog.find({})
        .then(blogs => {
            return res.json(blogs);
        })
        .catch(error => next(error));
});

blogsRouter.post('/', (req, res, next) => {
    const newBlog = new Blog(req.body);

    newBlog.save()
        .then(blog => {
            return res.status(201).json(blog);
        })
        .catch(error => next(error));
});

module.exports = blogsRouter;