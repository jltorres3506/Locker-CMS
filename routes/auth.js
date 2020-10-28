
const express = require('express');
const passport = require("passport");
const router = express.Router();
const mongoose = require("mongoose");
const User = require(__dirname+"/../models/userModel.js").User;


router.use((req,res,next)=>{
    res.locals.registeredMsg = req.flash("registered");
    res.locals.registrationFailedMsg = req.flash("failedRegistration");
    res.locals.loginFailedMsg = req.flash("loginFailed");
    next();
});


const systemPasscode = 12345;
const guestId = "5f983385b51dab00175424cc";

router.route("/register")

        .get((req,res)=>{
            res.render("auth/register");
        })

        .post((req,res)=>{
            
            

            //destrcut user inputs
            let {firstName, lastName, username, password, passcode} = req.body;

            //convert specific data to lowercase so consists in db
            firstName = firstName.toLowerCase();
            lastName = lastName.toLowerCase();
            username = username.toLowerCase();
            
            //validation array to hold error msgs
            let errors = [];

            //validate user inputs
            if(!firstName || !lastName || !username || !password || !passcode ){

                errors.push({msg:"All data fields must be filled out!"});
            }

            // password length >= 6 chars
            if(password.length < 6){
                errors.push({msg:"password must be 6 characters or more!"});
            }

            //check if there any errors stored in array
            if(errors.length >0){
                res.render("auth/register",{errors,firstName,lastName,username, passcode});
            }else{

                    //check user passcode with actual
                    if(systemPasscode == passcode){



                        // check to see if username (email) is already in db
                        User.findOne({username: username},(err,userFound)=>{
                            if(!err){
                                if(userFound){
            
                                    //send back msg to user that username was found in system
                                    errors.push({msg:"Sorry but there is a user with that email in the system!"});
                                    res.render("auth/register",{errors,firstName,lastName,username, passcode});

                                }else{

                                    // create a new user based on model
                                    const newUser = new User({
                                        username:  username,
                                        firstName: firstName,
                                        lastName:  lastName,
                                        active: false,
                                        isAdmin:false
                                    });
                        
                                    // register user
                                    User.register(newUser, password,(err, user)=>{
                                        if(!err){
                                            req.flash("registered","You have been registered, please wait at least 24 hours before trying to login, account must be approved by admin!");
                                            
                                            res.redirect("/");
                                        }else{
                                            res.send("you failed "+ err);
                                        }
                                    });
                                }
                                
                            }
                        });

                    }else{
                    
                    //run this if passcode is wrong    
                    errors.push({msg:"Sorry but you are not authorized to have an account!"});
                    res.render("auth/register",{errors,firstName,lastName,username, passcode});
                }
            } 
        });

 router.route("/")    

        .get((req,res)=>{
            
            res.render("auth/login");
        })

        // first middleware to see if input fields are empty
        .post((req,res,next)=>{

            const {username, password} = req.body;
            if(!username || !password){
                req.flash("loginFailed","Data fields must be filled out!");
                 res.redirect("/users"); 
            }else{
                next();
            }
        },
        // used to check if password and username match db entrys
        passport.authenticate("local",{
            successRedirect: "/lockers",
            failureRedirect:"/users/wrongCreds"

        }));


        //route for failure of sign in with wrong creds
         router.get("/wrongCreds",(req,res)=>{

            //define the flash message that is in the res.locals
            req.flash("loginFailed","You have the wrong username or password");
            res.redirect("/users");   
         });



    
        router.get("/logout",(req,res)=>{
            req.logOut();
            res.redirect("/");
        });
         

router.route("/password-reset")
.get((req,res)=>{
    res.render("auth/passwordReset");
})

