module.exports = (sequelize, DataTypes) => {
    return sequelize.define('course_review', {

        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNULL: false
        },
        
        course_id: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            unique: false
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            unique: false
        },

        grade: {
            type: DataTypes.INTEGER,
            allowNULL: false,
            defaultValue: 0
        },

        // photo: {
        //     type: DataTypes.JSONB()
        // },

        created_at: {
            type: DataTypes.DATE,
            allowNULL: true,
            defaultValue: sequelize.literal('now()')
        }

    },

        {
            timestamp: false,
            paranoid: true,
            underscored: true,
        }

    );

};
