const Vehicle = require('../models/vehicle');
const User = require('../models/user');
const Message = require('../helpers/sendMessage');

module.exports = {

    startStopDriving(req, res) {
        User.findOne({ _id: req.userId}, function (err, userDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }

            if (!userDoc) {
                return jsonResponse(res, 400, badRes("Account not available"))
            } 

            userDoc.driving = req.body.driving;
            
            userDoc.lastLocation = {
                lat : req.body.lastLocation.lat,
                long: req.body.lastLocation.long
            }
            userDoc.save();
            
            Vehicle.find({_id: { $ne: req.body.VehicleId }}, function(err, vehicleDocs) {
                vehicleDocs.forEach(vehicleDoc => {
                    vehicleDoc.status = 0;
                    vehicleDoc.save();
                })               
            });

            Vehicle.findOne({_id: req.body.VehicleId}, function(err, vehicleDoc) {
                
                console.log(vehicleDoc)
                if (err) {
                    return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
                }
                if(!vehicleDoc) {
                    return jsonResponse(res, 400, badRes("Vehicle not available"))
                }
                
                if (req.body.driving) {
                    vehicleDoc.status = 1;
                } else {
                    vehicleDoc.status = 0;
                }
                vehicleDoc.save();

                if (req.body.driving){
                    return jsonResponse(res, 200, successRes('You have started driving successfully'))
                }                
                else {
                    return jsonResponse(res, 200, successRes('You have stoped driving successfully'))
                }
            });
        });

    },


    updateDriverLocation(req, res) {
        User.findOne({ _id: req.userId}, function (err, userDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }

            if (!userDoc) {
                return jsonResponse(res, 400, badRes("Account not available"))
            } 

            userDoc.lastLocation = {
                lat : req.body.lat,
                long: req.body.long
            }

            userDoc.save();
            return jsonResponse(res, 200, successRes(''))
        });
    },

    sendAlertToUser(req, res) {
        

        const registrationToken = 'asdfasdfas' // Should get from db. Unique for every mobile        
        const payload = {
            data: {
                message: 'Hello!!!'
            }
        }
        Message.send(registrationToken, payload)
        return jsonResponse(res, 200, successRes(''))
    }

}