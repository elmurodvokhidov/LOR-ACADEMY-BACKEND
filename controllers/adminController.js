const Admin = require('../models/adminModel');
const Doctor = require('../models/doctorModel');
const Patient = require('../models/patientModel');
const Symptom = require('../models/symptomModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');

// admin
const loginAdmin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        const admin = await Admin.findOne({ phoneNumber });
        if (!admin) return res.status(404).json({ message: 'Admin topilmadi' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(500).json({ message: 'Parol xato' });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ data: admin, token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.authId);
        if (!admin) return res.status(404).json({ message: 'Admin topilmadi' });
        res.status(200).json({ data: admin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateAdmin = async (req, res) => {
    try {
        const { fullname, phoneNumber } = req.body;
        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, { fullname, phoneNumber }, { new: true });
        if (!updatedAdmin) return res.status(404).json({ message: "Admin topilmadi" });

        res.status(200).json({ data: updatedAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateAdminPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const foundAdmin = await Admin.findById(req.params.id);
        if (!foundAdmin) return res.status(404).json({ message: "Admin topilmadi" });
        const hashedPassword = await bcrypt.hash(password, 10);
        foundAdmin.password = hashedPassword;
        await foundAdmin.save();

        res.status(200).json({ data: foundAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// doctor
const createDoctor = async (req, res) => {
    try {
        const existingDoctor = await Doctor.findOne({ phoneNumber });
        if (existingDoctor) return res.status(500).json({ message: "Telefon raqami allaqachon mavjud!" });

        const newDoctor = new Doctor(req.body);
        const foundSymptom = await Symptom.findById(specialty);
        foundSymptom.doctors.push(newDoctor._id);
        await foundSymptom.save();
        await newDoctor.save();

        res.status(201).json({ data: newDoctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateDoctor = async (req, res) => {
    try {
        const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDoctor) return res.status(404).json({ message: "Shifokor topilmadi" });

        res.status(200).json({ data: updatedDoctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id)
            .populate("specialty")
            .populate("patients");
        if (!doctor) return res.status(404).json({ message: 'Shifokor topilmadi' });
        res.json({ data: doctor });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find()
            .populate("specialty")
            .populate("patients");
        res.status(200).json({ data: doctors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteDoctor = async (req, res) => {
    try {
        const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
        if (!deletedDoctor) return res.status(404).json({ message: "Shifokor topilmadi" });
        const symptom = await Symptom.findOne({ doctors: deletedDoctor._id });
        if (symptom) {
            symptom.doctors.pull(deletedDoctor._id);
            await symptom.save();
        };
        return res.status(200).json({ message: "Muvoffaqiyatli o'chirildi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// patient
const createPatient = async (req, res) => {
    try {
        const { symptom, doctor } = req.body;
        const foundSymptom = await Symptom.findById(symptom);
        const newPatient = new Patient(req.body);
        foundSymptom.patients.push(newPatient._id);
        const discountPrice = Math.round((foundSymptom.price / 100) * newPatient.discount);
        newPatient.amount = foundSymptom.price - discountPrice;
        const foundDoc = await Doctor.findById(doctor);
        foundDoc.patients.push(newPatient._id);
        await foundSymptom.save();
        await foundDoc.save();
        await newPatient.save();
        await newPatient.populate("doctor");
        await newPatient.populate("symptom");

        res.status(201).json({ data: newPatient });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllPatient = async (req, res) => {
    try {
        const patient = await Patient.find()
            .populate("doctor")
            .populate({
                path: "symptom",
                populate: [
                    { path: "doctors", model: "doctor" },
                    { path: "patients", model: "patient" },
                ]
            });
        if (!patient) return res.json({ message: 'Bemor topilmadi' });
        res.status(200).json({ data: patient });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getPatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id)
            .populate("doctor")
            .populate({
                path: "symptom",
                populate: [
                    { path: "doctors", model: "doctor" },
                    { path: "patients", model: "patient" },
                ]
            });
        if (!patient) return res.status(404).json({ message: 'Bemor topilmadi' });
        res.status(200).json({ data: patient });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updatePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const {
            fullname,
            dateOfBirth,
            gender,
            phoneNumber,
            symptom,
            doctor,
            discount,
            passport,
            email,
        } = req.body;

        const foundPatient = await Patient.findById(patientId);
        if (!foundPatient) return res.status(404).json({ message: "Bemor topilmadi" });

        foundPatient.fullname = fullname;
        foundPatient.dateOfBirth = dateOfBirth;
        foundPatient.gender = gender;
        foundPatient.phoneNumber = phoneNumber;
        foundPatient.passport = passport;
        foundPatient.email = email;

        const foundSymptom = await Symptom.findById(symptom);
        const foundDoctor = await Doctor.findById(doctor);

        if (foundPatient.symptom.toString() !== symptom) {
            if (foundPatient.doctor.toString() === doctor) return res.status(500).json({ message: "Iltimos shifokorni tanglang" });
            await Symptom.updateOne({ patients: patientId }, { $pull: { patients: patientId } });
            foundSymptom.patients.push(patientId);
            await foundSymptom.save();
            const discountPrice = Math.round((foundSymptom.price / 100) * discount);
            foundPatient.amount = foundSymptom.price - discountPrice;
            foundPatient.symptom = symptom;
        }

        if (foundPatient.doctor.toString() !== doctor) {
            await Doctor.updateOne({ patients: patientId }, { $pull: { patients: patientId } });
            foundDoctor.patients.push(patientId);
            foundPatient.doctor = doctor;
            await foundDoctor.save();
        }

        if (foundPatient.discount !== discount) {
            const discountPrice = Math.round((foundSymptom.price / 100) * discount);
            foundPatient.amount = foundSymptom.price - discountPrice;
            foundPatient.discount = discount;
        }

        await foundPatient.save();
        res.status(200).json({ data: foundPatient });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deletePatient = async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (!deletedPatient) return res.status(404).json({ message: "Bemor topilmadi" });
        const symptom = await Symptom.findOne({ patients: deletedPatient._id });
        if (symptom) {
            symptom.patients.pull(deletedPatient._id);
            await symptom.save();
        };
        const doctor = await Doctor.findOne({ patients: deletedPatient._id });
        if (doctor) {
            doctor.patients.pull(deletedPatient._id);
            await doctor.save();
        };

        res.status(200).json({ message: "Muvoffaqiyatli o'chirildi" });
    } catch (error) {
        res.statu(500).json({ message: error.message });
    }
};
const deleteManyPatients = async (req, res) => {
    try {
        const { patientIds } = req.body;

        for (const patientId of patientIds) {
            const deletedPatient = await Patient.findByIdAndDelete(patientId);
            if (!deletedPatient) return res.status(404).json({ message: "Bemor topilmadi" });
            const symptom = await Symptom.findOne({ patients: deletedPatient._id });
            if (symptom) {
                symptom.patients.pull(deletedPatient._id);
                await symptom.save();
            };
            const doctor = await Doctor.findOne({ patients: deletedPatient._id });
            if (doctor) {
                doctor.patients.pull(deletedPatient._id);
                await doctor.save();
            };
        };

        res.status(200).json({ message: "Tanlangan bemorlar muvaffaqiyatli o'chirildi!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// symptom
const createSymptom = async (req, res) => {
    try {
        const { name, price } = req.body;

        const existingSymptom = await Doctor.findOne({ name });
        if (existingSymptom) return res.status(500).json({ message: "Already exist" });

        const newSymptom = new Symptom({ name, price });
        await newSymptom.save();

        res.status(200).json({ data: newSymptom });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateSymptom = async (req, res) => {
    try {
        const { name, price } = req.body;

        const updatedSymptom = await Symptom.findByIdAndUpdate(req.params.id, { name, price }, { new: true });
        if (!updatedSymptom) return res.status(404).json({ message: "Ma'lumot topilmadi" });

        res.status(200).json({ data: updatedSymptom });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getAllSymptoms = async (req, res) => {
    try {
        const symptoms = await Symptom.find()
            .populate({
                path: "doctors",
                populate: [
                    { path: "patients", model: "patient" },
                    { path: "specialty", model: "symptom" },
                ]
            })
            .populate({
                path: "patients",
                populate: [
                    { path: "symptom", model: "symptom" },
                    { path: "doctor", model: "doctor" },
                ]
            });
        res.status(200).json({ data: symptoms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getSymptom = async (req, res) => {
    try {
        const symptom = await Symptom.findById(req.params.id);
        if (!symptom) return res.status(404).json({ message: "Ma'lumot topilmadi" })
            .populate("doctors")
            .populate("patients");
        res.status(200).json({ data: symptom });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteSymptom = async (req, res) => {
    try {
        const deletedSymptom = await Symptom.findByIdAndDelete(req.params.id);
        if (!deletedSymptom) return res.status(404).json({ message: "Ma'lumot topilmadi" });
        return res.status(200).json({ message: "Doctor has been deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// excel
const exportToExcel = async (req, res) => {
    try {
        const { filteredSymptoms, totalPatients, totalPayment, groupedPatients } = req.body;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reports');

        // Header rows
        const header1 = ["Umumiy kelgan bemorlar soni", "", "To'lov so'mmasi (so'mda)", "Shundan"];
        const header2 = ["", "", "", ...filteredSymptoms.flatMap(symptom => Array(symptom.doctors.length * 2).fill(symptom.name))];
        const header3 = ["", "", "", ...filteredSymptoms.flatMap(symptom => symptom.doctors.flatMap(doctor => [doctor.fullname, doctor.fullname]))];
        const header4 = ["", "", "", ...filteredSymptoms.flatMap(symptom => symptom.doctors.flatMap(() => ["soni", "so'mmasi"]))];

        const totalsRow = [
            "Jami",
            totalPatients,
            totalPayment.toLocaleString(),
            ...filteredSymptoms.flatMap(symptom => symptom.doctors.flatMap(doctor => [
                doctor.patients.length || 0,
                doctor.patients.reduce((total, patient) => total + (patient.amount || 0), 0).toLocaleString()
            ]))
        ];

        const groupedRows = Object.keys(groupedPatients).map(date => [
            date,
            groupedPatients[date].length,
            groupedPatients[date].reduce((sum, patient) => sum + (patient.amount || 0), 0).toLocaleString(),
            ...filteredSymptoms.flatMap(symptom => symptom.doctors.flatMap(doctor => [
                groupedPatients[date].filter(item => item.doctor._id === doctor._id).length,
                groupedPatients[date].filter(item => item.doctor._id === doctor._id)
                    .reduce((sum, patient) => sum + (patient.amount || 0), 0).toLocaleString()
            ]))
        ]);

        const data = [
            header1,
            header2,
            header3,
            header4,
            totalsRow,
            ...groupedRows
        ];

        // Add rows to worksheet
        data.forEach((row, rowIndex) => {
            const excelRow = worksheet.addRow(row);
            excelRow.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'medium' },
                    left: { style: 'medium' },
                    bottom: { style: 'medium' },
                    right: { style: 'medium' }
                };
            });
        });

        // Merging cells
        worksheet.mergeCells('A1:B4');
        worksheet.mergeCells('C1:C4');
        worksheet.mergeCells(1, 4, 1, 3 + (filteredSymptoms.flatMap(symptom => symptom.doctors).length * 2));

        let colIndex = 4;
        filteredSymptoms.forEach(symptom => {
            const numDoctors = symptom.doctors.length;
            worksheet.mergeCells(2, colIndex, 2, colIndex + numDoctors * 2 - 1);
            colIndex += numDoctors * 2;
        });

        colIndex = 4;
        filteredSymptoms.forEach(symptom => {
            symptom.doctors.forEach(doctor => {
                worksheet.mergeCells(3, colIndex, 3, colIndex + 1);
                colIndex += 2;
            });
        });

        // Adjust column widths
        worksheet.columns.forEach((column, index) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = maxLength + 2;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error });
    }
};


module.exports = {
    loginAdmin,
    getAdmin,
    createDoctor,
    getDoctor,
    getAllDoctors,
    deleteDoctor,
    updateDoctor,
    createSymptom,
    updateSymptom,
    getAllSymptoms,
    getSymptom,
    deleteSymptom,
    createPatient,
    getPatient,
    getAllPatient,
    updatePatient,
    deletePatient,
    deleteManyPatients,
    exportToExcel,
    updateAdmin,
    updateAdminPassword,
};