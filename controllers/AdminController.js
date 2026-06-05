const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Student = mongoose.model('Student');
const Course = mongoose.model('Course');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const client = new OAuth2Client('11697718537-dqjd46buavim9ufcdipmvpfe3ksvt5lk.apps.googleusercontent.com');

const uploadPics = async (req, res) => {
    try {
        res.json({ message: 'Image uploaded successfully!' });
    } catch (error) {
        console.error(error);
        res.status(404).send(error + ' Image not found');
    }
}

const loginUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        // compare password
        let data = await User.findOne({ name }, { password: 1 });
        if (!data) {
            return res.status(400).json({ message: "Invalid name" });
        }
        const isMatch = await bcrypt.compare(password, data.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jwt.sign(
            { id: "11111", name: "Abhishek", section: "A", branch: "CSE-DS", semester: "6" },
            "secretKey", // use env variable in production
            { expiresIn: "1h" }
        );
        res.json({ message: "Login successful", token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Login error" });
    }
}

const signupUser = async (req, res) => {
    try {
        const { name, password } = req.body;
        console.log(req.query.age, " age");
        const hashedPassword = await bcrypt.hash(password, 10);
        let user = new User({ name, password: hashedPassword });
        await user.save();
        res.status(201).json({ data: user, message: "User registered successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in signup" });
        // $2b$10$daUwhwxhu6R1TBrCvaAOzeODNCqaiEyF855dDik4qBfRlizuT.cPa
    }
}


const getUser = async (req, res) => {
    res.status(200).send({
        message: "Protected data",
        user: req.user
    });
}

const sendMail = async (req, res) => {
    try {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "singhalmca04@gmail.com",
                pass: 'sdwp yrce hiya yojm'
            }
        });
        const info = await transport.sendMail({
            from: "Test Mail from Vinay singhalmca04@gail.com",
            to: 'vinayk@srmist.edu.in',
            subject: 'Subject -- DSA Project Presentation',
            text: "First Batch presetation on 9th April"
        });
        res.status(200).send({ data: info, msg: "Email send" });
    } catch (err) {
        console.log("Error " + err);
        res.status(500).send({ msg: "Internal server error" });
    }
}

const changePassword = async (req, res) => {
    try {
        const { name, newpassword } = req.body;
        const newHashedPassword = await bcrypt.hash(newpassword, 10);
        let data = await User.findOneAndUpdate({ name }, { $set: { password: newHashedPassword } }, { returnDocument: 'after' });
        res.status(200).send({ message: "Password changed", data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error in signup" });
    }

}

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Generate JWT iejb ibvn ehid qhiu
        const appToken = jwt.sign(
            { id: user._id },
            "secretkey",
            { expiresIn: "1h" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: appToken,
            user
        });

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: "Google login failed" });
    }
};
const sendEnquiry = async (req, res) => {
    try {
        const { name, email, mobile, course, message } = req.body;
        let enquiry = await Student.create({ name, email, mobile, course, message });
        if(!enquiry) {
            return res.status(500).json({ success: false, message: "Failed to save enquiry" });
        }
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "singhalmca04@gmail.com",
                pass: 'sdwp yrce hiya yojm'
            }
        });
        let courseData = await Course.findOne({ code: course });
        await transporter.sendMail({
            from: "Admission Enquiry From SRM singhalmca04@gail.com",
            to: "vinayk@yopmail.com",
            subject: "New Website Enquiry",
            html: `<h3 style='color: #333; text-align: center; font-size: 24px; background-color: #f0f0f0; padding: 10px;'>New Enquiry</h3>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Mobile:</b> ${mobile}</p>
                <p><b>Course:</b> ${courseData ? courseData.courseName : course}</p>
                <p><b>Message:</b> ${message}</p>`
        });
        res.status(200).json({success: true, message: "Enquiry sent successfully", enquiry});
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to send enquiry" });
    }
};


module.exports = {
    uploadPics,
    loginUser,
    signupUser,
    getUser,
    googleLogin,
    changePassword,
    sendMail,
    sendEnquiry
};