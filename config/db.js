const mongoose = require('mongoose');

module.exports = function (app) {
    const port = process.env.PORT || 5000;

    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("MongoDb ga ulanish hosil qilindi...");
            app.listen(port, () => console.log(`${port} ni eshitishni boshladim...`));
        })
        .catch((err) => console.log("MongoDb ga ulanishda XATOLIK: " + err));
};