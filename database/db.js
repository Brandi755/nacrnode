/************************************** Start Require module ****************************************************
 *****************************************************************************************************************/
/**
 * Sequelize is a promise-based ORM for Node.js.
 * Sequelize is easy to learn and has dozens of cool features like synchronization, association, validation, etc.
 * It also has support for PostgreSQL, MySQL, MariaDB, SQLite, and MSSQL.
 * I am assuming you have some form of SQL database service started on your machine. I am currently using MySQL.
 * */
const Sequelize = require('sequelize');



/************************************** end Require module **********************************************
 *******************************************************************************************************************/


/************************************** Start connexion to database  **********************************************
 *****************************************************************************************************************/
// make our const db ;
const db = {};

// conn to database
/**
 * new Sequelize({database},{username},{password},options{
 *     host:{hostname},
 *     dialect:  one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' , The dialect of the database you are connecting to.
 * One of mysql, postgres, sqlite and mssql. port: if you don't have change you mysql default port it will 3306, or if
 * you change make sure to use you port , operatorsAliases: {false}, pool: { sequelize connection pool configuration
 * max: { 5 numbre of max conn in you database}, Maximum number of connection in pool default: 5 min: {0 } Minimum
 * number of connection in pool,default: 0, acquire: {30000 } The maximum time, in milliseconds, that pool will try to
 * get connection before throwing error, default 60000, idle: { 10000 } The maximum time, in milliseconds, that a
 * connection can be idle before being released.
 *     }
 *
 * @type {Sequelize}
 */

const dbinfo = new Sequelize("acrdb", "root", "root", {
    host: "localhost",
    dialect: "mysql",
    port: 3306,
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

db.client = require("../models/Client")(dbinfo, Sequelize);
db.command = require("../models/Command")(dbinfo, Sequelize);
db.contient = require("../models/Contient")(dbinfo, Sequelize);
db.fournisseur = require("../models/Fournisseur")(dbinfo, Sequelize);
db.produit = require("../models/Produit")(dbinfo, Sequelize);
db.image = require("../models/Image")(dbinfo, Sequelize);
db.user = require("../models/User")(dbinfo, Sequelize);




// 1,N
db.client.hasMany(db.command, { foreignKey: 'clientId' });
db.command.belongsTo(db.client, { foreignKey: 'clientId' });

db.command.belongsToMany(db.produit, { through: 'contient', foreignKey: 'commandId' });

db.produit.belongsToMany(db.command, { through: 'contient', foreignKey: 'produitId' });

db.produit.hasMany(db.image, { foreignKey: 'produitId' });



db.dbinfo = dbinfo;
db.Sequelize = Sequelize;

// dbinfo.sync({ force: true });

module.exports = db;