var bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const pool = require('../DB_Config/Config');
const nodemailer = require('nodemailer'); //Send emails

const generateToken = (payload) => {
    return jwt.sign({user_details: payload}, 'w', { expiresIn: '3h'})   // *issue: setting secret to .env.JWT_SECRET == undefined
}

//Usr registration
module.exports.registration = (req, res) => {
    
    let account_status = true;
    if (req.body.first_name == '' || req.body.last_name == ''|| req.body.email == ''|| req.body.cellno == ''|| req.body.usertype == ''|| account_status == ''|| req.body.password == '') {
        
        return res.status(400).json({ error: "Input field(s) cannot be empty!" });
    } else {
        if (req.body.usertype == 'shopper') {

            
            if(req.body.password.length >= 8) {

                let password = bcrypt.hashSync(req.body.password, 8);
                let query = {
                    text: `INSERT INTO users (first_name, last_name, email, cellno, usertype, account_status, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, usertype, first_name, last_name, email, cellno, account_status`,
                    value: [req.body.first_name, req.body.last_name, req.body.email, req.body.cellno, req.body.usertype, account_status, password ]
                }
            
                let usernameVerification = {
                    text: `SELECT email, cellno FROM users WHERE email = $1 OR cellno = $2`,
                    value: [req.body.email, req.body.cellno]
                } 
            
                pool.query(usernameVerification.text, usernameVerification.value).then((results) => {
                    
                    if(results.rowCount == 0) {
                        pool.query(query.text, query.value).then(response => {
                    
                            if(response){
                                let payload = {
                                    id: response.rows[0].id,
                                    usertype: response.rows[0].usertype
                                 }
                 
                                 let stringPayload = JSON.stringify(payload);
                                 let token = generateToken(stringPayload); //jwt token
                             
                                 let object = {
                                     user_id: response.rows[0].id, 
                                     first_name: response.rows[0].first_name, 
                                     last_name: response.rows[0].last_name, 
                                     email: response.rows[0].email, 
                                     cellno: response.rows[0].cellno,
                                     account_status: response.rows[0].account_status,
                                     token: token
                                 }
                 
                                 return res.status(200).json(object)
                            } else {
                                return res.status(400).json({ error: "Unable to register user!" });
                    
                            }
                        }).catch(err => {
                            console.log(err);
                            return res.status(500).json({error: err})
                        }); 
                    } else {
                        return res.status(400).json({ error: "Email/Cell Number already exists!" });
                    }
                }).catch((err) => {
                    console.log(err);
                })
            } else {
                return res.status(400).json({ error: "Password is less than 8 characters. Minimum is length is 8!" });
            }
        } else {
            return res.status(400).json({ error: "Incorrect usertype!" });
        }
    }
};

//User login
module.exports.login = (req, res) => {
    
    let username = req.body.username

    var usernameType = username.includes("@") ? "email" : "cellno";

    let query = {
        text: `SELECT id, first_name, last_name, email, cellno, usertype, password, account_status FROM users WHERE ${usernameType} = $1`,
        value: [req.body.username]
    }

    pool.query(query.text, query.value).then(response => {

        if(response.rows[0]){

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                response.rows[0].password);
            
            if(passwordIsValid){
                
                let payload = {
                   id: response.rows[0].id,
                   usertype: response.rows[0].usertype
                }

                let stringPayload = JSON.stringify(payload);
                let token = generateToken(stringPayload); //jwt token
            
                let object = {
                    user_id: response.rows[0].id, 
                    first_name: response.rows[0].first_name, 
                    last_name: response.rows[0].last_name, 
                    email: response.rows[0].email, 
                    cellno: response.rows[0].cellno,
                    account_status: response.rows[0].account_status,
                    token: token
                }

                return res.status(200).json(object)
            }  else {
                return res.status(400).json({ error: "Password incorrect" });
    
            }
        } else {
            return res.status(400).json({ error: "User not found!" });

        }
    }).catch(err => {
        console.log(err);
        return res.status(500).json({error: err})
    });  
};

//Update profile
module.exports.updateProfile = (req, res) => {

    let query = {
        text: 'UPDATE users SET first_name = $2, last_name = $3, email = $4, cellno = $5, updated_at = NOW()  WHERE id = $1',
        value: [req.body.user_id, req.body.first_name,req.body.last_name, req.body.email, req.body.cellno]
    }

    pool.query(query.text, query.value).then(response => {
        if(response.rowCount > 0) {
            return res.status(200).json({ success: true })
        } else {
            return res.status(400).json({ error: "Unable to update profile!" });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ error: "Unable to update profile!" });
    });
}

//Get all users
module.exports.getUsers = (req, res) => {

    let query = {
        text: "SELECT * FROM users WHERE usertype != 'admin'"
    }

    pool.query(query.text).then(response => {
        console.log(response);
        if(response.rowCount > 0) {
            return res.status(200).json(response.rows)
        } else {
            return res.status(400).json({ error: "Unable to get all users" });
        }
    }).catch((err) => {
        console.log("Failed to update profile", err);
        return res.status(400).json({ error: "Server error!" });
    });
}