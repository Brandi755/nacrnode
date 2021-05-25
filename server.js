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

app.use("/produit", require("./router/produit"));
app.use("/commande", require("./router/commande"));
app.use("/user", require("./router/user"));
app.get("/test", (req, res) => {
    console.log('test OK');
    res.status(200).send("L'API EST OPERATIONEL");
});

app.listen(port, function() {
    console.log("server start on " + port);
});