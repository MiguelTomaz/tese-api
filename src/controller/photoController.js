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

                    await pool.request()
                    .input('photo_id', sql.Int, insertedId)
                    .input('tourist_id', sql.Int, touristId)
                    .query('INSERT INTO Gallery (photo_id, tourist_id) VALUES (@photo_id, @tourist_id)');

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

  module.exports = {
    addPhoto: addPhoto,
    getGallery: getGallery
}