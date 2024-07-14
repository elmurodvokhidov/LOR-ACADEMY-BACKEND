const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        phoneNumber: { type: Number, required: true, unique: true },
        specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'symptom' },
        patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'patient' }],
    },
    { timestamps: true }
);
module.exports = mongoose.model('doctor', doctorSchema);