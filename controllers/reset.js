const resetRouter = require('express').Router();
const User = require('../models/user');
const Blog = require('../models/blog');

resetRouter.post('/', async (req, res) => {
    await User.deleteMany({});
    await Blog.deleteMany({});

    return res.status(204).end();
});

module.exports = resetRouter;