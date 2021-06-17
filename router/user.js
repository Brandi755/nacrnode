const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../database/db");
const nodemailer = require("nodemailer");
const randtoken = require("rand-token");
process.env.SECRET_KEY = "secret";

router.use("/admin", function(req, res, next) {
    console.log("midleware admin req.body: ", req.body);
    if (!req.body.token) {
        res.status(401).send({
            result: "Aucun token trouvé, Vous êtes pas admin"
        });
        return;
    }
    jwt.verify(req.body.token, process.env.SECRET_KEY, function(err, decoded) {
        if (!decoded) {
            res.status(401).send({
                result: "token modifier, Vous êtes pas admin"
            });
            return;
        }
        if (decoded.role != "admin") {
            res.status(401).send({
                result: "Vous êtes pas admin"
            });
            return;
        }
    });
    next();
});

router.post("/admin", (req, res) => {
    db.user
        .findAll({
            include: [{
                // Notice `include` takes an ARRAY
                model: db.commande,
            }, ],
        })
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((err) => {
            res.json(err);
        });
});

// route Inscription user
router.post("/register", (req, res) => {

  function createNewUser() {
    const password = bcrypt.hashSync(req.body.password, 10);
    db.user.create({
      email: req.body.email,
      password: password,
      role: "user",
      validtoken: randtoken.generate(16),
    })
    .then((useritem) => {
      res.status(200).json({
        info: "Uitlisateur crée",
      });
    })
    .catch((err) => {
      res.status(520).json({
        err,
      });
    });
  }

  db.user.findOne({
      where: {
        email: req.body.email,
      },
    })
    .then((user) => {
      if (!user) {
        createNewUser();
      } else {
        res.status(401).json("user déja dans la base");
      }
    })
    .catch((err) => {
      console.log("err :> ", err);
    });
});

router.post("/verify", (req, res) => {
    jwt.verify(req.body.token, process.env.SECRET_KEY, function(err, decoded) {
        if (decoded) { // On a le token vérifier
            res.send(200, { "result": true, "decoded": decoded });
        } else // decoded undifine car la signature est pas bonne.
        {
            res.send(401, { "result": false });
        }
    });
});


// Utilisateur se log
router.post("/login", (req, res) => {
    console.log(req.body);
    db.user
        .findOne({
            where: {
                email: req.body.email,
            },
        })
        .then((user) => {
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password) && (user.valid >= 1 || user.role == 'admin')) {
                    var userdata = {
                        id: user.id,
                        role: user.role,
                        email: user.email,
                        nom: user.nom,
                        prenom: user.prenom,
                        adresse_livraison: user.adresse_livraison,
                        adresse_facturation: user.adresse_facturation,
                    };
                    let token = jwt.sign(userdata, process.env.SECRET_KEY, {});
                    res.status(200).json({
                        auth: true,
                        token: token,
                        user: user,
                    });
                } else {
                    res.status(401).json({
                        auth: false,
                        message: "error email or password",
                    });
                }
            } else {
                return res.status(404).json("user not found");
            }
        })
        .catch((err) => {
            res.status(520).json(err);
        });
});


// cette route permet à l'user de changer ses infos / utilisé sur la page profil
router.put("/update/:id", (req, res) => {
    db.user
        .findOne({
            where: {
                id: req.params.id,
            },
        })
        .then((user) => {
            if (user) {
                jwt.verify(req.body.token, process.env.SECRET_KEY, (err, decoded) => {

                    if (!decoded || decoded.id != req.params.id) { // On a le token vérifier et l'id est bon
                        res.status(401).json({info: "ID ou Jwt invaldie", error: err});
                        return;
                    }
                    const newUserInfo = {
                        nom: req.body.nom,
                        prenom: req.body.prenom,
                        adresse_livraison: req.body.adresse_livraison,
                        adresse_facturation: req.body.adresse_facturation,
                    };
                    user.update(newUserInfo)
                        .then((useritem) => {
                            var userdata = {
                                id: useritem.dataValues.id,
                                role: useritem.dataValues.role,
                                email: useritem.dataValues.email,
                                nom: useritem.dataValues.nom,
                                prenom: useritem.dataValues.prenom,
                                adresse_livraison: useritem.dataValues.adresse_livraison,
                                adresse_facturation: useritem.dataValues.adresse_facturation,
                            };
                            let token = jwt.sign(userdata, process.env.SECRET_KEY, {});
                            res.status(200).json({
                                token: token,
                            });
                        })
                        .catch((err) => {
                            res.status(402).send("impossible de metter a jour le user " + err);
                        });
                })  
            } else {
                res.json("user n'est pas dans la base ");
            }
        })
        .catch((err) => {
            res.status(520).json({err: err});
        });
});

