const express = require('express');
const router = express.Router();
const userController = require("../controller/userController");
var config = require('../../dbconfig');
const sql = require("mssql");


//router.get("/users", userController.getUsers);
//router.post("/users", userController.addUser);

router.route('/users').get((request,response)=>{

    userController.getUsers().then(result => {
        response.json(result);
    })
})

router.put('/addPoi/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const updatedPoiVisited = await userController.addPoiToUser(userId);
        res.json({ poi_visited: updatedPoiVisited });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar ponto de interesse ao usuário.' });
    }
});

router.route('/add').post((request,response)=>{

    const { email, password } = request.body; // Assume que os dados são enviados no corpo da requisição

    // Verifica se os dados obrigatórios (email e password) estão presentes
    if (!email || !password) {
        return response.status(400).json({ error: 'O email e a senha são obrigatórios: ' +  JSON.stringify(request.body) });
    }

    try {
        // Chama a função addUser para adicionar o novo usuário
        userController.addUser({ email, password });
        response.status(201).json({ message: 'Usuário adicionado com sucesso.' });
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: 'Ocorreu um erro ao adicionar o usuário.' });
    }
})
/** 
router.route('/login').post(async (request, response) => {
    const { email, password } = request.body; // Supondo que as credenciais sejam enviadas no corpo da solicitação

    // Verifica se o nome de usuário e a senha foram fornecidos
    if (!email || !password) {
        return response.status(400).json({ error: 'email e senha são obrigatórios.' });
    }

    try {
        // Chama a função de verificar as credenciais para verificar se as credenciais existem no banco de dados
        const isValidCredentials = await userController.verifyUserCredentials(email, password);
        
        // Verifica se as credenciais são válidas
        if (isValidCredentials) {
            return response.status(200).json({ message: 'Login bem-sucedido.' });
        } else {
            return response.status(401).json({ error: 'Credenciais inválidas. Login falhou.', email: email, password: password });
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: 'Ocorreu um erro ao processar o login.' });
    }
});
*/
router.route('/login').get(async (request, response) => {
    const { email, password } = request.body; // Extrai email e password dos parâmetros da URL

    // Verifica se o nome de usuário e a senha foram fornecidos
    if (!email || !password) {
        return response.status(400).json({ error: 'email e senha são obrigatórios.' });
    }

    try {
        // Chama a função de verificar as credenciais para verificar se as credenciais existem no banco de dados
        const isValidCredentials = await userController.verifyUserCredentials(email, password);
        
        // Verifica se as credenciais são válidas
        if (isValidCredentials.isValid) {
            return response.status(200).json({ message: 'Login bem-sucedido, com id: ' + isValidCredentials.touristId, touristId: isValidCredentials.touristId});
        } else {
            return response.status(401).json({ error: 'Credenciais inválidas. Login falhou.', email: email, password: password });
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({ error: 'Ocorreu um erro ao processar o login.' });
    }
});

router.route('/poi_visited/:id').get(async (req, res) => {
    const touristId = req.params.id;

    try {
        const poiVisited = await userController.getPoiVisitedByTouristId(touristId);
        res.json({ poi_visited: poiVisited });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get poi_visited for the tourist.' });
    }
});

router.route('/photo_count/:id').get(async (req, res) => {
    const touristId = req.params.id;

    try {
        const poiVisited = await userController.getPhotoTakenByTouristId(touristId);
        res.json({ photo_count: poiVisited });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get photo_count for the tourist.' });
    }
});

router.route('/rating/route').post(async (request, response) => {
    const { tourist_id, route_id, rating } = request.body;

    if (!tourist_id || !route_id || !rating) {
        return response.status(400).json({ error: 'tourist_id, route_id e rating são obrigatórios: ' + JSON.stringify(request.body) });
    }

    try {
        const result = await userController.addRatingRoute({ tourist_id, route_id, rating });
        //const roundedRating = result.roundedRating;
        const operation = result.operation;
        const totalRating = result.totalRating;
        const totalRows = result.totalRows;
        const averageRating = result.averageRating;
        const roundedAverageRating = result.roundedAverageRating;
        response.status(201).json({ message: 'Rating adicionado com sucesso.', operation: operation, sum: totalRating, totalRows: totalRows, averageRating: averageRating, roundedAverageRating: roundedAverageRating });
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: 'Ocorreu um erro ao adicionar o rating.' });
    }
});

router.route('/rating/poi').post(async (request, response) => {
    const { tourist_id, poi_id, rating } = request.body;

    if (!tourist_id || !poi_id || !rating) {
        return response.status(400).json({ error: 'tourist_id, poi_id e rating são obrigatórios: ' + JSON.stringify(request.body) });
    }

    try {
        const result = await userController.addRatingPOI({ tourist_id, poi_id, rating });
        //const roundedRating = result.roundedRating;
        const operation = result.operation;
        const totalRating = result.totalRating;
        const totalRows = result.totalRows;
        const averageRating = result.averageRating;
        const roundedAverageRating = result.roundedAverageRating;
        response.status(201).json({ message: 'Rating adicionado com sucesso.', operation: operation, sum: totalRating, totalRows: totalRows, averageRating: averageRating, roundedAverageRating: roundedAverageRating });
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: 'Ocorreu um erro ao adicionar o rating.' });
    }
});

router.route('/rating/route/get/:routeId').get(async (request, response) => {
    try {
        const routeId = request.params.routeId;

        // Chame o método getRatingRoute para obter a classificação da rota
        const rating = await userController.getRatingRoute(routeId);

        // Se a classificação existir, retorne-a como resposta JSON
        if (rating !== null) {
            response.json({ rating: rating });
        } else {
            // Se a classificação não existir (por exemplo, rota não encontrada), retorne 404
            response.status(404).json({ error: 'Rota não encontrada' });
        }
    } catch (error) {
        console.log(error);
        // Se ocorrer algum erro inesperado, retorne 500
        response.status(500).json({ error: 'Erro interno do servidor' });
    }
});

router.route('/rating/poi/get/:poiId').get(async (request, response) => {
    try {
        const poiId = request.params.poiId;

        // Chame o método getRatingRoute para obter a classificação da rota
        const rating = await userController.getRatingPOI(poiId);

        // Se a classificação existir, retorne-a como resposta JSON
        if (rating !== null) {
            response.json({ rating: rating });
        } else {
            // Se a classificação não existir (por exemplo, rota não encontrada), retorne 404
            response.status(404).json({ error: 'POI não encontrada' });
        }
    } catch (error) {
        console.log(error);
        // Se ocorrer algum erro inesperado, retorne 500
        response.status(500).json({ error: 'Erro interno do servidor' });
    }
});


module.exports = router;