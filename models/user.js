const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: 'username is required',
        unique: true,
        minlength: 3
    },
    name: String,
    password: {
        type: String,
        required: 'hashed_password is required' // This is optional, as I don't want to forget to save hashed password
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
});

userSchema.plugin(uniqueValidator);
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
        delete returnedObject.password;
    }
});

module.exports = mongoose.model('User', userSchema);