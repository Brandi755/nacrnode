const { JSONB } = require("sequelize");

// table d'exportation avec tous les champs
module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "commande", {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            info: {
                type: Sequelize.DataTypes.STRING(5000),
                allowNull: false
            },
            adresse_facturation: {
                type: Sequelize.DataTypes.STRING(300),
                allowNull: false
            },
            adresse_livraison: {
                type: Sequelize.DataTypes.STRING(300),
                allowNull: false
            },
            nom: {
                type: Sequelize.DataTypes.STRING(30),
                allowNull: false
            },
            prenom: {
                type: Sequelize.DataTypes.STRING(30),
                allowNull: false
            },
            status: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: true
            },
            total: {
                type: Sequelize.DataTypes.DECIMAL(7, 2),
                allowNull: false
            },
            userId: {
                type: Sequelize.DataTypes.INTEGER(11),
                allowNull: false
            },



        }, {
            timestamps: true,
            underscored: true
        }
    );
}