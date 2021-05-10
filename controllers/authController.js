const express = require('express');
const User = require('../models/user');
const UserToken = require('../models/userToken');
const passport = require("passport");
const moment = require('moment');
const Bcrypt = require('bcrypt');
const SendMail = require('../helpers/sendMail');
const Jade = require('jade');
const jwt = require('jsonwebtoken');

module.exports = {
   

    // Login 

    signIn(req, res, next) {
        // console.log(req.body)
        passport.authenticate(
            'login',
            async (err, user, info) => {

              try {
                if (info) {

                    if (info.verified) {
                        const error = new Error(info.message);
                        return next(error);
                    }
                    else {

                        const userToken = new UserToken({
                            userId : info.user.id,
                            token: Math.floor((Math.random() * 999999) + 100000),
                            type: 1,
                            expireAt: moment(new Date()).add(10, 'minutes')
                        });
        
                        userToken.save();
        
                        const html = Jade.renderFile('views/registeremail.jade', {
                            user: info.user.firstName,
                            code: userToken.token
                        });
                        SendMail.sendMail(info.user.email, "Complete your registration", html);

                        return jsonResponse(res, 200, successRes({'verified': false}))
                    }                    
                }

                else if (err) {
                  const error = new Error("Ooopss. Something went wrong. Please try again later");      
                  return next(error);
                }

                else if(!user && info) {
                    const error = new Error("Ooopss. Something went wrong. Please try again later");      
                  return next(error);
                }
      
                req.login(
                  user,
                  { session: false },
                  async (error) => {
                    if (error) return next(error);
      
                    const body = { _id: user._id, email: user.email };
                    const token = jwt.sign({ user: body }, process.env.JWT_SECRET);
      
                    return jsonResponse(res, 200, successRes({'verified': true, token}))
                  }
                );
              } catch (error) {
                return next(error);
              }
        })(req, res, next);
    },

   //Register

    signUp(req, res, next) {  
        passport.authenticate('signup', (err, user, info) => {
            if (err)
                return jsonResponse(res, 500, errorRes(err))
            else if (info) {
                return jsonResponse(res, 500, badRes(info.message))
            }
            else if (user) {
                const userToken = new UserToken({
                    userId : user.id,
                    token: Math.floor((Math.random() * 999999) + 100000),
                    type: 1,
                    expireAt: moment(new Date()).add(10, 'minutes')
                });

                userToken.save();

                const html = Jade.renderFile('views/registeremail.jade', {
                    user: user.firstName,
                    code: userToken.token
                });
                SendMail.sendMail(user.email, "Complete your registration", html);
                return jsonResponse(res, 200, successRes("Registered Successfully. Please check your email to verify your account"));
              }

        })(req, res, next)
    },

    //Verify Registration
    activateAccount(req, res) {
        const code = req.body.code;
        const email = req.body.email;
        if (email && code) {

            User.findOne({ email: req.body.email}, function (err, userDoc) {
                
                if (err) {
                    return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
                }

                if (!userDoc) {
                    return jsonResponse(res, 400, badRes("Account not available"))
                } 

                UserToken.findOne({
                        userId: userDoc._id,
                        expireAt: { $gt: moment() },
                        type: 1
                    }).
                    sort({ expireAt: -1 }).
                    exec(function (err, userTokenDoc) {
                        if (err) {
                            return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
                        }
                        if(userTokenDoc) {
                            if (userTokenDoc.token === code) {
                                userDoc.status = 1;
                                userDoc.save();
                                userTokenDoc.delete();
    
                                return jsonResponse(res, 200, successRes("Account activated successfully."));
                            } else {
                                return jsonResponse(res, 400, badRes("Invalid activation code"));
                            }
                        } 
                        return jsonResponse(res, 400, badRes("Invalid activation code"));
                    });
            })

        } else {
            return jsonResponse(res, 400, badRes("Activation code is required!"))                
        }

    },

    // Verify User to Reset Password
    resetUserVerify(req, res) {
        const email = req.body.email;

        if (email) {

            let user = User.findOne({ email: req.body.email}, function (err, userDoc) {
                
                if (err) {
                    return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
                }

                if (!userDoc) {
                    return jsonResponse(res, 400, badRes("Account not available"))
                } 

                const userToken = new UserToken({
                    userId : userDoc.id,
                    token: Math.floor((Math.random() * 999999) + 100000),
                    type: 2,
                    expireAt: moment(new Date()).add(10, 'minutes')
                });

                userToken.save();

                const html = Jade.renderFile('views/resetpassword.jade', {
                    user: user.firstName,
                    code: userToken.token
                });
                SendMail.sendMail(user.email, "Reset your account password", html);
                return jsonResponse(res, 200, successRes("Please check your email to verify your account"));              
            })

        } else {
            return jsonResponse(res, 400, badRes("Email is required!"))                
        }
    },


    verifyResetCode(req, res) {
        const code = req.body.code;
        const email = req.body.email;

        if (email && code) {

            let user = User.findOne({ email: req.body.email}, function (err, userDoc) {
                
                if (err) {
                    return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
                }

                if (!userDoc) {
                    return jsonResponse(res, 400, badRes("Account not available"))
                } 

                UserToken.findOne({
                        userId: userDoc._id,
                        expireAt: { $gt: moment() },
                        type: 2
                    }).
                    sort({ expireAt: -1 }).
                    exec(function (err, userTokenDoc) {
                        if (err) {
                            return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
                        }
                        if(userTokenDoc) {

                            if (userTokenDoc.token === code) {
                                userTokenDoc.delete();
    
                                return jsonResponse(res, 200, successRes(""));
                            } else {
                                return jsonResponse(res, 400, badRes("Invalid activation code"));
                            }
                        } 
                        return jsonResponse(res, 400, badRes("Invalid activation code"));
                    });
            })

        } else {
            return jsonResponse(res, 400, badRes("Activation code is required!"))                
        }

    },


    resetPassword(req, res) {

        const password = req.body.password;
        const email = req.body.email;
        if (email && password) {

            let user = User.findOne({ email: req.body.email}, function (err, userDoc) {
                
                if (err) {
                    return jsonResponse(res, 500, errorRes("Ooopss. Something went wrong. Please try again later!"))
                }

                if (!userDoc) {
                    return jsonResponse(res, 400, badRes("Account not available"))
                }  
                
                userDoc.password = Bcrypt.hashSync(password, 10);
                userDoc.save();

                return jsonResponse(res, 200, successRes("Your password reset is completed successfully!"))
            })
        } else {
            return jsonResponse(res, 400, badRes("Email or code is required!"))
        }
    },

    verify(req, res, next) {
        let token;

        if ('authorization' in req.headers) {
            token = req.headers['authorization'].split(' ')[1];
        }

        if (!token) {
            jsonResponse(res, 400, badRes('No token provided'));
        } else {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    jsonResponse(res, 400, badRes('Token authentication failed'));
                } else {
                    req.userId = decoded.user._id;
                    next();
                }
            })
        }

    },

    checkAuth(req, res) {
        jsonResponse(res, 200, successRes('Authentication success'))
    }

}