.post((req,res)=>{
    
        //grab all data from form 
        let {firstName, lastName, username, newPassword, passcode } = req.body;

        //convert to lowercase so it matches with db entrys
        firstName = firstName.toLowerCase();
        lastName = lastName.toLowerCase();
        username = username.toLowerCase();

        

        //check to make sure no input fields are empty
        if(!firstName || !lastName || !username || !newPassword || !passcode){
            const errors= [{msg:"All data fields must be filled out!"}];
            res.render("auth/passwordReset",{errors,firstName,lastName,username,passcode});
        }else{
            // password length >= 6 chars
            if(newPassword.length < 6){
                const errors= [{msg:"Password must be 6 characters or more!"}];
                res.render("auth/passwordReset",{errors,firstName,lastName,username,passcode});
            }else{
                
            

            //check if passcode entered matches that of system
            if(passcode == systemPasscode){

            //check db for email if matches
                User.findOne({username: username},(error, foundUser)=>{

                    if(foundUser._id == guestId){
                        res.redirect("/");
                    }else{

                    
                        // check to make sure founderUser is not null or undefined
                        if(foundUser !== null && foundUser !== undefined){
                           
                        


                    if(!error){
                            // if match is found compare rest of data from form with that user in db
                            if(foundUser.firstName == firstName && foundUser.lastName == lastName  ){

                            //     //if all data match allow password reset and send to login screen with msg (you have succesfly changed password);
                                foundUser.setPassword(newPassword,(error)=>{
                                    if(!error){
                                        foundUser.save();
                                        res.redirect("/");
                                    }else{
                                        const errors= [{msg:"Sorry your data does not match"}];
                                        res.render("auth/passwordReset",{errors,firstName,lastName,username,passcode});
                                    }
                                });

                            }else{
                                //if no match is found, show error msg on password-reset view ("sorry no match in db");
                                const errors= [{msg:"Sorry your data does not match"}];
                                res.render("auth/passwordReset",{errors,firstName,lastName,username,passcode});
                            }
                    }else{
                        res.send("you have an error, trying to find user");
                    }
                    }else{
                        const errors= [{msg:"Sorry your data does not match"}];
                        res.render("auth/passwordReset",{errors,firstName,lastName,username,passcode});
                    }
                } 
                });
        
            }else{
                const errors= [{msg:"Sorry your not authroized to change password!"}];
                                        res.render("auth/passwordReset",{errors,firstName,lastName,username,passcode});
            }
        }  
    }

   



}); 



// checks if user is authticated for this whole route
const isUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect("/");
    }
  };


  //takes you to see all user accounts, where they can be edited
router.get("/admin",isUserAuthenticated,(req,res)=>{
    
    // check to see if user has admin right
    if(req.user.isAdmin){

        //get all users from db
            User.find({},(error,foundUsers)=>{
                if(!error){
                    if(foundUsers.length > 0){
                        res.render("auth/admin",{users:foundUsers});
                    }else{
                        console.log("no users found");
                        res.render("no users where found in Db");
                        
                    }
                }else{
                    console.log("you got an error finding all users");
                }
            });
    
    }else{
        res.redirect("/lockers/");
    }
    
});

router.route("/user-edit/:id")
    .get((req,res)=>{

        //get a user from db and pass its data to db for test
        User.findOne({_id:req.params.id},(error,foundUser)=>{
            if(foundUser!= null || foundUser!= undefined){
                res.render("auth/userEdit",{user:foundUser});
            }else{
                res.redirect("/");
            }
            
        })
    })


    .post((req,res)=>{
        //get all data from form
        const {firstName, lastName,username,isAdmin, isActive } = req.body;

        //create obj with updates to be passed into db
        const user = {
            firstName:firstName,
            lastName:lastName,
            username:username,
            isAdmin:isAdmin,
            active:isActive
        };

        if(req.params.id == guestId){
            res.redirect("/");
        }else{

        
        User.findOneAndUpdate({_id:req.params.id},user,(error,updatedUser)=>{
            if(error){
                console.log("you go issues: "+error);
            }else{
                
                res.redirect("/users/admin");
            
            }
            
        });
    }
    });

//delete user
router.get("/delete/:id",(req,res)=>{

  if(req.params.id !== guestId){
        User.findByIdAndDelete(req.params.id,(error)=>{
            if(!error){
                res.redirect("/users/admin");
            }else{
                res.send("There was an issue trying to delete");
            }
        });
  }else{
    res.redirect("/users/admin");
  }
    
});

router.all("*",(req,res)=>{
    res.redirect("/");
});



module.exports = router;
