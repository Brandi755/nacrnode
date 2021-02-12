const express = require("express");
const router = express.Router();

router.post("/sendmail", (req, res) => {
    const nodemailer = require("nodemailer");
    // importation du transporter

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: '587',
        auth: {
            user: "digitalweb117@gmail.com",
            pass: "Pattedepie28",
        },
        secureConnection: 'false',
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });

    var mailOptions = {

        from: "AutoCléRapide",
        to: req.body.email,
        subject: req.body.obj,
        html: "<a href=http://localhost:8080/validemail/" +
            itemclient.email +
            ">Valider votre email</a>",
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.json(error);
            console.log(error);
        } else {
            console.log("email envoyer" + info.response);
            res.json("email envoyer" + info.response);

        }
    });
});

module.exports = router;