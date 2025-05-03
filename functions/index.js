/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require("firebase-functions");
const express = require("express");
const app = express();

const {userController} = require('./controller/userController');
const {currencyController} = require('./controller/currencyController');
const {loginSessionController} = require('./controller/loginSessionController');
const {notificationController} = require('./controller/notificationController');
const {recipeController} = require('./controller/recipeController');
const {remainingController} = require('./controller/remainingController');
const {reportController} = require('./controller/reportController');
const {shareController} = require('./controller/shareController');
const {spendingController} = require('./controller/spendingController');
const {stepController} = require('./controller/stepController');
const {stockInvestHisController} = require('./controller/stockInvestHisController');
const {taskController} = require('./controller/taskController');



//user
app.post('/register', userController.register);
app.post('/login', userController.login);
app.put('/change-password/:id', userController.changePassword);
app.delete('/delete-user/:id', userController.deleteUser);
app.put('/update-user/:id', userController.updateUser);
//currency
app.post('/add-currency', currencyController.add);
app.post('/get-currency/:id', currencyController.get);
app.put('/update-currency/:id', currencyController.update);
app.delete('/delete-currency/:id', currencyController.delete);
//loginSession
// app.post('/add-loginSession', loginSessionController.add);
// app.post('/get/:id', loginSessionController.get);
// app.put('/update/:id', loginSessionController.update);
// app.delete('/delete-user/:id', loginSessionController.delete);
//notification
app.post('/add-notification', notificationController.add);
app.post('/get-notification/:id', notificationController.get);
app.put('/update-notification/:id', notificationController.update);
app.delete('/delete-notification/:id', notificationController.delete);
//recipe
app.post('/add-recipe', recipeController.add);
app.post('/get-recipe/:id', recipeController.get);
app.put('/update-recipe/:id', recipeController.update);
app.delete('/delete-recipe/:id', recipeController.delete);
//remaining
app.post('/add-remaining', remainingController.add);
app.post('/get-remaining/:id', remainingController.get);
app.put('/update-remaining/:id', remainingController.update);
app.delete('/delete-remaining/:id', remainingController.delete);
//report
app.post('/add-report', reportController.add);
app.post('/get-report/:id', reportController.get);
app.put('/update-report/:id', reportController.update);
app.delete('/delete-report/:id', reportController.delete);
//share
app.post('/add-share', shareController.add);
app.post('/get-share/:id', shareController.get);
app.put('/update-share/:id', shareController.update);
app.delete('/delete-share/:id', shareController.delete);
//spending
app.post('/add-spending', spendingController.add);
app.post('/get-spending/:id', spendingController.get);
app.put('/update-spending/:id', spendingController.update);
app.delete('/delete-spending/:id', spendingController.delete);
//step
app.post('/add-step', stepController.add);
app.post('/get-step/:id', stepController.get);
app.put('/update-step/:id', stepController.update);
app.delete('/delete-step/:id', stepController.delete);
//stock invest history
app.post('/add-stockInvestHis', stockInvestHisController.add);
app.post('/get-stockInvestHis/:id', stockInvestHisController.get);
app.put('/update-stockInvestHis/:id', stockInvestHisController.update);
app.delete('/delete-stockInvestHis/:id', stockInvestHisController.delete);
//task
app.post('/add-task', taskController.add);
app.post('/get-task/:id', taskController.get);
app.put('/update-task/:id', taskController.update);
app.delete('/delete-task/:id', taskController.delete);


exports.app = functions.https.onRequest(app);

