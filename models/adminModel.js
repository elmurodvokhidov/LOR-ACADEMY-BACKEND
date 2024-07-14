const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        phoneNumber: { type: Number, required: true, unique: true },
        password: { type: String, required: true },
    },
    { timestamps: true }
);
module.exports = mongoose.model('admin', adminSchema);