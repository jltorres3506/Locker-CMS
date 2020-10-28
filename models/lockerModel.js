const mongoose = require("mongoose");
 
 const lockerSchema = {
    number: {type: Number, required: [true,"Number field is Required"]},
    combination: String,
    position:{type: String, required :true},
    firstName: String,
    lastName: String,
    dateAssigned:String,
    comments:String
    
 };
 
exports.locker = mongoose.model("Locker",lockerSchema);