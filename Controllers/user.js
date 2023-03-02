var bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const pool = require('../DB_Config/Config');
const nodemailer = require('nodemailer'); //Send emails

const generateToken = (payload) => {
    return jwt.sign({user_details: payload}, 'w', { expiresIn: '3h'})   // *issue: setting secret to .env.JWT_SECRET == undefined
}

//User registration
//Must use JOI package for user registration validation 
module.exports.registration = (req, res) => {
    
    let account_status = true;
    let address = null;
    if (req.body.first_name == '' || req.body.last_name == ''|| req.body.email == ''|| req.body.cellno == ''|| req.body.usertype == ''|| account_status == ''|| req.body.password == '') {
        
        return res.status(400).json({ error: "Input field(s) cannot be empty!" });
    } else {
        if (req.body.usertype == 'shopper') {

            
            if(req.body.password.length >= 8) {

                let password = bcrypt.hashSync(req.body.password, 8);
                let query = {
                    text: `INSERT INTO users (first_name, last_name, email, cellno, usertype, account_status, password, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, usertype, first_name, last_name, email, cellno, account_status, address`,
                    value: [req.body.first_name, req.body.last_name, req.body.email, req.body.cellno, req.body.usertype, account_status, password, address ]
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
                                     address: response.rows[0].address,
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
        text: `SELECT id, first_name, last_name, email, cellno, usertype, password, address, account_status FROM users WHERE ${usernameType} = $1`,
        value: [req.body.username]
    }

    pool.query(query.text, query.value).then(response => {
        if(response.rows[0]){

            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                response.rows[0].password);
            
            if(passwordIsValid){
                
                if (response.rows[0].account_status === true){
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
                        address: response.rows[0].address,
                        token: token
                     }
     
                     return res.status(200).json(object)
                } else {
                    return res.status(400).json({error: 'Account is locked.'});
                }
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
        text: 'UPDATE users SET first_name = $2, last_name = $3, email = $4, cellno = $5, address = $6, updated_at = NOW()  WHERE id = $1',
        value: [req.body.user_id, req.body.first_name,req.body.last_name, req.body.email, req.body.cellno, req.body.address]
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
        if(response.rowCount > 0) {
            return res.status(200).json(response.rows)
        } else {
            return res.status(400).json({ error: "Unable to get all users" });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ error: "Server error!" });
    });
}

//Update password
module.exports.updatePassword = (req, res) => {

    let password = bcrypt.hashSync(req.body.password, 8);
    
    let query = {text: 'UPDATE users SET password = $2, updated_at = NOW()  WHERE id = $1',
    value: [req.body.user_id, password]
    }

    pool.query(query.text, query.value).then(response => {
        
        if(response.rowCount > 0) {
            return res.status(200).json({success: 'Password updated successfully'})
        } else {
            return res.status(400).json({ error: "Unable to update password" });
        }
    }).catch((err) => {
        console.log(err);
        return res.status(400).json({ error: "Server error!" });
    });
}

//Forgot password
module.exports.forgotPassword = (req, res) => {

    let email = req.body.email;

    let query = {
        text: 'SELECT email, first_name, last_name FROM users WHERE email = $1',
        value: [email]
    }
    
    pool.query(query.text, query.value).then(data => {
        if(data.rowCount > 0){
            let name = data.rows[0].last_name + ' ' + data.rows[0].first_name;
            let newPassword = Math.random().toString(36).slice(-8)
            let hashedPassword = bcrypt.hashSync(newPassword, 8)
            let query_1 = {
                text: 'UPDATE users SET password = $1 WHERE email = $2',
                value: [hashedPassword, email]
            }
            pool.query(query_1.text, query_1.value).then(uploadRes => {
                addCandidateMailer(email, name, newPassword)
                return res.status(201).json('Password Updated')
            }).catch(err => {
                return res.status(401).json(err);
            })

        }else{
            return res.status(401).json('Email not found');
        }
    }).catch(err => {
        console.log(err);
        return res.status(401).json(err);
    })
}

//Deactivate account
module.exports.deactivateAccount = (req, res) => {

    let id;

    if (req.body.usertype == 'admin') {
        id == req.body.client_id
    } else {
        id == req.body.user_id
    }

    let query = {
        text: 'UPDATE users SET account_status = false, updated_at = NOW()  WHERE id = $1',
        value: [id]
    }
    
    pool.query(query.text, query.value).then(data => {
        if(data.rowCount > 0){
            return res.status(200).json({ success: true })
        }else{
            return res.status(401).json('Account not found');
        }
    }).catch(err => {
        console.log(err);
        return res.status(401).json(err);
    })
}

const Transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "mogaudavi@gmail.com",
        pass: "smawjbgpafbgyebl"
    },
    tls: {
        rejectUnauthorized: false
    }
});

const addCandidateMailer = (email, name, password) => {
    let mailOptions = {
        from: 'koenaite8@gmail.com', // sender address
        to: email, // list of receivers
        //cc:'etlhako@gmail.com',
        subject: 'Temporary Password', // Subject line
        // text: text, // plain text body
        html:
            `<h3>Greetings ${name},</h3><br>
        <h3>This email serves to inform you that your account is now active😊, <br>
        
        Below are your login credentials you, your password can be updated at your own discretion on our platform:</h3><br>
        <h2><ul><u>Login Details</u><h2/>
        Username: ${email}<br>
        password: ${password}<br>
        visit our site at <a href="https://students-projects.vercel.app/">Visit e-mall.com!</a><br><br>
        </ul><h3>
        kind Regards,<br>
        E-Mall Team
         </h3>`
        // html body
    };
    Transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log(err);
        }
    });

}