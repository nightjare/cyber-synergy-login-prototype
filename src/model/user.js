const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    companyName:{type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    admin: { type: Number, default: 0 }
});

module.exports = mongoose.model("user", userSchema);