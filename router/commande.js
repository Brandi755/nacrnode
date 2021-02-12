const express = require("express"),
    router = express.Router();

const db = require("../database/db");

router.post("/new", (req, res) => {
    var commande = {
        // info: JSON.stringify(req.body.info),
        info: req.body.info,
        adresse_facturation: req.body.adresse_facturation,
        adresse_livraison: req.body.adresse_livraison,
        nom: req.body.nom,
        prenom: req.body.prenom,
        total: req.body.total,
        clientId: req.body.clientId,
        status: 0,
    };
    db.commande.create(commande)
        .then((commande) => {
            res.json({
                info: "Commande ajouté",
                commande: commande
            });
        })
        .catch((err) => {
            res.json(err);
        })
});



module.exports = router;