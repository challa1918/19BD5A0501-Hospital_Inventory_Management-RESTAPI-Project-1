
   var express = require("express");
   var app = express();
   var port = 3000;
   var jwt=require("jsonwebtoken");
   var path=require("path")
   var mongoose = require("mongoose");
   var Hospitals=require("./schema/Hospitals");
   var Ventilator = require("./schema/ventilator");
   var bodyParser = require('body-parser');
   var user={username:"admin",password:"123",token:"none"}

   mongoose.Promise = global.Promise;
   mongoose.connect("mongodb://localhost:27017/Hospital_Management",{useUnifiedTopology:true,useNewUrlParser:true});
   

   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({ extended: true }));

   app.set('views', path.join(__dirname, 'views'));
   app.set("view engine", "ejs");
      
   app.get("/logout",(req, res)=>{
      user.token="none";
      console.log("User Logged Out")
      res.sendFile(__dirname + "/html/login.html"); 
   });
   app.get("/", (req, res) => {
   res.sendFile(__dirname + "/html/login.html");   
   });

   app.post("/login", (req, res) => {
         var userdata=req.body;
         if(userdata.username==user.username && userdata.password==user.password){
         const token=jwt.sign({userdata},userdata.password,{expiresIn:'24h'});
         console.log("");
         console.log("User Logged In Token Generated: "+token)
         console.log("");
         user.token=token
         
         res.setHeader("authorization",'Bearer '+token);
         res.sendFile(__dirname + "/html/index.html"); 
         }else{
            res.sendFile(__dirname + "/html/unauthorised.html");
         }
      });

   app.get("/redirect",(req, res)=>{
      res.sendFile(__dirname + "/html/index.html"); 
   }) ;  
   app.use("/result", (req, res) => {
      res.sendFile(__dirname + "/html/Taskdone.html");
      });

   app.use("/addvent",checkToken ,(req, res)=>{
      res.sendFile(__dirname + "/html/AddVentilator.html");
   });

   app.use("/addhosp",checkToken ,(req, res)=>{
      res.sendFile(__dirname + "/html/AddHospital.html");
   });
   
   app.use("/searchhosp",checkToken ,(req, res)=>{
      res.sendFile(__dirname + "/html/SearchHospital.html");
   });

   app.use("/searchvent",checkToken ,(req, res)=>{
      res.sendFile(__dirname + "/html/SearchVent.html");
   });

   app.use("/searchventhosp",checkToken ,(req, res)=>{
      res.sendFile(__dirname + "/html/SearchVentHosp.html");
   });
  
   app.use("/updatevent",checkToken ,(req, res)=>{
      res.sendFile(__dirname + "/html/UpdateVent.html");
   });

   app.use("/deletevent",checkToken ,(req, res)=>{
      res.sendFile(__dirname + "/html/DeleteVent.html");
   });

   app.post("/insertvent",checkToken , (req, res) => {
      
     
    var myData = new Ventilator(req.body);
    myData.save()
    .then(item => {
      Hospitals.updateOne({HID: req.body.HID},{$inc:{Number_Of_Ventilators:1}},(req, res)=>{
         console.log("Ventilator added!!");
      });
      res.redirect('/result');
   
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });

   });

   app.post("/inserthosp",checkToken , (req, res) => {   
      var myData = new Hospitals(req.body);
      myData.save()
      .then(item => {
         console.log("Hospital added!!");
      res.redirect('/result');
      })
      .catch(err => {
      res.status(400).send("unable to save to database "+err);
      });
  
     });
  
   app.get("/getvent",checkToken,function (req, res) {   
        console.log("Getting Ventilator Details!");
        
      Ventilator.find({},(err,results)=>{
         if (err) return console.log(err)
         res.render("disvent", { details: results })
      });
     
      });

   app.get("/gethosp", checkToken ,function (req, res) {   
         console.log("Getting hospital details")
       Hospitals.find({},(err,results)=>{
          if (err) return console.log(err)
          res.render("dishos", { details: results })
       });
      
       });

   app.use("/searchventvid",checkToken ,(req, res)=>{
         console.log("Search ventilators by status");
            Ventilator.find({STATUS:req.body.status},(err, results)=>{
                  if (err) return console.log(err)
                  res.render("disventsearch", { details: results })

            });
      });

   app.use("/searchventhospname",checkToken ,(req, res)=>{
         console.log("Search ventilators by Hospital name");
            Ventilator.find({HOSPITAL:new RegExp(req.body.hname,'i')},(err, results)=>{
                  if (err) return console.log(err)
                  res.render("disventsearch", { details: results })

            });
      });
       
   app.use("/searchhospname",checkToken ,(req, res)=>{
         console.log("Search hospital using name "+req.body.hospname);
         Hospitals.find({Name:new RegExp( req.body.hospname ,'i')},(err, results)=>{
               if (err) return console.log(err)
               res.render("searchhosp", { details: results })

         });
   });
    
   app.post("/updateventact",checkToken ,(req, res)=>{
      console.log("Updating Ventilator details");
      Ventilator.updateOne({HID: req.body.HID,VID: req.body.VID},{$set:{STATUS:req.body.STATUS}},(err, results)=>{
         if (err) return console.log(err);
         res.redirect('/result');
      })
});

   app.post("/deleteventact",checkToken ,(req, res)=>{
   console.log(" Deleting Ventilator !!");
   Ventilator.deleteOne({HID: req.body.HID,VID: req.body.VID},(err, results)=>{
      if (err) return console.log(err)
      res.redirect('/result');
   })
   Hospitals.updateOne({HID: req.body.HID},{$inc:{Number_Of_Ventilators:-1}},(req, res)=>{
      
   });
});

   app.get("/distoken",(req,res)=>{
      res.render("tokendis", { details: user });
   });

function checkToken(req, res,next){
   
   if(user.token!=="none"){
      jwt.verify(user.token,user.password,(err,data)=>{
         if(err) res.sendStatus(403);
       console.log("");
        console.log("User Verified Successfully!!");
        console.log("");
         next();
      }) ;    
      
   }else{
      res.sendFile(__dirname + "/html/unauthorised.html");
   }
}

   app.listen(port, () => {
    console.log("Server listening on port " + port);
   });