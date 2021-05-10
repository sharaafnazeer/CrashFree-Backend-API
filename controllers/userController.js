const User = require('../models/user');
const UserCircle = require('../models/circle');
const user = require('../models/user');

module.exports = {   

    async getAllUsers(req, res) {

        let userDocs = [];
        try {
            userDocs = await User.find({status : 1, _id: { $ne: req.userId }}, {"firstName": 1, "lastName": 1, "email": 1 });
            
        } catch (err) {
            console.log(err)
            return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"));
        }

        const users = await Promise.all(userDocs.map(async (userDoc) => {
            try {
                const userCircle = await UserCircle.findOne({$or: [{user: userDoc._id}, {circleUser: userDoc._id}]});
                
                let requested = false;
                let requestCame = false;
                
                
                if (userCircle) {
                    userCircle.user == req.userId ? requested = true : requested = false;
                    userCircle.circleUser == req.userId ? requestCame = true : requestCame = false;
                    userDoc.status = userCircle.status;
                    userDoc.isCircle = true;

                    if(requested) {
                        userDoc.otherStatus = 2;
                    }

                    if(requestCame) {
                        userDoc.otherStatus = 1;
                    }
                } else {
                    userDoc.status = 0;
                    userDoc.isCircle = false;
                    userDoc.otherStatus = 0;
                }        
                return {
                        _id: userCircle ? userCircle._id ? userCircle._id : null : null,
                        circleUserId: userDoc._id,
                        circleUserName: userDoc.firstName + " " + userDoc.lastName,
                        circleUserEmail: userDoc.email,
                        circleUserPhone: userDoc.phone || 'N/A',
                        status: userDoc.status,
                        type: userCircle ? userCircle.type : 'Unknown',
                        isCircle: userDoc.isCircle,
                        otherStatus: userDoc.otherStatus,
                };
        
            } catch (err) {
                console.log(err)
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"));
            }
          }));

          return jsonResponse(res, 200, successRes(users));

    },
}