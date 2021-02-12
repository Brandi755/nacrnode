module.exports = (dbinfo, Sequelize) => {
    return dbinfo.define(

        "selectionne", {



        }, {

            timestamps: false,


            underscored: true
        }
    );
};