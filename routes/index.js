var express = require('express');
var router = express.Router();
const passport = require("passport");
const authController = require('../controllers/authController');
const circleController = require('../controllers/circleController');
const drivingController = require('../controllers/drivingController');
const userController = require('../controllers/userController');
const vehicleController = require('../controllers/vehicleController');

router.post('/login', authController.signIn); // login
// router.post('/logout', authController.verify, authController.logout); // logout
router.get('/verify', authController.verify); // check user logged in
router.post('/register', authController.signUp); // register
// router.post('/verify-pass', authController.verify, authController.passwordVerify); // password verify
router.post('/activate', authController.activateAccount); // account activation
router.post('/verify-reset', authController.resetUserVerify); // reset account verify
router.post('/verify-reset-code', authController.verifyResetCode); // reset account verify
router.post('/reset-password', authController.resetPassword); // reset account password
router.get('/check', passport.authenticate('jwt', { session: false }), authController.checkAuth); 

router.get('/user', passport.authenticate('jwt', { session: false }), authController.verify, userController.getAllUsers)


router.post('/circle', passport.authenticate('jwt', { session: false }), authController.verify, circleController.addCircle)
router.delete('/circle/:id', passport.authenticate('jwt', { session: false }), authController.verify, circleController.deleteCircle)
router.get('/circle', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getAllCircle)
router.post('/circle/approve', passport.authenticate('jwt', { session: false }), authController.verify, circleController.approveCircle)
router.get('/circle/get-approved', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getApprovedCircle)
router.get('/circle/get-pending', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getPendingCircle)
router.get('/circle/get-requested', passport.authenticate('jwt', { session: false }), authController.verify, circleController.getRequestedCircle)

router.post('/vehicle', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.addVehicle)
router.put('/vehicle/:id', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.updateVehicle)
router.delete('/vehicle/:id', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.deleteVehicle)
router.get('/vehicle', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.getVehicles)
router.get('/vehicle/:id', passport.authenticate('jwt', { session: false }), authController.verify, vehicleController.getVehicle)

router.get('/vehicle/alert', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.sendAlertToUser)

router.post('/driving', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.startStopDriving)
router.post('/driving/location', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.updateDriverLocation)
router.get('/driving/alert', passport.authenticate('jwt', { session: false }), authController.verify, drivingController.sendAlertToUser)


module.exports = router;
