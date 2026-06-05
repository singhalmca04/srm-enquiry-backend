const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://srmreact:srmreact@cluster0.z7gxty8.mongodb.net/srmenquiry?retryWrites=true&w=majority&appName=Cluster0', {})
.then((res)=> console.log("connected to db"))
.catch((err)=> console.log("Error occoured " + err));