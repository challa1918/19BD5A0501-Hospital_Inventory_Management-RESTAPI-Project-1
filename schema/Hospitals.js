const mongoose = require("mongoose")
var hospitalSchema=mongoose.Schema({
    HID:Number,
    Name:String,
    Address:String,
    Number_Of_Ventilators:Number,
    Contact:Number,
});

module.exports=mongoose.model("Hospitals",hospitalSchema)