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

        from: "brendabadin17@gmail.com",
        to: req.body.email,
        subject: req.body.obj,
        text: req.body.text,
    }
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

// dernier ne fonctionne pas sur le pc problem de certificat

// router.post("/sendmail", (req, res) => {
//     var nodemailer = require("nodemailer");

//     var transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: "digitalweb117gmail.com",
//             pass: "Pattedepie28",
//         },
//     });

//     var mailOptions = {
//         from: "brendabadin17@gmail.com",
//         to: req.body.email,
//         subject: "Sending Email using Node.js",
//         text: req.body.text,
//     };

//     transporter.sendMail(mailOptions, function(error, info) {
//         if (error) {
//             res.json(error);
//             console.log(error);
//         } else {
//             console.log("email sent" + info.response);
//             res.json("email sent" + info.response);
//         }
//     });
// });

module.exports = router;