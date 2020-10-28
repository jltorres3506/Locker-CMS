const express = require("express");
const _ = require("lodash");
var router = express.Router();
const hfs = require("../helperFunctions");


const Locker = require(__dirname + "/../models/lockerModel.js").locker;


const isObjectFoundFromQuery = (obj)=>{
  if(obj != null || obj!= undefined){
    return true;
  }else{
    return false;
  }
};

// checks if user is authticated for this whole route
const isUserAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    } else {
    res.redirect("/");
  }
};

//checks to see if user account is active
const isUserAccountActive = (req,res,next)=>{
  if(req.user.active){
    next();
  }else{
    res.redirect("/");
  }
}
router.use(isUserAuthenticated, isUserAccountActive);

// the default
let viewBy = [
  {number : "asc"},
  {firstName : "asc"}
];

router
  .route("/")
  
  .get((req, res) => {
    //sort by firstName ASC a-z
    Locker.find({})
      .sort(viewBy[1])
      .exec((error, foundLockers) => {
        if (!error) {
          console.log("lockers have been found");

          res.render("lockersView", {
            lockers: foundLockers,
            currentUser: _.upperFirst(req.user.firstName),
          });
        } else {
          res.send("sorry there was a problem");
        }
      });
  })

  //adding a new locker entry
  .post((req, res) => {
    let errors = []; //used to store errors for this route

    let {
      lockerNumber,
      lockerCombination,
      position,
      firstName,
      lastName,
    } = req.body;

    firstName = firstName.toLowerCase();
    lastName = lastName.toLowerCase();

    
    if (position !== "none") {
      // check db for locker number duplicate if there is deny request, if not continute
      Locker.findOne({ number: lockerNumber }, (error, lockerFound) => {
        if (!error) {
          if (!lockerFound) {
            Locker.create(
              {
                number: lockerNumber,
                combination: lockerCombination,
                position: position,
                firstName: firstName,
                lastName: lastName,
              },
              (error, createdLocker) => {
                if (!error) {
                  res.redirect("/lockers");
                } else {
                  res.send(error);
                  console.log(Object.keys(error.errors.number));

                  console.log("ERRORS " + error._message);
                }
              }
            );
          } else {
            //do this if locker number duplicate is found

            // send msg to user that there is a locker with that number in the system
            errors.push({
              msg:
                "you have another locker with that same number in system please check your data!",
            });
            res.render("lockerAdd", { errors });
          }
        } else {
          //run this is there was a error finding duplicate locker
          errors.push({
            msg: "Please make sure locker number is only a number!",
          });
          res.render("lockerAdd", { errors });
        }
      });

      //if position is none
    } else {
      errors.push({
        msg: "Please make sure to choose a locker position!",
      });
      res.render("lockerAdd", { errors,lockerNumber,lockerCombination,position,firstName,lastName });
    }
  });

router
  .route("/locker/:lockerNumber")

  .get((req, res) => {
    Locker.findOne(
      { number: req.params.lockerNumber },
      (error, foundLocker) => {

        //check to see if locker is not null or undefined
        if( isObjectFoundFromQuery(foundLocker)){
          if (!error) {
            res.render("singleView", { locker: foundLocker });
          } else {
            res.send("error finding locker");
          }
        }else{
        res.redirect("/");
      }
      });
  })

  //this should be the one used for editing locker
  .post((req, res) => {

    //grab all user data
    const {lockerCombination,firstName,lastName, dateAssigned, comments, number} = req.body;
     
    //create a new object and add to lowercase to first and last name
    let locker = {
      combination:lockerCombination,
      firstName: firstName.toLowerCase(),
      lastName:lastName.toLowerCase(),
      dateAssigned:dateAssigned,
      comments:comments

    };
    

    Locker.updateOne(
      { number: req.params.lockerNumber },
      { $set: locker }, //this allows to pass obj through and set what ever properties appear, muust have $set for this to work
      (error) => {
        if (!error) {
          res.redirect("/lockers/locker/" + req.params.lockerNumber);
        } else {
          res.send("you got a problem patching");
        }
      }
    );
  });

//this route is used for when a person is terminated and there locker has been cleaned out, and is
//ready to be put back in use for a new hire
router.post("/:lockerNumber/clearOut", (req, res) => {
  const propertiesToClearOut = {
    firstName: "",
    lastName: "",
    dateAssigned: "",
    comments: "",
  };

  Locker.updateOne(
    { number: req.params.lockerNumber },
    propertiesToClearOut, //this allows to pass obj through and set what ever properties appear, muust have $set for this to work
    (error) => {
      if (!error) {
        res.redirect("/lockers/locker/" + req.params.lockerNumber);
      } else {
        res.send("you got a problem clearing out locker");
      }
    }
  );
});



router.get("/locker-edit-form/:lockerNumber", (req, res) => {
  Locker.findOne({ number: req.params.lockerNumber }, (error, foundLocker) => {

    if(isObjectFoundFromQuery(foundLocker)){


    
    

    if (!error) {
      //used to format the date from mongoose

      res.render("editLocker", { locker: foundLocker });
    } else {
      res.send("error finding locker");
    }

  }else{
    res.redirect("/");
  }
  });
});




router.get("/print/:lockerNumber", (req, res) => {
  Locker.findOne({ number: req.params.lockerNumber }, (error, foundLocker) => {
    if(isObjectFoundFromQuery(foundLocker)){

  
    if (!error) {
      //used to format the date from mongoose

      res.render("lockerPrint", { locker: foundLocker });
    } else {
      res.send("error finding locker");
    }
  }else{
    res.redirect("/");
  }
  });

});



router.get("/lockerAdd", (req, res) => {
 
  res.render("lockerAdd");
});


router.get("/table",(req,res)=>{

  
  Locker.find({})
  .sort({ number: "asc" })
  .exec((error, foundLockers) => {
    if (!error) {

      res.render("csv",{lockers:foundLockers});

    } else {
      res.send("sorry there was a problem");
    }
  });

});

router.all("*",(req,res)=>{
  res.redirect("/");
});

module.exports = router;
