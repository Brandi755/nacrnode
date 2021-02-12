// table d'exportation avec tous les champs
module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(

        "contient", {

            prix: {
                type: Sequelize.DataTypes.DECIMAL(7, 2),
                allowNull: true
            },
            qtn: {
                type: Sequelize.DataTypes.INTEGER(2)
            }

        }, {

            timestamps: false,

            underscored: true
        }
    );
};