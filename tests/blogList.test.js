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

test('new blog is created to /api/blogs', async () => {
    const newBlog = {
        title: 'I am more famous than Jesus himself',
        author: 'Son To',
        url: 'http://sonto.com/',
        likes: 999
    };

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);

    const blogsInDB = await helper.blogsInDB();
    const titles = blogsInDB.map(blog => blog.title);
    expect(titles).toContain('I am more famous than Jesus himself');
});

test('likes is default to 0', async () => {
    const newBlog = {
        title: 'Likes must default to 0',
        author: 'Son To',
        url: 'http://sonto.com'
    };

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    const likes = response.body.map(response => response.likes);
    const newLike = likes[likes.length - 1];
    expect(newLike).toBe(0);
});

test('title is required', async () => {
    const newBlog = {
        author: 'Son To',
        url: 'title is missing'
    };

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)
        .expect({ error: 'Blog validation failed: title: Title is required' })
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDB();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

test('url is required', async () => {
    const newBlog = {
        title: 'url is missing',
        author: 'Son To'
    };

    await api.post('/api/blogs')
        .send(newBlog)
        .expect(400)
        .expect({ error: 'Blog validation failed: url: Url is required' })
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDB();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

describe('remove a blog from bloglist', () => {
    test('blog is removed with 204 if id is valid', async () => {
        const blogInDB = await helper.blogsInDB();
        const blogToRemove = blogInDB[0];

        await api.delete(`/api/blogs/${blogToRemove.id}`)
            .expect(204);

        const blogsAtEnd = await helper.blogsInDB();
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

        const titles = blogsAtEnd.map(blog => blog.title);
        expect(titles).not.toContain(blogToRemove.title);
    });

    test('delete returns code 404 if id does not exist, but valid', async () => {
        const validNonexistingId = await helper.nonExistingId();

        await api.delete(`/api/blogs/${validNonexistingId}`)
            .expect(404);

        const blogsInDB = await helper.blogsInDB();
        expect(blogsInDB).toHaveLength(helper.initialBlogs.length);
    });

    test('delete returns code 400 if id is invalid', async () => {
        const invalidId = 'Momoko1968Kikuchi';

        await api.delete(`/api/blogs/${invalidId}`)
            .expect(400);

        const blogsInDB = await helper.blogsInDB();
        expect(blogsInDB).toHaveLength(helper.initialBlogs.length);
    });
});

afterAll(() => {
    mongoose.connection.close();
});