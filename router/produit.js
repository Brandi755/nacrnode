// je pense OK
const express = require("express"),
    router = express.Router(), // 
    db = require("../database/db");

const { Op } = require("sequelize");



// OK
router.post("/new", (req, res) => {

    //pour creer la produit je veux une image!
    // le lien de l'image donner sera stocker dans une variable avant de creer la produit
    var image = req.body.Image;

    db.produit.findOne({
            //cherche la produit si existante par sa referances
            where: { ref: req.body.ref },
        })
        .then(produit => {
            if (!produit) {
                //créer clé en utilisant le model produit -->!!!!
                db.produit.create(req.body)
                    .then(produititem => {

                        db.image.create({
                            image: image,
                            produitId: produititem.id
                        })

                        //tu vas aller récuperer produit créer avec image
                        .then(() => {
                            db.produit.findOne({
                                    where: { id: produititem.id },
                                    include: [{
                                        model: db.image
                                    }],
                                })
                                .then((produit) => {
                                    res.json(produit);
                                })
                                .catch(err => {
                                    res.json({
                                        error: err
                                    })
                                })

                        })

                        .catch(err => {
                            res.json({
                                err: err
                            })
                        })
                    })

                .catch(err => {
                    res.json({
                        error: err
                    })
                })
            } else {
                res.json('la clé est déjà dans la db')
            }

        })
        .catch(err => {
            res.json({
                error: err
            })
        })

});

// ici je veux get = recuperer toutes les clés = all
router.get("/all", (req, res) => {
    db.produit.findAll({
            include: [{
                model: db.image,
            }, ],
        })
        .then(produits => {
            res.status(200).json({ produits: produits })
        })
        .catch(err => {
            res.json(err)
        })
});


// avec put je peux metre a jour une information le prix par exemple
router.put("/update/:id", (req, res) => {
    db.produit.findOne({
            where: { id: req.params.id }
        })
        .then(produit => {
            produit.update(req.body)
                .then(produititem => {
                    res.status(200).json(produititem);
                })
                .catch(err => {
                    res.json(err);
                })
        })
});

// NON PAS OK (je suis pas sur )
// route pour metre a jour l'image
router.post("/addImage", (req, res) => {
    db.image.create({
            image: req.body.image,
            produitId: req.body.id
        })
        .then(image => {
            db.produit.findOne({
                    where: { id: req.body.id },
                    include: [
                        { model: db.image, }
                    ],
                })
                .then(produit => {
                    res.status(200).json({ produit: produit })
                })
                .catch(err => {
                    res.json(err);
                })
        })
        .catch(err => {
            res.json(err);
        })
})




// OK
// ici je recuperer = get ! la produitf avec son Id 
router.get("/getById/:id", (req, res) => {
    db.produit.findOne({
            where: { id: req.params.id },
            include: [{
                model: db.image,
            }, ],
        })
        .then(produit => {
            res.status(200).json({ produit: produit })
        })
        .catch(err => {
            res.json(err)
        });

});

// limit nombre de produit que je vais recuperer

// router.get("/all/:limit/:offset", (req, res) => {

//     db.produit
//         .findAll({
//             include: [{
//                 model: db.image,
//             }, ],
//             offset: parseInt(req.params.offset),
//             limit: parseInt(req.params.limit),

//         })
//         .then((reponse) => {
//             res.status(200).json({ produit: reponse });
//         })
//         .catch((err) => {
//             res.json(err);
//         });
// });

// new 20/11
// fonctionne ne pas oublier de metre le champ limit dans postman
//  sert à limiter par exemple le nombre de clé
// offset permet de decaler les clé a reviser cette partie
// route offset v
//  je dois creer une route all plus haut 
//  car cette route ne m'affichera pas tt si je ne creer pas en plus il faudra des precistion

// La fonction parseInt () analyse une chaîne et renvoie un entier. (INTEGER) si on le l'utilise pas le limit et le offset ne fonctionne pas
router.get("/all/:limit/:offset", (req, res) => {
    db.produit
        .findAll({
            include: [{
                model: db.image,
            }, ],

            offset: parseInt(req.params.offset),
            limit: parseInt(req.params.limit),
        })
        .then((reponse) => {
            res.status(200).json({ produit: reponse });
        })
        .catch((err) => {
            res.json(err);
        });
});


// route ou on recupere la produit avec la marque 
// test
// router.get("/findBy/:marque", (req, res) => {
//     db.produit
//         .findAll({
//             where: { marque: req.params.marque },
//             include: [{
//                 model: db.image,
//             }, ],

//         })
//         .then((reponse) => {
//             res.status(200).json({ produit: reponse });
//         })
//         .catch((err) => {
//             res.json(err);
//         });
// });


// 

// router.get("/findBylike/:ref", (req, res) => {
//     db.produit
//         .findAll({
//             where: {
//                 ref: {
//                     [Op.like]: "%" + req.params.ref,
//                 }
//             },
//             include: [{
//                 model: db.image,
//             }, ],

//         })
//         .then((reponse) => {
//             res.status(200).json({ produit: reponse });
//         })
//         .catch((err) => {
//             res.json(err);
//         });
// });

// pas tout a ok

// router.get("/findBy/:marque", (req, res) => {
//     db.produit.findAll({
//             where: {
//                 marque: {
//                     [Op.like]: "%" + req.params.marque,
//                 }
//             },
//             include: [{
//                 model: db.image,
//             }, ]

//         })
//         .then(produits => {
//             res.status(200).json({ produits: produits })
//         })
//         .catch((err) => {
//             res.json(err);
//         })
// });





router.get("/findBy/:marque", (req, res) => {
    db.produit.findAll({
            where: {
                marque: {
                    [Op.like]: req.params.marque + "%",
                }
            },
            include: [{
                    model: db.image
                },

            ]
        })
        .then(produits => {
            res.status(200).json({ produits: produits })
        })
        .catch(err => {
            res.json(err)
        })
});








module.exports = router;
// ici nous faisons l'export du router