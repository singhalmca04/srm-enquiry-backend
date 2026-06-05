const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseName: { type: String, required: true },
    code: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', CourseSchema);