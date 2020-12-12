const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (req, res) => {
    const user = await User.findOne({ username: req.body.username });

    const password = user === null ? false :
        await bcrypt.compare(req.body.password, user.password);

    if (!(user && password)) {
        return res.status(401).json({
            error: 'Invalid username or password'
        });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.SECRET);

    return res.status(200).json({
        token,
        username: user.username,
        name: user.name
    });
});

module.exports = loginRouter;