const Photo = require("../Models/Photo");
const bcrypt = require('bcrypt');
const sql = require("mssql");
var config = require('../../dbconfig');
const fs = require('fs');
const path = require('path');


async function addPhoto(photo) {
    try {
        let pool = await sql.connect(config);
        let insertPhoto = await pool.request()
            .input('tourist_route_association_id', sql.Int, photo.tourist_route_association_id)
            .input('description', sql.NVarChar, photo.description)
            .input('date', sql.DateTime, photo.date)
            .input('image_hash', sql.NVarChar, photo.image_hash)
            .input('filename', sql.NVarChar, photo.filename)
            .input('image_base64', sql.NVarChar, photo.image_base64)
            .query('INSERT INTO Photo (tourist_route_association_id, description, date, image_hash, filename, image_base64) VALUES (@tourist_route_association_id, @description, @date, @image_hash, @filename, @image_base64); SELECT SCOPE_IDENTITY() AS id');

        let touristId = null;
        let insertedId = null;
        if (insertPhoto.recordset && insertPhoto.recordset.length > 0) {
            insertedId = insertPhoto.recordset[0].id;
            let result = await pool.request()
                .input('tourist_route_association_id', sql.Int, photo.tourist_route_association_id)
                .query('SELECT tourist_id FROM Touristic_Route WHERE id = @tourist_route_association_id');

            if (result.recordset && result.recordset.length > 0) {
                touristId = result.recordset[0].tourist_id;

                // Adicionar à galeria do user
                await pool.request()
                    .input('photo_id', sql.Int, insertedId)
                    .input('tourist_id', sql.Int, touristId)
                    .query('INSERT INTO Gallery (photo_id, tourist_id) VALUES (@photo_id, @tourist_id)');

                // Adicionar à comunidade geral
                await pool.request()
                    .input('photo_id', sql.Int, insertedId)
                    .query('INSERT INTO Community (photo_id, photo_likes) VALUES (@photo_id, 0)');

                return { id: insertedId, touristId: touristId };
            }
            else {
                throw new Error('Failed to add photo to gallery: no corresponding tourist_id found.');
            }
        }
        else {
            throw new Error('Failed to add photo: no inserted ID returned.');
        }

    } catch (error) {
        console.log(error);
        throw new Error('Failed to add photo.');
    }
}

async function getGallery(touristId) {
    try {
        let pool = await sql.connect(config);

        // Obtém todas as fotos da galeria para o turista especificado
        let result = await pool.request()
            .input('touristId', sql.Int, touristId)
            .query('SELECT * FROM Gallery WHERE tourist_id = @touristId');

        let gallery = [];
        for (const item of result.recordset) {
            let photoResult = await pool.request()
                .input('photoId', sql.Int, item.photo_id)
                .query('SELECT * FROM Photo WHERE id = @photoId');

            if (photoResult.recordset.length > 0) {
                gallery.push(photoResult.recordset[0]);
            }
        }
        return gallery;
        // Verifica se há resultados retornados pela query
        if (result.recordset) {
            return result.recordset;
        } else {
            throw new Error('Failed to fetch gallery: no photos found.');
        }
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch gallery.');
    }
}

async function getCommunity() {
    try {
        let pool = await sql.connect(config);

        // Obtém todas as fotos da comunidade com o número de likes
        let result = await pool.request()
            .query(`
                SELECT 
                    Photo.*, 
                    Community.photo_likes,
                    Tourist.email
                FROM 
                    Photo 
                INNER JOIN 
                    Community ON Photo.id = Community.photo_id
                INNER JOIN 
                    Touristic_Route ON Photo.tourist_route_association_id = Touristic_Route.id
                INNER JOIN 
                    Tourist ON Touristic_Route.tourist_id = Tourist.id
            `);

        // Verifica se há resultados retornados pela query
        if (result.recordset) {
            return result.recordset;
        } else {
            throw new Error('Failed to fetch community: no photos found.');
        }
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch community.');
    }
}

