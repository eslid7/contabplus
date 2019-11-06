const UserModel = (sequelize, Sequelize) => {
    const {INTEGER, STRING, FLOAT, BOOLEAN, DATE} = Sequelize
    const User = sequelize.define('User', {
        useId: {type: INTEGER, primaryKey: true, autoIncrement: true},
        useName: {type: STRING, allowNull: false},
        useLogin: {type: STRING, allowNull: false},
        usePassword: {type: STRING, allowNull: false},
        useStatus: {type: INTEGER, allowNull: false}
    })
    return User
}

module.exports = UserModel