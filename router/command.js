const express = require("express"),
    router = express.Router();
const db = require("../database/db");

router.post("/new", (req, res) => {
    var command = { clientId: req.body.clientId, status: 1 };
    db.command.create(command)
        .then((command) => {
            for (let i = 0; i < req.body.panier.length; i++) {
                command.addProduits(req.body.panier[i].produitId, { through: { prix: req.body.panier[i].prix_unitaire, qtn: req.body.panier[i].quantite } })
                    .then(resp => {
                        res.json(resp)
                    })
                    .catch(err => {
                        res.json(err)
                    })
            }
        })
        .catch((err) => {
            res.json(err)
        })
});

// // route commentaire muammad
// router.post("/new", (req, res) => {
//     var command
// })




// router.get("/all", (req, res) => {
//     db.command.findAll({
//             include: [{ all: true }]
//         })
//         .then((command) => {
//             res.json(command)
//                 /*  command.addProduit([produitId = req.body.produitId], { through: { prix: req.body.prix, qtn: req.body.qtn } })
//                      .then((rep) => {
//                          res.json(rep)
//                      })
//                      .catch((err) => {
//                          res.json(err)
//                      }) */
//         })
//         .catch((err) => {
//             res.json(err)
//         })
// })


module.exports = router;