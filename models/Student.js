const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
    name: {type:String, default: "", required: true },
    email: {type:String, default: "" },
    mobile: {type:String, default: "" },
    course: {type:String, default: "" },
    message: {type:String, default: "" }
},{
        timestamps: true
});

module.exports = mongoose.model('Student', StudentSchema);