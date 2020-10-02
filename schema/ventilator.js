const mongoose = require("mongoose")
var VentilatorsSchema = new mongoose.Schema({
    HID: Number,
    VID:Number,
    HOSPITAL:String,
    STATUS:String
    
  
   });
   module.exports=mongoose.model("ventilator",VentilatorsSchema)