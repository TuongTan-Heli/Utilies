/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const express = require("express");
const app = express();
const { skipForPaths } = require('./utils/utils.js');

const {roleGuard} = require('./utils/roleGuard');
const {apiKeyController} = require('./controller/apiKeyController');
const {userController} = require('./controller/userController');
const {currencyController} = require('./controller/currencyController');
const {notificationController} = require('./controller/notificationController');
const {recipeController} = require('./controller/recipeController');
const {remainingController} = require('./controller/remainingController');
const {reportController} = require('./controller/reportController');
const {shareController} = require('./controller/shareController');
const {spendingController} = require('./controller/spendingController');
const {stepController} = require('./controller/stepController');
const {stockInvestHisController} = require('./controller/stockInvestHisController');
const {taskController} = require('./controller/taskController');
const {budgetController} = require('./controller/budgetController');

const pathsToSkip = [
  { path: '/login', method: 'POST' },
  { path: '/register', method: 'POST' },
];


app.use(skipForPaths(pathsToSkip, apiKeyController.validateApiKey)); 


//user
app.post('/register', roleGuard(['Basic']), userController.register);
app.post('/login', roleGuard(['Basic','User']), userController.login);
app.put('/change-password/:id', roleGuard(['User']), userController.changePassword);
app.delete('/delete-user/:id', roleGuard(['User']), userController.deleteUser);
app.put('/update-user/:id', roleGuard(['User']), userController.updateUser);
//currency
app.post('/add-currency', roleGuard([]), currencyController.add);
app.post('/get-currency/:id', roleGuard(['User']), currencyController.get);
app.put('/update-currency/:id', roleGuard([]), currencyController.update);
app.delete('/delete-currency/:id', roleGuard([]), currencyController.delete);
app.get('/get-all-currency', roleGuard(['User']), currencyController.getAll);

//notification
app.post('/add-notification', roleGuard(['User']), notificationController.add);
app.post('/get-notification/:id', roleGuard(['User']), notificationController.get);
app.put('/update-notification/:id', roleGuard(['User']), notificationController.update);
app.delete('/delete-notification/:id', roleGuard(['User']), notificationController.delete);
//recipe
app.post('/add-recipe', roleGuard(['User']), recipeController.add);
app.post('/get-recipe/:id', roleGuard(['User']), recipeController.get);
app.put('/update-recipe/:id', roleGuard(['User']), recipeController.update);
app.delete('/delete-recipe/:id', roleGuard(['User']), recipeController.delete);
//remaining
app.post('/add-remaining', roleGuard(['User']), remainingController.add);
app.post('/get-remaining/:id', roleGuard(['User']), remainingController.get);
app.get('/get-latest-remaining/:id', roleGuard(['User']), remainingController.getLatest);
app.get('/get-all-remaining/:id', roleGuard(['User']), remainingController.getAll);
app.put('/update-remaining/:id', roleGuard(['User']), remainingController.update);
app.delete('/delete-remaining/:id', roleGuard(['User']), remainingController.delete);
//report
app.post('/add-report', roleGuard(['User']), reportController.add);
app.post('/get-report/:id', roleGuard(['User']), reportController.get);
app.put('/update-report/:id', roleGuard(['User']), reportController.update);
app.delete('/delete-report/:id', roleGuard(['User']), reportController.delete);
//share
app.post('/add-share', roleGuard(['User']), shareController.add);
app.post('/get-share/:id', roleGuard(['User']), shareController.get);
app.put('/update-share/:id', roleGuard(['User']), shareController.update);
app.delete('/delete-share/:id', roleGuard(['User']), shareController.delete);
//spending
app.post('/add-spending', roleGuard(['User']), spendingController.add);
app.post('/get-spending/:id', roleGuard(['User']), spendingController.get);
app.post('/get-spending-between/:id', roleGuard(['User']), spendingController.getSpendingInPeriod);
app.put('/update-spending/:id', roleGuard(['User']), spendingController.update);
app.delete('/delete-spending/:id', roleGuard(['User']), spendingController.delete);
//step
app.post('/add-step', roleGuard(['User']), stepController.add);
app.post('/get-step/:id', roleGuard(['User']), stepController.get);
app.put('/update-step/:id', roleGuard(['User']), stepController.update);
app.delete('/delete-step/:id', roleGuard(['User']), stepController.delete);
//stock invest history
app.post('/add-stockInvestHis', roleGuard(['User']), stockInvestHisController.add);
app.post('/get-stockInvestHis/:id', roleGuard(['User']), stockInvestHisController.get);
app.put('/update-stockInvestHis/:id', roleGuard(['User']), stockInvestHisController.update);
app.delete('/delete-stockInvestHis/:id', roleGuard(['User']), stockInvestHisController.delete);
//task
app.post('/add-task', roleGuard(['User']), taskController.add);
app.get('/get-all-task/:id', roleGuard(['User']), taskController.getAll);
app.put('/update-task/:id', roleGuard(['User']), taskController.update);
app.delete('/delete-task/:id', roleGuard(['User']), taskController.delete);
//budget
app.post('/add-budget', roleGuard(['User']), budgetController.add);
app.get('/get-budget/:id', roleGuard(['User']), budgetController.get);
app.get('/get-latest-budget/:id', roleGuard(['User']), budgetController.getLatest);
app.get('/get-all-budget/:id', roleGuard(['User']), budgetController.getAll);
app.put('/update-budget/:id', roleGuard(['User']), budgetController.update);
app.delete('/delete-budget/:id', roleGuard(['User']), budgetController.delete);


exports.app = functions.https.onRequest(app);

