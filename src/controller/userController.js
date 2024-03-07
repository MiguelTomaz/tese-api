const User = require("../Models/User");
const bcrypt = require('bcrypt');
const sql = require("mssql");
var config = require('../../dbconfig');

const userController = {};

async function getUsers() {
    try {
        let pool = await sql.connect(config);
        let users = await pool.request().query("SELECT * from [Tourist]");
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

async function loginUser(credentials) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('email', sql.NVarChar, credentials.email)
            .input('password', sql.NVarChar, credentials.password)
            .query('SELECT * FROM [Tourist] WHERE email = @email AND password = @password');

        // Verifica se a consulta retornou exatamente uma linha
        if (result.recordset.length === 1) {
            return true; // Login bem-sucedido
        } else {
            return false; // Credenciais inválidas
        }
    } catch (err) {
        console.log(err);
        throw err;
    }
}

async function verifyUserCredentials(email, password) {
    try {
        let pool = await sql.connect(config);

        // Consulta para verificar se o usuário existe e obter sua senha
        let result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, password FROM Tourist WHERE email = @email');

        // Verifica se o usuário existe
        if (result.recordset.length == 0) {
            return false; // Usuário não existe
        }
        const storedPassword = result.recordset[0].password;
        const touristId = result.recordset[0].id;
        console.log('userId', touristId);

        if(password == storedPassword) {
            return { isValid: true, touristId: touristId }
        }
        return { isValid: false };

    } catch (error) {
        console.error(error);
        throw new Error('Failed to verify user credentials.');
    }
}


//userController.getUsers = getUsers();
/**
userController.getUsers = async function() {
    try {
        console.log("Attempting to connect to the database...");
        let pool = await sql.connect(config);
        console.log("Connection to the database established successfully!");

        console.log("Executing SQL query to fetch users...");
        let users = await pool.request().query("SELECT * from [User]");
        console.log("SQL query executed successfully!");
        
        console.log("Users fetched:", users.recordsets);
        return users.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

userController.addUser = async function(user) {
    try {
        console.log("Adding user to the database:", user.email + ", " + user.password);

        let pool = await sql.connect(config);
        let insertUser = await pool.request()
            .input('email', sql.NVarChar, user.email)
            .input('password', sql.NVarChar, user.password)
            .query('INSERT INTO [User] (email, password) VALUES (@email, @password)');
            
        console.log("User added successfully to the database");
        return insertUser.recordsets;
    }
    catch (err) {
        console.error("Error adding user to the database:", err);
    }
}
 */

//module.exports = userController;
module.exports = {
    getUsers: getUsers,
    addUser: addUser,
    loginUser: loginUser,
    verifyUserCredentials: verifyUserCredentials
}