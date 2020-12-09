const app = require('../app');
const supertest = require('supertest');
const helper = require('./test_helper');
const mongoose = require('mongoose');
const api = supertest(app);

const Blog = require('../models/blog');

beforeEach(async () => {
    await Blog.deleteMany({});

    for (const blog of helper.initialBlogs) {
        let blogObject = new Blog(blog);
        await blogObject.save();
    }
});

test('all blogs are returned as JSON', async () => {
    await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
});

test('a specific title is returned in the blog', async () => {
    const response = await api.get('/api/blogs');

    const titles = response.body.map(response => response.title);
    expect(titles).toContain('Programming is easy');
});

test('id exists', async () => {
    const response = await api.get('/api/blogs');

    const ids = response.body.map(blog => blog.id);
    ids.forEach(id => {
        expect(id).toBeDefined();
    });
});

afterAll(() => {
    mongoose.connection.close();
});