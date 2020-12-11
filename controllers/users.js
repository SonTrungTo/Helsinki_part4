const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

usersRouter.post('/', async (req, res) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const user = new User({
        username: req.body.username,
        name: req.body.name,
        password: hashedPassword
    });

    const savedUser = await user.save();

    return res.json(savedUser);
});

usersRouter.get('/', async (req, res) => {
    const users = await User.find({});
    return res.json(users);
});

module.exports = usersRouter;