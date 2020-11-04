# Locker-CMS
An app to keep track of lockers

## Live App
https://locker-cms-demo.herokuapp.com  
username: guest@gmail.com  
password : password  
passcode: 12345

# Description
A web app that is for keeping track of lockers, which allows adding a new locker to database or editing an existing locker that is in the database,
it has easy navigation for adding or clearing a locker when an employee is no longer with the company, has built in user account management, to restrict app use 
or changes to user accounts.

# Reason for app
A company where I was employed was having a very hard time keeping track of their 200+ employee lockers. The way it was being tracked was via excel spreadsheets, which different people had different copies of this excel spreadsheet, for keeping track of empty lockers, along with what locker belongs to which employee and when it was assigned and the combinations for those lockers. At the end it was a very tedious task because different versions of the excel spreadsheet existed. With this app, any supervisor could login and make the needed changes and those changes would be current for the next supervisor to see. The best part about it is that they could access it via mobile devices and not need to worry about an excel spreadsheet, with this app in place there is more reliable data and accountability then before. 

## Instructions for installing on local environment
Must have the following installed on computer
- node
- git bash
- mongoDB
 - robo3t (or your own GUI for mongo)
1. Open up bash terminal and clone repo “git clone https://github.com/jltorres3506/Locker-CMS.git ”
2. go into project folder and using bash terminal install project dependencies “npm install”
3. install nodemon globally using bash terminal “npm install -g nodemon”
4. run your mongoDb server using your GUI application
5. in bash terminal make sure you are in project folder directory and type the following command ” nodemon app.js”
6. go to your browser and type in localhost:3000, and application should appear

