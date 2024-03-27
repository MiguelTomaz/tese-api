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

async function getRouteDetails(routeId) {
    try {
        let pool = await sql.connect(config);

        // Obter detalhes da rota
        let routeResult = await pool.request()
            .input('routeId', sql.Int, routeId)
            .query('SELECT * FROM Route WHERE id = @routeId');

        let route = routeResult.recordset[0];

        // Obter lista de POI da rota
        let poiResult = await pool.request()
            .input('routeId', sql.Int, routeId)
            .query('SELECT * FROM POI WHERE route_id = @routeId');

        let poiList = poiResult.recordset;

        // Combinar detalhes da rota e lista de POI
        let routeDetails = {
            route: route,
            poiList: poiList
        };

        return routeDetails;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch route details.');
    }
}

module.exports = {
    getRoutes: getRoutes,
    getRouteDetails: getRouteDetails
}
