require('dotenv').config();

const config = {
    MONGO_URI: process.env.NODE_ENV === 'test' ?
        process.env.TEST_MONGO_URI : process.env.MONGO_URI,
    PORT: process.env.PORT
};

module.exports = config;