 // ORM
 const Sequelize = require('sequelize');



 /************************************** fin module requis **********************************************
  *******************************************************************************************************************/


 /************************************** connexion à la base de donée **********************************************
  *****************************************************************************************************************/
 // make our const db ;
 const db = {};



 // connexion à la base de données
 // / **
 //   * new Sequelize ({database}, {username}, {password}, options {
 //   * hôte: {hostname},
 //   * dialecte: l'un des 'mysql' | «mariadb» | 'postgres' | 'mssql', le dialecte de la base de données à laquelle vous vous connectez.
 //   * Un des mysql, postgres, sqlite et mssql. port: si vous n'avez pas changé votre port par défaut mysql, il sera 3306, ou si
 //   * vous changez assurez-vous d'utiliser votre port, operatorsAlias: {false}, pool: {sequelize configuration du pool de connexion
 //   * max: {5 numbre of max conn in your database}, Nombre maximal de connexions dans le pool par défaut: 5 min: {0} Minimum
 //   * nombre de connexions dans le pool, par défaut: 0, acquisition: {30000} durée maximale, en millisecondes, pendant laquelle le pool tentera de
 //   * obtenir la connexion avant de lancer une erreur, par défaut 60000, inactif: {10000} La durée maximale, en millisecondes, pendant laquelle un
 //   * la connexion peut être inactive avant d'être libérée.


//  const dbinfo = new Sequelize("acrdb", "root", "root", {
//     host: "localhost",
//     dialect: "mysql",
//     port: 8889,
//     pool: {
//         max: 5,
//         min: 0,
//     }
//  });

 const dbinfo = new Sequelize("mysql://bd734d381fff75:ba19cb11@eu-cdbr-west-01.cleardb.com/heroku_20b308f582b1e65?reconnect=true", {
    pool: {
        max: 5,
        min: 0,
    }
 });



 dbinfo.authenticate()
     .then(() => {
         console.log('Connection has been established successfully.');
     })
     .catch(err => {
         console.error('Unable to connect to the database:', err);
     });

 //  ici j'importe mes tables
 db.commande = require("../models/Commande")(dbinfo, Sequelize);
 db.contient = require("../models/Contient")(dbinfo, Sequelize);
//  db.fournisseur = require("../models/Fournisseur")(dbinfo, Sequelize);
 db.produit = require("../models/Produit")(dbinfo, Sequelize);
 db.image = require("../models/Image")(dbinfo, Sequelize);
 db.user = require("../models/User")(dbinfo, Sequelize);
 db.selectionne = require("../models/Selectionne")(dbinfo, Sequelize);




 //  relations de mes tables , foreignkey = clé étrangere


 // hasMany = a plusieurs
 // user peut avoir plusieurs commande , mais les commande appartient à un seul user , il envois sa clé étrangere dans commande
 db.user.hasMany(db.commande, { foreignKey: 'userId' });
 db.produit.hasMany(db.image, { foreignKey: 'produitId' });


 // belongsTo = appartient à
 db.commande.belongsTo(db.user, { foreignKey: 'userId' });


 // belongsToMany = appartient à plusieurs = tables intermediaires
 db.commande.belongsToMany(db.produit, { through: 'contient', foreignKey: 'commandeId' });
 db.produit.belongsToMany(db.commande, { through: 'contient', foreignKey: 'produitId' });
 db.user.belongsToMany(db.produit, { through: 'selectionne', foreignKey: 'userId' });
 db.produit.belongsToMany(db.user, { through: 'selectionne', foreignKey: 'produitId' });





 db.dbinfo = dbinfo;
 db.Sequelize = Sequelize;

 // dbinfo.sync({ force: true });

 module.exports = db;