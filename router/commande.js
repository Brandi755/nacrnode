const express = require("express");
router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Email = require('email-templates');
const pug = require('pug');

const db = require("../database/db");

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


router.use("/admin", function (req, res, next) {
  // console.log("midleware admin req.body: ", req.body);
  if (!req.body.token) {
    res.status(401).send({
      result: "Aucun token trouvé, Vous êtes pas admin",
    });
    return;
  }
  jwt.verify(req.body.token, process.env.SECRET_KEY, function (err, decoded) {
    if (!decoded) {
      res.status(401).send({
        result: "token modifier, Vous êtes pas admin",
      });
      return;
    }
    if (decoded.role != "admin") {
      res.status(401).send({
        result: "Vous êtes pas admin",
      });
      return;
    }
  });
  next();
});

router.post("/admin", (req, res) => {
  // récuperer toute les commandes
  db.commande
    .findAll({
      include: [
        {
          // Notice `include` takes an ARRAY
          model: db.user,
        },
      ],
    })
    .then((commandes) => {
      res.status(200).json(commandes);
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/delete/:id", (req, res) => {
  db.commande
    .findOne({
      where: { id: req.params.id },
      include: [{ model: db.user }],
    })
    .then((item) => {
      item.destroy().then((info) => {
        if (item.dataValues.status == false) {
          const email = item.dataValues.user.dataValues.email;
          const id = item.dataValues.id;
          const firstName = item.dataValues.prenom;
          const name = item.dataValues.nom;
          const adresse = item.dataValues.adresse_livraison;
          const total = item.dataValues.total;
          const mailSubject ="Bonjour " + firstName + " " + name + " Votre commande n°" + id + " à été annulé.";
          const mailContent = "<p>Bonjour " + firstName + " " +name +"<br>\
          Votre commande n°" + id + " au prix de " + total + " qui aurai du être éxpedié au  " + adresse + " a été annulé. <br>\
          Essayer d'efectuer une nouvelle commande. <br>\
          Merci de contacter le service client pour un rembourssement <br>\
          Merci pour votre confiance.</p>";
          var mailOptions = {
            from: "brendabadin17@gmail.com",
            to: email,
            subject: mailSubject,
            html: mailContent,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log("error commande email send : ", error);
            } else {
              console.log("info: ", info);
              console.log("email sent to " + info.response);
            }
          });
        } 
        res.status(200).json({
          res: "id del :" + req.params.id,
          info: info,
        });
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post("/admin/edit/:id", (req, res) => {
  db.commande
    .findOne({
      where: { id: req.params.id },
      include: [{ model: db.user }],
    })
    .then((item) => {
      if (req.body.status == item.dataValues.status) {
        res.status(200).json({
          res:
            "Aucune changement pour la commande " +
            req.params.id +
            " le status est déjà a " +
            item.dataValues.status,
        });
        return;
      }
      item.update({ status: req.body.status }).then((info) => {
        const email = item.dataValues.user.dataValues.email;
        const id = item.dataValues.id;
        const firstName = item.dataValues.prenom;
        const name = item.dataValues.nom;
        const adresse = item.dataValues.adresse_livraison;
        const total = item.dataValues.total;
        let mailSubject = "Bonjour " + firstName + " " + name + " Votre commande n°" + id + " a bien été pris en compte";
        let mailContent ="<p>Bonjour " + firstName + " "  + name + "<br>\
        Votre commande n°" + id + " au prix de " + total + " a bien été expédié au " + adresse + ".<br>\
        Merci pour votre confiance.</p>";

        if (req.body.status == false) {
          mailSubject ="Bonjour " + firstName + " " + name + " Votre commande n°" + id + " à eu un problème lors de sont expedition";
          mailContent = "<p>Bonjour " + firstName + " " +name +"<br>\
          Votre commande n°" + id + " au prix de " + total + " qui a tenté d'etre éxpedié au  " + adresse + " n'as pas pu être livré. <br>\
          Nous allons essayer de la livrer a nouveau. <br>\
          Merci de contacter le service client pour conffirmer et verifier les informations de la commande avant la prochaine livraison. <br>\
          Merci pour votre confiance.</p>";
        }
        var mailOptions = {
          from: "brendabadin17@gmail.com",
          to: email,
          subject: mailSubject,
          html: mailContent,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log("error commande email send : ", error);
          } else {
            console.log("info: ", info);
            console.log("email sent to " + info.response);
          }
        });
        res.status(200).json({
          res: "id update :" + req.params.id,
          info: info,
        });
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

function sendNewCommande(commande, userEmail) {
  if (typeof commande.info == "string") {
    commande.info = JSON.parse(commande.info);
  }
  commande.info = commande.info.map((obj) => {
    obj.id = obj.produitId + '';
    obj.item = obj.nom + " " + obj.quantite;
    obj.price = obj.soustotal + "€";
    return (obj);
  });
  const date = new Date().toLocaleDateString()+ " " + new Date().toLocaleTimeString();
  const invoice = {
    id: commande.id,
    createdAt: date,
    customer: {
      name: commande.nom + ' ' + commande.prenom,
    },
    shipping: commande.adresse_livraison,
    total: commande.total,
    comments: "Merci pour votre confiance, vous recevrez un mail lors de l'expédition",
    lines: commande.info,
  };
  const email = new Email({
    message: {
      from: "digitalweb117@gmail.com",
    },
    send: true,
    transport: transporter,
  });
  email.send({
    template: "commande",
    message: {
      to: userEmail,
    },
    locals: {
      invoice: invoice, 
    },
  }).then( (info) => {
    console.log('Mail send info :> ', info);
  })
  .catch((e) => {
    console.error('Mail send ERROR infoError :> ', e);
  });
}

router.post("/new", (req, res) => {
  if (
    !req.body.info ||
    !req.body.adresse_facturation ||
    !req.body.adresse_livraison ||
    !req.body.nom ||
    !req.body.prenom ||
    !req.body.userId || 
    !req.body.email
  ) {
    res.status(520).json({
      info: "Information de la commande invalide req.body",
    });
    return;
  }
  if (typeof req.body.info == "object") {
    req.body.info = JSON.stringify(req.body.info);
  }
  var commande = {
    // info: JSON.stringify(req.body.info),
    info: req.body.info,
    adresse_facturation: req.body.adresse_facturation,
    adresse_livraison: req.body.adresse_livraison,
    nom: req.body.nom,
    prenom: req.body.prenom,
    total: req.body.total,
    userId: req.body.userId,
    status: 0,
  };
  db.commande
    .create(commande)
    .then((commande) => {
      // console.log("commande :> ", commande);
      // console.log(commande);
      // console.log("req.body.email :> ", req.body.email);
      sendNewCommande(commande, req.body.email);
      res.status(200).json({
        info: "Commande ajouté",
        commande: commande,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(520).json(err);
    });
});


router.get("/test", (req, res) => {
  const optionsDate = { weekday: 'long', year: 'numeric', month:'2-digit', day: '2-digit' };
  const dateCode = "2021-04-20T14:11:21.000Z";
  // date = new Date(dateCode).toLocaleDateString("fr-FR", optionsDate) + " " + new Date().toLocaleTimeString(dateCode),
  // date = new Date().toLocaleDateString("fr-FR", optionsDate) + " " + new Date().toLocaleTimeString(dateCode);

  res.status(200).json({date: date});
});

module.exports = router;
