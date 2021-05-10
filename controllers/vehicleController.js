const Vehicle = require('../models/vehicle');
const Message = require('../helpers/sendMessage');

module.exports = {

    addVehicle(req, res) {
        Vehicle.findOne({ vehicleNo: req.body.vehicleNo, user: req.userId}, function (err, vehicleDoc) {

            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            if (vehicleDoc) {
                return jsonResponse(res, 400, badRes('You have already added this vehicle'))
            }

            const vehicle = new Vehicle({
                user : req.userId,
                vehicleNo: req.body.vehicleNo,
                brand: req.body.brand,
                model: req.body.model,
                type: req.body.type,
                status: req.body.status,
            });

            vehicle.save();
            return jsonResponse(res, 200, successRes('You have added this vehicle successfully'))

        });
    },

    updateVehicle(req, res) {
        Vehicle.findOne({ _id: req.params.id, user: req.userId}, function (err, vehicleDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            if (!vehicleDoc) {
                return jsonResponse(res, 400, badRes('You have not added this vehicle'))
            }
            vehicleDoc.brand = req.body.brand;
            vehicleDoc.model = req.body.model;
            vehicleDoc.type = req.body.type;
            vehicleDoc.status = req.body.status;
            vehicleDoc.save();
            return jsonResponse(res, 200, successRes('You have updated this vehicle successfully'))

        });
    },

    deleteVehicle(req, res) {
        Vehicle.findOne({ _id: req.params.id, user: req.userId}, function (err, vehicleDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            if (!vehicleDoc) {
                return jsonResponse(res, 400, badRes('You have not added this vehicle'))
            }
            vehicleDoc.delete();
            return jsonResponse(res, 200, successRes('You have deleted this vehicle successfully'))

        });
    },

    getVehicles(req, res) {
        Vehicle.find({user: req.userId}, function (err, vehicleDos) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            return jsonResponse(res, 200, successRes(vehicleDos))

        });
    },

    getVehicle(req, res) {
        Vehicle.findOne({ _id: req.params.id, user: req.userId}, function (err, vehicleDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            return jsonResponse(res, 200, successRes(vehicleDoc))
        });
    },
}