const app = require('../app');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');
const User = require('../models/user');
const supertest = require('supertest');
const api = supertest(app);
const mongoose = require('mongoose');

beforeEach( async () => {
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('professional', 10);
    const user = new User({
        username: 'sonto',
        password: hashedPassword
    });

    await user.save();
});

describe('tests should fail with invalid username and password', () => {
    test('returns 400 if username is the same', async () => {
        const usersAtStart = await helper.usersInDB();

        const newUser = {
            username: 'sonto',
            name: 'Matti',
            password: '123456'
        };

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('`username` to be unique');

        const usersAtEnd = await helper.usersInDB();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('return 400 if username is too short', async () => {
        const usersAtStart = await helper.usersInDB();

        const newUser = {
            username: 's',
            password: '123'
        };

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        expect(result.body.error).toContain('`username` (`s`) is shorter than the minimum allowed length');

        const usersAtEnd = await helper.usersInDB();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('return 400 if username is missing', async () => {
        const usersAtStart = await helper.usersInDB();

        const newUser = {
            password: '123'
        };

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);
        expect(result.body.error).toContain('username is required');

        const usersAtEnd = await helper.usersInDB();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });

    test('return 401 if password missing or too short', async () => {
        const usersAtStart = await helper.usersInDB();

        const newUser = {
            username: 'mluukkai'
        };

        const result = await api.post('/api/users')
            .send(newUser)
            .expect(401)
            .expect('Content-Type', /application\/json/);
        expect(result.body.error).toContain('Password must be at least 3 characters long');

        const usersAtEnd = await helper.usersInDB();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
});

afterAll(() => {
    mongoose.connection.close();
});