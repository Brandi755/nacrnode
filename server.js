const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const BodyParser = require("body-parser");

// require routes

const cors = require("cors");


const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));

app.use("/client", require("./router/client"));

app.use("/produit", require("./router/produit"));
app.use("/commande", require("./router/commande"));
app.use("/user", require("./router/user"));
app.use("/", require("./router/nodemailer"));


app.listen(port, function() {
    console.log("server start on " + port);
});