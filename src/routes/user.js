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



module.exports = router;