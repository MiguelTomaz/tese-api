const express = require('express');
const router = express.Router();
const photoController = require("../controller/photoController");
var config = require('../../dbconfig');
const sql = require("mssql");


router.route('/upload').post(async (request, response) => {
    const { tourist_route_association_id, description, date, image_hash, filename, image_base64 } = request.body;

    // Verifica se os dados obrigatórios (email e password) estão presentes
    if (!tourist_route_association_id || !description || !date || !image_hash || !filename || !image_base64) {
        return response.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Chama a função addUser para adicionar o novo usuário
        const { id, touristId } = await photoController.addPhoto({ tourist_route_association_id, description, date, image_hash, filename, image_base64 });
        response.status(201).json({ message: 'Foto adicionada com sucesso com o id: ' + id + " e turista: " + touristId, touristId: touristId });
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: 'Ocorreu um erro ao adicionar a foto.' });
    }
});

router.route('/gallery/:touristId').get(async (req, res) => {
    const touristId = req.params.touristId;
    try {
        const gallery = await photoController.getGallery(touristId);
        res.status(200).json(gallery);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao buscar a galeria do turista.' });
    }
});

router.route('/community').get(async (req, res) => {
    try {
        const community = await photoController.getCommunity();
        res.status(200).json(community);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Falha ao buscar a galeria do turista.' });
    }
});


module.exports = router;