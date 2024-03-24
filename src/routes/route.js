const express = require('express');
const router = express.Router();
const routeController = require("../controller/routeController");
var config = require('../../dbconfig');
const sql = require("mssql");


router.route('/all').get(async (req, res) => {
    try {
        const routes  = await routeController.getRoutes();
        if (routes.length > 0) {
            res.status(200).json({ routes: routes });
        } else {
            res.status(404).json({ error: 'Nenhum route' });
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === 'Failed to fetch routes: no data found.') {
            res.status(404).json({ error: 'Nenhum dado encontrado para o routes.' });
        } else {
            res.status(500).json({ error: 'Falha ao buscar o routes.' });
        }
    }
});

module.exports = router;