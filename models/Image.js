// table d'exportation avec tous les champs
module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(

        "image", {

            id: {

                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            Status: {

                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: true
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