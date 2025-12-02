const mongoose = require('mongoose');

const UserDetailsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    mobile: String,
    password: { type: String, required: true } 
},{
    collection: "UserInfor"
});

module.exports = mongoose.model("UserInfor", UserDetailsSchema);