const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

process.env.SECRET_KEY = 'secret';

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

router.get("/profile/:id", (req, res) => {
    db.client.findOne({
            where: { id: req.params.id }
        })
        .then(client => {
            if (client) {
                let token = jwt.sign(client.dataValues,
                    process.env.SECRET_KEY, {
                        expiresIn: 1440
                    });
                res.status(200).json({ token: token })
            } else {
                res.json("error le client n'a pas dans la base !!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});

router.post("/login", (req, res) => {
    console.log(req.body);
    db.client.findOne({
            where: { email: req.body.email }
        }).then(client => {
            if (client) {
                if (bcrypt.compareSync(req.body.password,
                        client.password)) {
                    let token = jwt.sign(client.dataValues,
                        process.env.SECRET_KEY, {
                            expiresIn: 1440
                        });
                    res.status(200).json({ token: token })
                } else {
                    res.status(520).json("error email or password")
                }
            } else {
                return res.status(520).json('client not found')
            }
        })
        .catch(err => {
            res.json(err)
        })
});


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


// NON pas ok 
// pour recuperer le profil(compte) du client grâce a son id
router.get("/profile/:id", (req, res) => {
    db.client.findOne({
            where: { id: req.params.id }
        })
        .then(client => {
            if (client) {
                let token = jwt.sign(client.dataValues,
                    process.env.SECRET_KEY, {
                        expiresIn: 1440
                    });
                res.status(200).json({ token: token })
            } else {
                res.json("error le client n'est pas dans la base !!")
            }
        })
        .catch(err => {
            res.json(err)
        })
});




// OK (ne pas oublier de cocher dans postman les changement)
// et change le mot de passe
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


//NON
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

//  revoir cette route
// fonctionne mais na pas encor vraiment de raison 
//  cette route et pour afficher le client par le id et voir toutes les cle afficher
router.get("/getClientById/:id", (req, res) => {
    db.client.findOne({
            where: { id: req.params.id },
            include: [{
                model: db.cle
            }]
        })
        .then(client => {
            res.json({ client: client })
        })
        .catch(err => {
            res.send('error' + err)
        })
});

// je ne sais pas si il fonctionne
// mot de passe oublier du client 
// dans phpmyadmin verifier que le client existe et dans postman juste le mail
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








// ajouter une cle a client 
//  pas sur que cette route soit necessaire est ne fonctionne
//  pour voir si un client peu ajouter plusieur cle
// je pense que non a effacer la route je pense

// router.post("/addclientToCle", (req, res) => {
//     db.client.findOne({
//             where: { email: req.body.email }
//         })
//         .then(client => {
//             if (client) {
//                 client.addCles([req.body.cleid]).then(reps => {
//                     res.json(reps)
//                 })
//             } else {
//                 res.json("not found")
//             }
//         })
//         .catch(err => {
//             res.send('error' + err)
//         })
// });




module.exports = router;