// ---------- Set Requirements ---------- //

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// ---------- User Schema ---------- //

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// ---------- Add password from passport local to Schema ---------- //

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);