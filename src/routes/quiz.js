const express = require('express');
const router = express.Router();
const quizController = require("../controller/quizController");
var config = require('../../dbconfig');
const sql = require("mssql");

router.route('/create/:touristId').post(async (req, res) => {
    const touristId = req.params.touristId;
    try {
        const quizId = await quizController.createQuiz(touristId);
        res.status(201).json({ message: 'Quiz created successfully, with the id: ' + quizId, quizId: quizId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to create quiz.' });
    }
});

router.route('/updateScore/:quizId/:score').post(async (req, res) => {
    const quizId = req.params.quizId;
    const score = req.params.score;
    try {
        await quizController.addScoreToQuiz(quizId, score);
        res.status(200).json({ message: 'Score updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update score.' });
    }
});

router.route('/all').get(async (req, res) => {
    try {
        const quizzes = await quizController.getAllQuizzes();
        res.status(200).json(quizzes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch quizzes.' });
    }
});

router.route('/all/:touristId').get(async (req, res) => {
    const touristId = req.params.touristId;
    try {
        const quizzes = await quizController.getQuizzesByTouristId(touristId);
        res.status(200).json(quizzes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch quizzes by tourist id.' });
    }
});

router.route('/questions/:quizId').get(async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const questions = await quizController.getQuizQuestions(quizId);
        res.status(200).json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch questions by quiz id.' });
    }
});

router.route('/score/quiz/:quizId').get(async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const totalScore = await quizController.calculateQuizTotalScore(quizId);
        res.status(200).json({ total: totalScore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to calculate quiz total score.' });
    }
});

router.route('/score/user/:touristId').get(async (req, res) => {
    const touristId = req.params.touristId;
    try {
        const totalScore = await quizController.getTotalScoreByTouristId(touristId);
        res.status(200).json({ totalScore: totalScore });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to calculate total score by tourist id.' });
    }
});

module.exports = router;