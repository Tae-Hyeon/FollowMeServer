module.exports = (sequelize, DataTypes) => {
    return sequelize.define('infolike', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },
        iid: {
            type: DataTypes.INTEGER,
            allowNULL : false,
            unique: false
        },
        uid: {
            type: DataTypes.INTEGER,
            allowNULL : false,
            unique: false
        }
    }, {
        timestamp: false,
        paranoid: true,
        underscored: true,
    });
};
