const logger = require('./logger');

const requestLogger = (req, res, next) => {
    logger.info('Method: ', req.method);
    logger.info('Path:   ', req.path);
    logger.info('Body:   ', req.body);
    logger.info('--------------------');

    next();
};

const unknownEndpoints = (req, res) => {
    return res.status(404).json({ error: 'Unknown endpoints' });
};

const errorHandler = (err, req, res, next) => {
    logger.error(err.name, err.message);

    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'malformatted id' });
    } else if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: err.message
        });
    } else if (err) {
        return res.status(400).json({
            error: err.name + ': ' + err.message
        });
    }

    next(err);
};

module.exports = {
    requestLogger, unknownEndpoints, errorHandler
};