async function likePhoto(touristId, photoId) {
    try {
        let pool = await sql.connect(config);

        let existingLike = await pool.request()
            .input('photoId', sql.Int, photoId)
            .input('touristId', sql.Int, touristId)
            .query('SELECT COUNT(*) AS count FROM [Like] WHERE photo_id = @photoId AND tourist_id = @touristId');

        if (existingLike.recordset[0].count > 0) {
            // Remove o like anterior se já existir
            await pool.request()
                .input('photoId', sql.Int, photoId)
                .input('touristId', sql.Int, touristId)
                .query('DELETE FROM [Like] WHERE photo_id = @photoId AND tourist_id = @touristId');

            // Atualiza o número de likes na tabela Community (subtrai 1 do número de likes)
            await pool.request()
                .input('photoId', sql.Int, photoId)
                .query('UPDATE Community SET photo_likes = photo_likes - 1 WHERE photo_id = @photoId');

            // Obtém o número atualizado de likes da foto
            let updatedLikesResult = await pool.request()
                .input('photoId', sql.Int, photoId)
                .query('SELECT photo_likes FROM Community WHERE photo_id = @photoId');

            let updatedLikes = updatedLikesResult.recordset[0].photo_likes;

            // Obtém o email do turista
            let touristEmailResult = await pool.request()
                .input('touristId', sql.Int, touristId)
                .query('SELECT email FROM Tourist WHERE id = @touristId');

            let touristEmail = touristEmailResult.recordset[0].email;

            return {
                message: `Like removido com sucesso pelo turista ${touristEmail} da foto da comunidade ${photoId}, que agora tem ${updatedLikes} likes.`,
                tourist_id: touristId,
                photo_id: photoId,
                likes: updatedLikes,
                like: false
            };
        }
        else {
            // Adiciona uma nova entrada à tabela Like
            await pool.request()
                .input('photoId', sql.Int, photoId)
                .input('touristId', sql.Int, touristId)
                .query('INSERT INTO [Like] (photo_id, tourist_id) VALUES (@photoId, @touristId)');

            // Atualiza o número de likes na tabela Community
            await pool.request()
                .input('photoId', sql.Int, photoId)
                .query('UPDATE Community SET photo_likes = photo_likes + 1 WHERE photo_id = @photoId');

            // Obtém o número atualizado de likes da foto
            let updatedLikesResult = await pool.request()
                .input('photoId', sql.Int, photoId)
                .query('SELECT photo_likes FROM Community WHERE photo_id = @photoId');

            let updatedLikes = updatedLikesResult.recordset[0].photo_likes;

            // Obtém o email do turista
            let touristEmailResult = await pool.request()
                .input('touristId', sql.Int, touristId)
                .query('SELECT email FROM Tourist WHERE id = @touristId');

            let touristEmail = touristEmailResult.recordset[0].email;
            return {
                message: `Like adicionado com sucesso pelo turista ${touristEmail} à foto da comunidade ${photoId}, que agora tem ${updatedLikes} likes.`,
                tourist_id: touristId,
                photo_id: photoId,
                likes: updatedLikes,
                like: true
            };
        }

    } catch (error) {
        console.log(error);
        throw new Error('Failed to add like.');
    }
}

async function checkIfLikedPhoto(touristId, photoId) {
    try {
        let pool = await sql.connect(config);

        // Verifica se o turista deu like nesta foto
        let existingLike = await pool.request()
            .input('photoId', sql.Int, photoId)
            .input('touristId', sql.Int, touristId)
            .query('SELECT COUNT(*) AS count FROM [Like] WHERE photo_id = @photoId AND tourist_id = @touristId');

        // Retorna true se o like existe, false caso contrário
        return existingLike.recordset[0].count > 0;
    } catch (error) {
        console.log(error);
        throw new Error('Falha ao verificar o like.');
    }
}

async function getLeaderboard() {
    try {
        let pool = await sql.connect(config);

        // Calcula o peso para cada turista
        let result = await pool.request().query(`
        SELECT TOP 3
                tourist_id,
                SUM(photo_count) AS photo_count,
                SUM(quiz_score) AS quiz_score,
                SUM(poi_visited) AS poi_visited
            FROM (
                SELECT 
                    Tourist.id AS tourist_id,
                    COUNT(Gallery.tourist_id) AS photo_count,
                    0 AS quiz_score,
                    0 AS poi_visited
                FROM 
                    Tourist
                LEFT JOIN 
                    Gallery ON Tourist.id = Gallery.tourist_id
                GROUP BY 
                    Tourist.id

                UNION ALL

                SELECT 
                    Tourist.id AS tourist_id,
                    0 AS photo_count,
                    SUM(ISNULL(Quiz.score, 0)) AS quiz_score,
                    poi_visited
                FROM 
                    Tourist
                LEFT JOIN 
                    Quiz ON Tourist.id = Quiz.tourist_id
                GROUP BY 
                    Tourist.id, poi_visited
            ) AS combined
            GROUP BY 
                tourist_id
                ORDER BY 
                (SUM(poi_visited) * 0.4) DESC, (SUM(quiz_score) * 0.3) DESC, (SUM(photo_count) * 0.3) DESC;
`);

        if (result.recordset.length > 0) {
            let leaderboard = await Promise.all(result.recordset.map(async entry => {
                // Consulta o email do turista usando o ID
                let emailResult = await pool.request().input('tourist_id', entry.tourist_id).query(`
                    SELECT email
                    FROM Tourist
                    WHERE id = @tourist_id
                `);
                // Verifica se encontrou um email
                if (emailResult.recordset.length > 0) {
                    // Retorna um objeto combinando os dados originais com o email
                    return {
                        tourist_id: entry.tourist_id,
                        photo_count: entry.photo_count,
                        quiz_score: entry.quiz_score,
                        poi_visited: entry.poi_visited,
                        email: emailResult.recordset[0].email // Adiciona o email ao objeto
                    };
                } else {
                    // Se não encontrar um email, retorna apenas os dados originais
                    return {
                        tourist_id: entry.tourist_id,
                        photo_count: entry.photo_count,
                        quiz_score: entry.quiz_score,
                        poi_visited: entry.poi_visited
                    };
                }
            }));
            return leaderboard;
        } else {
            throw new Error('Failed to fetch leaderboard: no data found.');
        }
    } catch (error) {
        console.log(error);
        throw new Error('Failed to fetch leaderboard.');
    }
}

module.exports = {
    addPhoto: addPhoto,
    getGallery: getGallery,
    getCommunity: getCommunity,
    likePhoto: likePhoto,
    checkIfLikedPhoto: checkIfLikedPhoto,
    getLeaderboard: getLeaderboard
}