// mot de passe oublié pas le user
router.post("/forgetpassword", (req, res) => {
    var token = randtoken.generate(16);
    db.user.findOne({
            where: { email: req.body.email, },
        }).then((user) => {
            if (user) {
                if (user.valid == 1 || user.role == 'admin') {
                    user.update({
                            forget: token,
                        })
                        .then((item) => {
                            var transporter = nodemailer.createTransport({
                                host: "smtp.gmail.com",
                                port: 465,
                                secure: true,
                                service: "gmail",
                                auth: {
                                    user: "digitalweb117@gmail.com",
                                    pass: "Pattedepie28",
                                },
                            });
                            var mailOptions = {
                                from: "brendabadin17@gmail.com",
                                to: item.email,
                                subject: "Autoclérapide, créer votre nouveau mot de passe",
                                // quand je clique sur le lien pour refaire mon mdp, dans l'URL il ya un TOKEN  + colonne forget SQL on le mets dans le lien pour avoir acces + le contenu mettez a jour le mdp!
                                html: "<a href=https://autoclerapide.herokuapp.com/pwdchange/" + item.id + "/" + item.forget + ">Metter a jour le mot de passe</a>",
                                //ancien html: "<a href=http://loclhoost/3000/user/pwdchange/" + item.id + "/" + item.forget + ">Metter a jour le mot de passe</a>",
                            };
                            transporter.sendMail(mailOptions, function(error, info) {
                                if (error) {
                                    res.status(520).json(error);
                                    console.log("error email send : ", error);
                                } else {
                                    console.log("info: ", info);
                                    console.log("email sent" + info.response);
                                    res.json("email sent" + info.response);
                                }
                            });
                        })
                        .catch((err) => {
                            console.log("err update");
                            res.status(520).json(err);
                        });
                } else {
                    res.status(401).json("le utilisateur n'a pas validé son compte");
                }
            } else {
                res.status(404).json("le utilisateur n'a pas été trouvé");
            }
        })
        .catch((err) => {
            console.log("erreur ?");
            res.status(520).json(err);
        });
});

router.post("/changepassword", (req, res) => {
    console.log('req.body :>> ', req.body);
    db.user.findOne({
        where: { id: req.body.id },
    }).then((user) => {
        if (user && user.forget && req.body.token == user.forget) {
            try {
                if (user.valid != 1) {
                    user.update({ valid: 1, validtoken: "" });
                }
                const password = bcrypt.hashSync(req.body.password, 10);
                user.update({ password: password, forget: "" });
                res.status(200).json("Mot de pass bien mis a jours");
            } catch (error) {
                console.log(err);
                res.status(520).json(err);
            }
        } else {
            if (!user) res.status(404).json("user not found");
            else res.status(401).json("token non valide");
        }
    }).catch((err) => {
        console.log(err);
        res.status(520).json(err);
    });
});

router.post("/sendvalidemail", (req, res) => {
    db.user.findOne({
        where: { email: req.body.email },
    }).then((user) => {
        var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            service: "gmail",
            auth: {
                user: "digitalweb117@gmail.com",
                pass: "Pattedepie28",
            },
            // auth: {
            //     user: "autoclerapide@gmail.com",
            //     pass: "galandou5",
            // },
        });
        var mailOptions = {
            from: "brendabadin17@gmail.com",
            to: user.email,
            subject: "Sending Email using Node.js",
            html: "<a href=https://autoclerapide.herokuapp.com/validemail/" + user.email + "/" + user.validtoken + ">" +
                "Valider Votre compte" +
                "</a>",
        };
        if (user) {
          transporter.sendMail(mailOptions, function(error, info) {
              if (error) {
                  res.json(error);
                  console.log("error email send : ", error);
              } else {
                  console.log("info: ", info);
                  console.log("email sent" + info.response);
                  res.json("email sent" + info.response);
              }
          });
        }
    }).catch((err) => {
        res.status(520).json(err);
    });
});

router.post("/validuser", (req, res) => {
    db.user.findOne({
        where: { email: req.body.email },
    }).then((user) => {
        if (user && req.body.token == user.validtoken) {
            if (user.valid != 1) {
                user.update({
                    valid: 1,
                    validtoken: "",
                }).then((itemuser) => {
                    res.status(200).json("votre compte a ete activer");
                }).catch((err) => {
                    res.status(520).json(err);
                });
            } else {
                res.json("votre compte est déja activer");
            }
        } else {
            if (user && req.body.token != user.validtoken) res.status(401).json("token non valide");
            else res.status(404).json("user not found");
        }
    }).catch((err) => {
        res.status(520).json(err);
    });
});

module.exports = router;

// router.put("/updateJwt/:id", (req, res) => {
//     db.user
//         .findOne({
//             where: {
//                 id: req.params.id,
//             },
//         })
//         .then((user) => {
//             if (user) {
//                 password = bcrypt.hashSync(req.body.password, 10);
//                 req.body.password = password;
//                 user
//                     .update(req.body)
//                     .then((useritem) => {
//                         console.log(useritem);
//                         db.user
//                             .findOne({
//                                 where: {
//                                     id: useritem.id,
//                                 },
//                             })
//                             .then((user) => {
//                                 let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
//                                     expiresIn: 1440, //s
//                                 });
//                                 res.status(200).json({
//                                     token: token,
//                                 });
//                             })
//                             .catch((err) => {
//                                 res.status(402).send(err + "bad request");
//                             });
//                     })
//                     .catch((err) => {
//                         res.status(402).send("impossible de metter a jour le user" + err);
//                     });
//             } else {
//                 res.json("user n'est pas dans la base ");
//             }
//         })
//         .catch((err) => {
//             res.status(520).json(err);
//         });
// });

// !