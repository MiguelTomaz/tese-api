const Route = require("../Models/Route");
const bcrypt = require('bcrypt');
const sql = require("mssql");
var config = require('../../dbconfig');


async function getRoutes() {
    try {
        let pool = await sql.connect(config);
        let routes = await pool.request().query("SELECT * from [Route]");
        return routes.recordsets;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch routes.');
    }
}

module.exports = {
    getRoutes: getRoutes
}
