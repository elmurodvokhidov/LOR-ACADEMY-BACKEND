const mongoose = require('mongoose');
const symptomSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'doctor' }],
        patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'patient' }],
    },
    { timestamps: true }
);
module.exports = mongoose.model('symptom', symptomSchema);