const express = require('express');
const cors = require('cors');

module.exports = function (app) {
    // middleware
    app.use(cors());
    app.use(express.json());

    // routes
    app.use('/api/admin', require('../routes/adminRoutes'));
};