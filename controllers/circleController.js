const UserCircle = require('../models/circle');
const User = require('../models/user');

module.exports = {

    addCircle(req, res) {
        UserCircle.findOne({ user: req.userId, circleUser: req.body.circleUser}, function (err, userCircleDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            if (userCircleDoc) {

                if (userCircleDoc.status === 1) 
                    return jsonResponse(res, 400, badRes('This particular contact is already added to your close cirlce'))
                else 
                    return jsonResponse(res, 400, badRes('You have already requested this contact to add in your close circle. Confirmation pending'))
            }

            const userCircle = new UserCircle({
                user : req.userId,
                circleUser: req.body.circleUser,
                type: circleType()[req.body.type]
            });

            userCircle.save();
            return jsonResponse(res, 200, successRes('Your request to add this contact is sent successfully'))

        });
    },

    deleteCircle(req, res) {
        UserCircle.findOne(
            {
                _id: req.params.id
                // $or: [
                //     { $or: [{user: req.userId}, {circleUser: req.params.id}] },
                //     { $or: [{user: req.params.id}, {circleUser: req.userId}] }
                // ]
            }, function (err, userCircleDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            if (!userCircleDoc) {
                return jsonResponse(res, 400, badRes('You have not added this contact in your close circle'))         
            }

            userCircleDoc.delete();
            return jsonResponse(res, 200, successRes('You have deleted this contact successfully'))

        });
    },

    approveCircle(req, res) {
        UserCircle.findOne(
            {circleUser: req.userId, user: req.body.circleUser}, function (err, userCircleDoc) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            if (!userCircleDoc) {
                return jsonResponse(res, 400, badRes('You have not added this contact in your close circle'))         
            }

            if (userCircleDoc.status === 1) {
                return jsonResponse(res, 400, badRes('You have already added this contact in your close circle'))
            }
            userCircleDoc.status = 1;
            userCircleDoc.save();
            return jsonResponse(res, 200, successRes('You have added this contact in your close circle successfully'))

        });
    },

    async getApprovedCircle(req, res) {

        let userCircles = [];
        try {
            userCircles = await UserCircle.find({status: 1, $or: [{user: req.userId}, {circleUser: req.userId}]});
        } catch (err) {
            return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
        }

        let users = await Promise.all(userCircles.map(async (userCircleDoc) => {
            try {
                const users = await User.find({$or: [{_id: userCircleDoc.user}, {_id: userCircleDoc.circleUser}]});

                return users.map(user => {
                    return {
                        _id: userCircleDoc._id,
                        circleUserId: user._id,
                        circleUserName: user.firstName + " " + user.lastName,
                        circleUserEmail: user.email,
                        circleUserPhone: user.phone,
                        status: userCircleDoc.status,
                        type: userCircleDoc.type,
                    }
                })        
            } catch (err) {
                console.log(err)
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"));
            }
        }));
        const responses = [];
        users.forEach(userDocs => {
            userDocs.forEach(user => {
                if (user.circleUserId != req.userId) {
                    responses.push(user);
                }                   
            })
        });
        return jsonResponse(res, 200, successRes(responses));
    },

    async getPendingCircle(req, res) {
        let userCircles = [];
        try {
            userCircles = await UserCircle.find({status: 0, $or: [{user: req.userId}, {circleUser: req.userId}]});
        } catch (err) {
            return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
        }

        let users = await Promise.all(userCircles.map(async (userCircleDoc) => {

            let requested = false;
            let requestCame = false;
            userCircleDoc.user == req.userId ? requested = true : requested = false;
            userCircleDoc.circleUser == req.userId ? requestCame = true : requestCame = false;

            if(requestCame) {
                try {
                    const users = await User.find({$or: [{_id: userCircleDoc.user}, {_id: userCircleDoc.circleUser}]});
                    // console.log(user)
    
                    return users.map(user => {
                        return {
                            _id: userCircleDoc._id,
                            circleUserId: user._id,
                            circleUserName: user.firstName + " " + user.lastName,
                            circleUserEmail: user.email,
                            circleUserPhone: user.phone,
                            status: userCircleDoc.status,
                            type: userCircleDoc.type,
                            otherStatus: 1
                        }
                    })        
                } catch (err) {
                    console.log(err)
                    return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"));
                }
            } else {
                return [];
            }
        }));
        const responses = [];
        users.forEach(userDocs => {
            userDocs.forEach(user => {
                if (user.circleUserId != req.userId) {
                    responses.push(user);
                }                   
            })
        });
        return jsonResponse(res, 200, successRes(responses));
    },

    async getRequestedCircle(req, res) {
        let userCircles = [];
        try {
            userCircles = await UserCircle.find({status: 0, $or: [{user: req.userId}, {circleUser: req.userId}]});
        } catch (err) {
            return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
        }

        let users = await Promise.all(userCircles.map(async (userCircleDoc) => {

            let requested = false;
            let requestCame = false;
            userCircleDoc.user == req.userId ? requested = true : requested = false;
            userCircleDoc.circleUser == req.userId ? requestCame = true : requestCame = false;

            if(requested) {
                try {
                    const users = await User.find({$or: [{_id: userCircleDoc.user}, {_id: userCircleDoc.circleUser}]});
                    // console.log(user)
    
                    return users.map(user => {
                        return {
                            _id: userCircleDoc._id,
                            circleUserId: user._id,
                            circleUserName: user.firstName + " " + user.lastName,
                            circleUserEmail: user.email,
                            circleUserPhone: user.phone,
                            status: userCircleDoc.status,
                            type: userCircleDoc.type,
                            otherStatus: 2
                        }
                    })        
                } catch (err) {
                    console.log(err)
                    return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"));
                }
            } else {
                return [];
            }
        }));
        const responses = [];
        users.forEach(userDocs => {
            userDocs.forEach(user => {
                if (user.circleUserId != req.userId) {
                    responses.push(user);
                }                   
            })
        });
        return jsonResponse(res, 200, successRes(responses));
    },

    getAllCircle(req, res) {
        UserCircle.find({$or: [{user: req.userId}, {circleUser: req.userId}]}, function(err, circleDocs) {
            if (err) {
                return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
            }
            return jsonResponse(res, 200, successRes(circleDocs))
        });
    },
} 