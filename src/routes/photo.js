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

router.route('/community/like').post(async (req, res) => {
    const { touristId, photoId } = req.body;

    // Verifica se os IDs da foto e do turista estão presentes
    if (!touristId || !photoId) {
        return res.status(400).json({ error: 'Os IDs da foto e do turista são obrigatórios.' });
    }

    try {
        // Adiciona o "like" à foto da comunidade
        const { message, tourist_id, photo_id, likes, like } = await photoController.likePhoto(touristId, photoId);
        //const message = await photoController.likePhoto(touristId, photoId);
        res.status(201).json({  message, 
        touristId: touristId,
        photo_id: photo_id,
    likes: likes,
    like: like });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falha ao adicionar o like à foto da comunidade.' });
    }
});

router.route('/community/like/check').post(async (req, res) => {
    const { touristId, photoId } = req.body;

    // Verifica se os IDs da foto e do turista estão presentes
    if (!touristId || !photoId) {
        return res.status(400).json({ error: 'Os IDs da foto e do turista são obrigatórios.' });
    }

    try {
        // Verifica se o turista deu like na foto
        const liked = await photoController.checkIfLikedPhoto(touristId, photoId);
        
        // Retorna se o turista deu like na foto ou não
        res.status(200).json({ liked });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falha ao verificar o like na foto da comunidade.' });
    }
});

router.route('/ranking').get(async (req, res) => {

    
    try {
        const leaderboardData   = await photoController.getLeaderboard();
        if (leaderboardData.length > 0) {
            res.status(200).json({ leaderboard: leaderboardData });
        } else {
            res.status(404).json({ error: 'Nenhum dado encontrado para o ranking.' });
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.message === 'Failed to fetch leaderboard: no data found.') {
            res.status(404).json({ error: 'Nenhum dado encontrado para o ranking.' });
        } else {
            res.status(500).json({ error: 'Falha ao buscar o ranking.' });
        }
    }
});

module.exports = router;