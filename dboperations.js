var config = require('./dbconfig');
const sql = require("mssql");

async function getUsers() {
    try {
        let pool = await sql.connect(config);
        let users = await pool.request().query("SELECT * from [User]");
        return users.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function addUser(user) {

    try {
        let pool = await sql.connect(config);
        let insertUser = await pool.request()
            .input('email', sql.NVarChar, user.email)
            .input('password', sql.NVarChar, user.password)
            .query('INSERT INTO [User] (email, password) VALUES (@email, @password)');
        return insertUser.recordsets;
    }
    catch (err) {
        console.log(err);
    }

}

module.exports = {
    getUsers: getUsers,
    addUser: addUser
}
