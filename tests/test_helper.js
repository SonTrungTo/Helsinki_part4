const Blog = require('../models/blog');
const User = require('../models/user');

const initialBlogs = [
    {
        title: 'Programming is easy',
        author: 'Son To',
        url: 'http://localhost:3000/',
        likes: 0
    },
    {
        title: 'We know nothing about intelligence',
        author: 'Michael Jordan',
        url: 'https://michael_jordan@berkeley.com',
        likes: 100
    }
];

const nonExistingId = async () => {
    const blog = new Blog({
        title: 'This blog will be deleted soon',
        author: 'Son To',
        url: 'Sayonara'
    });
    await blog.save();
    await blog.remove();

    return blog._id.toString();
};

const blogsInDB = async () => {
    const blogs = await Blog.find({});
    return blogs.map(blog => blog.toJSON());
};

const usersInDB = async () => {
    const users = await User.find({});
    return users.map(user => user.toJSON());
};

module.exports = {
    initialBlogs, nonExistingId, blogsInDB,
    usersInDB
};