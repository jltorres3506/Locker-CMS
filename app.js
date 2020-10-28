require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const app = express();
const lockers = require(__dirname+"/routes/lockers.js");
const users = require(__dirname+"/routes/auth.js");


app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(flash());


app.use(session({
    
    secret:"my secret stuff",
    resave: false,
    saveUninitialized:false,
    cookie:{ maxAge: 24 * 60 * 60 * 1000 }
  
  }));
  
  
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  //this model is needed because of line B1, B2, B3, for creating the type of strategy
  const User = require(__dirname+"/models/userModel.js").User;
  
  passport.use(User.createStrategy());//B1
  passport.serializeUser(User.serializeUser());//B2
  passport.deserializeUser(User.deserializeUser());//B3

//root route
app.get("/",(req,res)=>{
  res.redirect("users/");
});


app.use("/lockers",lockers);
app.use("/users",users);




//used for local enviroment only
mongoose.connect('mongodb://localhost:27017/lockersDB', {useNewUrlParser: true, useUnifiedTopology:true,useFindAndModify: false});
mongoose.set("useCreateIndex",true);



app.all("*",(req,res)=>{
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});
