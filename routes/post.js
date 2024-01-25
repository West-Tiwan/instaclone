const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/instagram");
const userSchema = mongoose.Schema({
    picture: String,
    caption: String,
    username: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    date: {
        type: Date,
        default: Date.now,
    },
    like: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'user',
        }
    ]
});
module.exports = mongoose.model("post", userSchema);