const app = require('../app');
const supertest = require('supertest');
const helper = require('./test_helper');
const mongoose = require('mongoose');
const api = supertest(app);
const bcrypt = require('bcrypt');

const Blog = require('../models/blog');
const User = require('../models/user');

beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});

    for (const blog of helper.initialBlogs) {
        let blogObject = new Blog(blog);
        await blogObject.save();
    }

    const hashedPassword1 = await bcrypt.hash('pretty', 10);
    const hashedPassword2 = await bcrypt.hash('beautiful', 10);
    const user1 = new User({
        username: 'sonto',
        password: hashedPassword1
    });
    const user2 = new User({
        username: 'julia',
        password: hashedPassword2
    });

    await user1.save();
    await user2.save();
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

    const user1 = {
        username: 'sonto',
        password: 'pretty'
    };

    const loginResponse = await api.post('/api/login')
        .send(user1)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api.post('/api/blogs')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');
    expect(response.body).toHaveLength(helper.initialBlogs.length + 1);

    const blogsInDB = await helper.blogsInDB();
    const titles = blogsInDB.map(blog => blog.title);
    const userId = blogsInDB.map(blog => blog.user)[2].toString();
    const userOfBlog = await User.findById(userId);
    expect(titles).toContain('I am more famous than Jesus himself');
    expect(userOfBlog.username).toBe(loginResponse.body.username);
});

test('likes is default to 0', async () => {
    const newBlog = {
        title: 'Likes must default to 0',
        author: 'Son To',
        url: 'http://sonto.com'
    };

    const user1 = {
        username: 'sonto',
        password: 'pretty'
    };

    const loginResponse = await api.post('/api/login')
        .send(user1)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api.post('/api/blogs')
        .set('Authorization', `Bearer ${ loginResponse.body.token }`)
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

    const user1 = {
        username: 'sonto',
        password: 'pretty'
    };

    const loginResponse = await api.post('/api/login')
        .send(user1)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api.post('/api/blogs')
        .set('Authorization', `Bearer ${ loginResponse.body.token }`)
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

    const user1 = {
        username: 'sonto',
        password: 'pretty'
    };

    const loginResponse = await api.post('/api/login')
        .send(user1)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api.post('/api/blogs')
        .set('Authorization', `Bearer ${ loginResponse.body.token }`)
        .send(newBlog)
        .expect(400)
        .expect({ error: 'Blog validation failed: url: Url is required' })
        .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDB();

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

describe('remove a blog from bloglist', () => {
    test('blog is removed with 204 if id is valid', async () => {
        const user1 = {
            username: 'sonto',
            password: 'pretty'
        };

        const newBlog = {
            title: 'Will be deleted soon',
            author: 'Jack',
            url: 'www'
        };

        const loginResponse = await api.post('/api/login')
            .send(user1)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const blogResponse = await api.post('/api/blogs')
            .set('Authorization', `Bearer ${ loginResponse.body.token }`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        await api.delete(`/api/blogs/${blogResponse.body.id}`)
            .set('Authorization', `Bearer ${ loginResponse.body.token }`)
            .expect(204);

        const blogsAtEnd = await helper.blogsInDB();
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

        const titles = blogsAtEnd.map(blog => blog.title);
        expect(titles).not.toContain(newBlog.title);
    });

    test('delete returns code 404 if id does not exist, but valid', async () => {
        const validNonexistingId = await helper.nonExistingId();

        const user1 = {
            username: 'sonto',
            password: 'pretty'
        };

        const loginResponse = await api.post('/api/login')
            .send(user1)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        await api.delete(`/api/blogs/${validNonexistingId}`)
            .set('Authorization', `Bearer ${ loginResponse.body.token }`)
            .expect(404);

        const blogsInDB = await helper.blogsInDB();
        expect(blogsInDB).toHaveLength(helper.initialBlogs.length);
    });

    test('delete returns code 400 if id is invalid', async () => {
        const invalidId = 'Momoko1968Kikuchi';

        const user1 = {
            username: 'sonto',
            password: 'pretty'
        };

        const loginResponse = await api.post('/api/login')
            .send(user1)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        await api.delete(`/api/blogs/${invalidId}`)
            .set('Authorization', `Bearer ${ loginResponse.body.token }`)
            .expect(400);

        const blogsInDB = await helper.blogsInDB();
        expect(blogsInDB).toHaveLength(helper.initialBlogs.length);
    });
});

describe('update a blog from bloglist', () => {
    test('return code 200 if likes update successful', async () => {
        const blogsAtStart = await helper.blogsInDB();
        const chosenBlog = blogsAtStart[0];
        const newInfo = {
            likes: 1
        };

        await api.put(`/api/blogs/${chosenBlog.id}`)
            .send(newInfo)
            .expect(200)
            .expect('Content-Type', /application\/json/)
            .expect({ ...chosenBlog, likes: newInfo.likes });

        const blogsAtEnd = await helper.blogsInDB();
        const updatedLikes = blogsAtEnd.map(blog => blog.likes)[0];
        expect(updatedLikes).toBe(newInfo.likes);
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    });

    test('return code 404 if id is non-existant, but valid', async () => {
        const validNonexistingId = await helper.nonExistingId();
        const newInfo = {
            likes: 1
        };
        const blogsAtStart = await helper.blogsInDB();

        await api.put(`/api/blogs/${validNonexistingId}`)
            .send(newInfo)
            .expect(404);

        const blogsAtEnd = await helper.blogsInDB();
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    });

    test('return code 400 if id is rubbish', async () => {
        const invalidId = 'InvalidId';
        const newInfo = {
            likes: 1
        };
        const blogsAtStart = await helper.blogsInDB();

        await api.put(`/api/blogs/${invalidId}`)
            .send(newInfo)
            .expect(400);

        const blogsAtEnd = await helper.blogsInDB();
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length);
    });
});

describe('post a blog without a valid token', () => {
    test('return 401 if a token is not provided', async () => {
        const newBlog = {
            title: 'This post will not appear',
            url: 'Thank you'
        };

        await api.post('/api/blogs')
            .send(newBlog)
            .expect(401);

        const blogsAtEnd = await helper.blogsInDB();
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);

        const titles = blogsAtEnd.map(blog => blog.title);
        expect(titles).not.toContain(newBlog.title);
    });
});

afterAll(() => {
    mongoose.connection.close();
});