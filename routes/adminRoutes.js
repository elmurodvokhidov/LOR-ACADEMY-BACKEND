const express = require('express');
const router = express.Router();
const {
    loginAdmin,
    getAdmin,
    createDoctor,
    getAllDoctors,
    deleteDoctor,
    updateDoctor,
    getAllSymptoms,
    getSymptom,
    createSymptom,
    updateSymptom,
    deleteSymptom,
    getDoctor,
    getAllPatient,
    getPatient,
    markSeen,
    updatePatient,
    deletePatient,
    createPatient,
    deleteManyPatients,
    exportToExcel,
    updateAdmin,
    updateAdminPassword
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

// admin
router.post('/login', loginAdmin);
router.get('/info', auth, getAdmin);
router.put('/:id', auth, updateAdmin);
router.put('/password/:id', auth, updateAdminPassword);

// doctor
router.get('/doctors', getAllDoctors);
router.get('/doctors/:id', getDoctor);
router.post('/create-doctor', auth, createDoctor);
router.put('/doctors/:id', auth, updateDoctor);
router.delete('/doctors/:id', auth, deleteDoctor);

// patient
router.post('/create-patient', auth, createPatient);
router.get('/patients', getAllPatient);
router.get('/patients/:id', getPatient);
router.put('/patients/:id', auth, updatePatient);
router.delete('/patients/:id', auth, deletePatient);
router.delete("/delete-many-patients", auth, deleteManyPatients);

// symptom
router.get('/symptoms', getAllSymptoms);
router.get('/symptoms/:id', getSymptom);
router.post('/create-symptom', auth, createSymptom);
router.put('/symptoms/:id', auth, updateSymptom);
router.delete('/symptoms/:id', auth, deleteSymptom);

// excel
router.post('/export-to-excel', exportToExcel);

module.exports = router;