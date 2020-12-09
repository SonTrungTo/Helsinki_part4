const express = require('express');
require('express-async-errors');
const app = express();
const cors = require('cors');
const blogsRoute = require('./controllers/blogs');
const logger = require('./utils/logger');
const config = require('./utils/config');
const middleware = require('./utils/middleware');
const mongoose = require('mongoose');

logger.info('Connecting to', config.MONGO_URI);

mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
})
    .then(() => {
        logger.info('connected to MongoDB');
    })
    .catch(error => {
        logger.error('Unable to connect to MongoDB:', error.message);
    });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/blogs', blogsRoute);

app.use(middleware.unknownEndpoints);
app.use(middleware.errorHandler);

module.exports = app;