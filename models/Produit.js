// exporte table with all field
module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(
        "produit", {
            id: {
                type: Sequelize.DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            Status: {
                type: Sequelize.DataTypes.BOOLEAN,
                allowNull: true,
            },

            stock: {
                type: Sequelize.DataTypes.INTEGER(5),
                allowNull: false,
            },

            ref: {
                type: Sequelize.DataTypes.STRING(75),
                allowNull: false,
            },

            prix: {
                type: Sequelize.DataTypes.DECIMAL(7, 2),
                allowNull: true,
            },

            description: {
                type: Sequelize.DataTypes.TEXT,
                allowNull: true,
            },

            marque: {
                type: Sequelize.DataTypes.STRING(75),
                allowNull: false,
            },

            modele: {
                type: Sequelize.DataTypes.STRING(75),
                allowNull: true,
            },

            annee: {
                type: Sequelize.DataTypes.INTEGER(4),
                allowNull: true,
            },
            nom: {
                type: Sequelize.DataTypes.STRING(60),
                allowNull: true,
            }
        },

        {
            timestamps: true,

            underscored: true,
        }
    );
};