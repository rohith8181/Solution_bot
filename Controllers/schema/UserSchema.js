const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    AccountId: { type: Number, required: true },
    user_name: { type: String, default: 'bot_user' },
    Credits: { type: Number, default: 1 },
    AnswerFormat: { type: String, default: "text" },
})

const User = mongoose.model('User_details', userSchema);

module.exports = User;