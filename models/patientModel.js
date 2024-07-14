const mongoose = require('mongoose');
const patientSchema = new mongoose.Schema(
    {
        fullname: { type: String, required: true },
        dateOfBirth: { type: String, required: true },
        gender: { type: String, required: true },
        passport: { type: String },
        email: { type: String },
        phoneNumber: { type: Number, required: true },
        symptom: { type: mongoose.Schema.Types.ObjectId, ref: 'symptom' },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'doctor' },
        discount: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
    },
    { timestamps: true }
);
module.exports = mongoose.model('patient', patientSchema);