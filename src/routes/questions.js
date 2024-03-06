const express = require('express');
const router = express.Router();
const quizController = require("../controller/quizController");
var config = require('../../dbconfig');
const sql = require("mssql");

router.route('/all').get((request,response)=>{

    quizController.getAllQuestions().then(result => {
        response.json(result);
    })
})

router.route('/score/:questionId').get(async (req, res) => {
    const questionId = req.params.questionId;
    try {
        const score = await quizController.getScoreByQuestionId(questionId);
        res.status(200).json({ score: score });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch score for question.' });
    }
});

router.route('/:questionId').get(async (req, res) => {
    const questionId = req.params.questionId;
    try {
        const question = await quizController.getQuestionById(questionId);
        res.status(200).json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch question.' });
    }
});



module.exports = router;
