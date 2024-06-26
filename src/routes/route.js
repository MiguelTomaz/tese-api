const express = require('express');
const router = express.Router();
const routeController = require("../controller/routeController");
var config = require('../../dbconfig');
const sql = require("mssql");

router.route('/routes/all').get(async (req, res) => {
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

router.route('/all/:id?').get(async (req, res) => {
    try {
        
        let id = req.params.id;
        let routes;
        if (id) {
            routes = await routeController.getRoutes(id);
        } else {
            routes = await routeController.getRoutes();
        }
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

router.route('/poi/all').get(async (req, res) => {
    
    try {
        const poi_list  = await routeController.getPoiList();
        if (poi_list.length > 0) {
            res.status(200).json({ poi_list });
        } else {
            res.status(404).json({ error: 'Nenhum poi' });
        }
         
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === 'Failed to fetch routes: no data found.') {
            res.status(404).json({ error: 'Nenhum dado encontrado para o routes.' });
        } else {
            res.status(500).json({ error: 'Falha ao buscar o routes.' });
        }
    }
    
   /** 
    routeController.getPoiList().then(result => {
        res.json(result);
    })
    */
});

router.route('/add').post(async (req, res) => {
    try {
        const { name, city, category, created } = req.body;
        if (!name || !city || !category || !created) {
            return res.status(400).json({ error: 'Parâmetros ausentes. Certifique-se de fornecer name, city, category e created.' });
        }
        
        const { success, message, routeId } = await routeController.addRouteFromTourist(name, city, category, created);

        if (success) {
            res.status(200).json({ success: true, message: message, routeId: routeId });
        } else {
            res.status(500).json({ error: 'Falha ao adicionar rota.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falha ao adicionar rota2.' });
    }
});

router.route('/addPoiToRoute').post(async (req, res) => {
    try {
        const { route_id, order_in_route, id} = req.body;
        if (!route_id || !id) {
            return res.status(400).json({ error: 'Parâmetros ausentes. Certifique-se de fornecer route_id e id.' });
        }
        
        const { success, message, newPOIId } = await routeController.addPoiToRoute(route_id, order_in_route, id);
        
        if (success) {
            res.status(200).json({ success: true, message: message, newPOIId: newPOIId });
        } else {
            res.status(500).json({ error: 'Falha ao adicionar POI à rota.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falha ao adicionar POI à rota.' });
    }
});

router.route('/touristic-route/add').post(async (req, res) => {
    const { route_id, tourist_id } = req.body; // Certifique-se de que os dados são enviados no corpo da solicitação

    try {
        // Verifique se os dados necessários foram fornecidos
        if (!route_id || !tourist_id) {
            return res.status(400).json({ error: 'Parâmetros route_id e tourist_id são obrigatórios.' });
        }

        // Adicione a rota turística
        const { success, message, touristicRouteId }  = await routeController.addTouristicRoute(route_id, tourist_id);
        if (success) {
            res.status(200).json({ success: true, message: message, touristicRouteId: touristicRouteId });
        } else {
            res.status(500).json({ error: 'Falha ao adicionar touristic route' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Falha ao adicionar rota turística.' });
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