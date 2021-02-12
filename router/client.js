const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");





process.env.SECRET_KEY = 'secret';

// 7 OK 
// si il n'arrive pas a s'enregistrer il creer un compte
router.post("/register", (req, res) => {
    db.client.findOne({
            where: { email: req.body.email }
        })
        .then(client => {
            if (!client) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                db.client.create(req.body)
                    // email: req.body.email,
                    // password: req.body.password,
                    // nom: req.body.nom,
                    .then(itemclient => {
                        res.status(200).json({
                            message: "Vous devez valider votre email",
                            email: itemclient.email
                        })
                    })
                    .catch(err => {
                        res.json(err);
                    })

            } else {
                res.json("cette adresse email est déja utilisée");
            }
        })
        .catch(err => {
            res.json(err)
        })
});

// 7
// Ok mais ne genere pas de token sur postman mais le token est ok status 200?
// phpmyadmin changer le status a 1 du client et token vient!

router.post("/login", (req, res) => {
    db.client.findOne({ where: { email: req.body.email } })
        .then(client => {
            if (client.Status === true) {
                if (bcrypt.compareSync(req.body.password, client.password)) {
                    let clientdata = {
                        nom: client.nom,
                        prenom: client.prenom,
                        email: client.email,
                        tel: client.tel,
                    };
                    let token = jwt.sign(clientdata, process.env.SECRET_KEY, {
                        expiresIn: 1440,
                    })
                    res.status(200).json({ token: token })
                } else {
                    res.json("Erreur email ou mot de passe")
                }
            } else {
                res.json({ message: "Vous devez valider votre email" })
            }

        })
        .catch(err => {
            res.json(err);
        })
});






// 7 ok
router.post("/forgetpassword", (req, res) => {
    var randtoken = require('rand-token');
    var token = randtoken.generate(16);
    db.client.findOne({
            where: { email: req.body.email }
        })
        .then(client => {
            if (client) {
                client.update({
                        forget: token
                    }).then(item => {
                        var nodemailer = require("nodemailer");

                        var transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: "digitalweb117@gmail.com",
                                pass: "Pattedepie28"
                            },
                        });

                        var mailOptions = {
                            from: "brendabadin17@gmail.com",
                            to: item.email,
                            subject: "Sending Email using Node.js",

                            html: "<a href=http://localhost:3000/client/pwd/" + item.forget + ">Metter a jour le mot de passe</a>"
                        };

                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                res.json(error);
                                console.log(error);
                            } else {
                                console.log("email sent" + info.response);
                                res.json("email sent" + info.response);
                            }
                        });
                    })
                    .catch(err => {
                        res.json(err)
                    })
            } else {
                res.status(404).json("le client n'a pas été trouvé");
            }
        })
        .catch(err => {
            res.json(err)
        })
});

//7 ok mais pas compris 
// mise a jour du mdp
// le forget dans la bd, c'est celui qui genere le token (on verifie si il existe) dans ce cas on mets à jour
// de la le req.body.forget , quand je vais cliquer sur mail il va m'envoyer sur une page dans lequel il y'aura un parametre qui s'appel forget 
// dans le quel il y aura le token qui est stocker dans la bd
// on prend se Token / qand je vais saisir mon mot de passe qaund je vais metre a jour mon mdp ca va taper sur update password ? a revoir

router.post("/updatepassword", (req, res) => {
    db.client.findOne({
            where: { forget: req.body.forget }
        }).then(client => {
            if (client) {
                const hash = bcrypt.hashSync(req.body.password, 10);
                req.body.password = hash;
                client.update({
                        password: req.body.password,
                        forget: null

                    })
                    .then(() => {
                        res.json({
                            message: "votre mot de passe est mis a jour"
                        })
                    })
                    .catch(err => {
                        res.json(err);
                    })
            } else {
                res.json("link not validé");
            }
        })
        .catch(err => {
            res.json(err)
        })
});


// 7 ok 

// router.post("/validemail", (req, res) => {
//     db.client.findOne({
//             where: { email: req.body.email }
//         }).then(client => {
//             if (client) {
//                 if (client.Status !== 1) {
//                     client.update({
//                             Status: 1
//                         })
//                         .then(() => {
//                             res.json({
//                                 message: "votre email est validé"
//                             })
//                         })
//                         .catch(err => {
//                             res.json(err);
//                         })
//                 } else {
//                     res.json("votre mail est déja validé")
//                 }
//             } else {
//                 res.status(404).json("client pas trouvé!!!")
//             }
//         })
//         .catch(err => {
//             res.json(err)
//         })
// });


// test 7 soir
router.post("/validemail", (req, res) => {
    db.client
        .findOne({
            where: { email: req.body.email },
        })
        .then((client) => {
            if (client) {
                if (client.Status != 1) {
                    client
                        .update({
                            Status: 1,
                        })
                        .then((itemclient) => {
                            res.status(200).json("votre compte a ete activer");
                        })
                        .catch((err) => {
                            res.json(err);
                        });

                } else {
                    res.json("votre compte est déja activer");
                }
            } else {
                res.status(404).json("client not found");

            }
        })
        .catch((err) => {
            res.json(err);
        });
});





// metre a jour des info avec le id du client
router.put("/update/:id", (req, res) => {
    db.client.findOne({
            where: { id: req.params.id }
        })
        .then(client => {
            if (client) {
                password = bcrypt.hashSync(req.body.password, 10);
                req.body.password = password;
                client.update(req.body)
                    .then(clientitem => {
                        console.log(clientitem);
                        db.client.findOne({
                                where: { id: clientitem.id }
                            })
                            .then(client => {
                                let token = jwt.sign(client.dataValues,
                                    process.env.SECRET_KEY, {
                                        expiresIn: 1440 //s
                                    });
                                res.status(200).json({ token: token })
                            })
                            .catch(err => {
                                res.status(402).send(err + 'bad request')
                            })
                    })
                    .catch(err => {
                        res.status(402).send("impossible de metter a jour le client" + err);
                    })
            } else {
                res.json("client n'est pas dans la base ")
            }
        })
        .catch(err => {
            res.json(err);
        })
});







// route pour changer le mot de passe
router.patch("/reset/:id", (req, res) => {
    db.client.findOne({
            where: { id: req.params.id }
        })
        .then((client) => {
            if (client) {
                password = bcrypt.hashSync(req.body.password, 10);
                req.body.password = password;

                client.update(req.body.password)
                console.log(req.body.password)
                res.status(200).json("mot de passe changer avec sucees");
            } else {
                res.json("le mot de passe n'a pu être changer");
            }
        })
        .catch(err => {
            res.json(err);
        })
});


// OK
// recuperer le client et les info par le id 
router.get("/getClientById/:id", (req, res) => {
    db.client.findOne({
            where: { id: req.params.id },
            attributes: {
                include: [],
                exclude: ["created_at", "updated_at", "password"]
            },
        })
        .then(client => {
            res.json({ client: client })
        })
        .catch(err => {
            res.send('error' + err)
        })
});


module.exports = router;