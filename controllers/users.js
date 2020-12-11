const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.post('/', async (req, res) => {
    const password = req.body.password;
    if (!password || password.length < 3) {
        return res.status(401).json({
            error: 'Password must be at least 3 characters long'
        });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
        username: req.body.username,
        name: req.body.name,
        password: hashedPassword
    });

    const savedUser = await user.save();

    return res.json(savedUser);
});

usersRouter.get('/', async (req, res) => {
    const users = await User.find({})
        .populate('blogs', { user: 0, likes: 0 });
    return res.json(users);
});

module.exports = usersRouter;