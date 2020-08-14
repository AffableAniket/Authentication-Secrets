//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session"); //creates session
const passport = require("passport"); // authentication middleware
const passportLocalMongoose = require("passport-local-mongoose"); //plugin [sets login & db]
const ejs = require("ejs");
const app = express();

app.use(express.static("public"));

app.set("view engine","ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(session({                           //creates session with env
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());    //initialize the passport
                                                              //before connecting to database
app.use(passport.session());      //set the session using passport

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);       //to avoid deprecation warning
const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);     //add plugin to schema

  const User = new mongoose.model("User",userSchema);
  passport.use(User.createStrategy());                    //create strategy using passport
  passport.serializeUser(User.serializeUser());          //serialize&deserialize
  passport.deserializeUser(User.deserializeUser());  // creates cookie
app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/secrets",function(req,res){
   if(req.isAuthenticated()){
     res.render("secrets");
   }
   else{
     res.redirect("/login");
   }
});

app.post("/register",function(req,res){
  //passport-local-mongoose methods
  User.register({username: req.body.username, active: false},req.body.password, function(err, user) {
 if (err) {
     console.log(err);
      res.redirect("/register");
 }
 else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
 }
});
});

app.post("/login",function(req,res){

  const user = new User({
    username: req.body.username,
    passport: req.body.passport
  });

 req.login(user,function(err){
    if(err){
      console.log(err);
    }
        else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
    });
  }
});
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");

});

app.listen(3000,function(){
  console.log("Server Started on Port 3000");
});
