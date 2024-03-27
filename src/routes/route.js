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

router.route('/details/:id').get(async (req, res) => {
    const routeId = req.params.id;

    try {
        // Obter detalhes da rota
        const routeDetails = await routeController.getRouteDetails(routeId);

        res.status(200).json(routeDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch route details.' });
    }
});

module.exports = router;