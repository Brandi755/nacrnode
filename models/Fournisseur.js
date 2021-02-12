// table d'exportation avec tous les champs
module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(

        "fournisseur", {

            id: {

                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            nom: {

                type: Sequelize.DataTypes.STRING(45),
                allowNull: true
            },
            prenom: {

                type: Sequelize.DataTypes.STRING(45),
                allowNull: true
            },
            Status: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: true
            },
            email: {

                type: Sequelize.DataTypes.STRING(255),
                allowNull: true
            },
            password: {

                type: Sequelize.DataTypes.STRING,
                allowNull: true,
            },
            Image: {
                type: Sequelize.DataTypes.STRING(255),
                allowNull: true
            }
        }, {

            timestamps: true,

            underscored: true
        }
    );
};