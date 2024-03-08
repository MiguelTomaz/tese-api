const Quiz = require("../Models/Quiz");
const Quiz_Question_Association = require("../Models/Quiz_Question_Association");
const Questions =  require("../Models/Questions");
const bcrypt = require('bcrypt');
const sql = require("mssql");
var config = require('../../dbconfig');

const quizController = {};

async function createQuiz(touristId) {
    try {
        // Criar o quiz na tabela Quiz com o id do turista e score inicial 0
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('touristId', sql.Int, touristId)
            .query('INSERT INTO Quiz (tourist_id, score) VALUES (@touristId, 0); SELECT SCOPE_IDENTITY() AS QuizId;');
        
        const quizId = result.recordset[0].QuizId;

        // Obter 3 perguntas aleatórias da tabela Questions
        let questions = await pool.request()
            .query('SELECT TOP 2 * FROM Questions ORDER BY NEWID();');

        // Criar associação entre o quiz e as perguntas na tabela Quiz_Question_Association
        for (const question of questions.recordset) {
            await pool.request()
                .input('quizId', sql.Int, quizId)
                .input('questionId', sql.Int, question.id)
                .query('INSERT INTO Quiz_Question_Association (quiz_id, question_id) VALUES (@quizId, @questionId);');
        }
        return quizId;
        
    } catch (error) {
        console.log(error);
    }
}

async function getAllQuizzes() {
    try {
        let pool = await sql.connect(config);
        let quizzes = await pool.request().query("SELECT * FROM Quiz");
        return quizzes.recordset;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch quizzes.');
    }
}

async function getQuizzesByTouristId(touristId) {
    try {
        let pool = await sql.connect(config);
        let quizzes = await pool.request()
            .input('touristId', sql.Int, touristId)
            .query('SELECT * FROM Quiz WHERE tourist_id = @touristId');
        return quizzes.recordset;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch quizzes by tourist id.');
    }
}


async function addScoreToQuiz(quizId, score) {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('quizId', sql.Int, quizId)
            .input('score', sql.Int, score)
            .query('UPDATE Quiz SET score = @score WHERE id = @quizId;');
    } catch (error) {
        console.error(error);
        throw new Error('Failed to add score to quiz.');
    }
}

async function getAllQuestions() {
    try {
        let pool = await sql.connect(config);
        let questions = await pool.request().query("SELECT * from [Questions]");
        return questions.recordsets;
    }
    catch (error) {
        console.log(error);
    }
}

async function getQuizQuestions(quizId) {
    try {
        let pool = await sql.connect(config);
        let questions = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query('SELECT Q.* FROM Questions Q INNER JOIN Quiz_Question_Association QA ON Q.id = QA.question_id WHERE QA.quiz_id = @quizId');
        return questions.recordset;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch questions by quiz id.');
    }
}

async function calculateQuizTotalScore(quizId) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('quizId', sql.Int, quizId)
            .query('SELECT SUM(score) AS totalScore FROM Questions INNER JOIN Quiz_Question_Association ON Questions.id = Quiz_Question_Association.question_id WHERE Quiz_Question_Association.quiz_id = @quizId;');
        
        return result.recordset[0].totalScore || 0; // Retorna 0 se não houver perguntas associadas ao quiz
    } catch (error) {
        console.error(error);
        throw new Error('Failed to calculate quiz total score.');
    }
}

async function getTotalScoreByTouristId(touristId) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('touristId', sql.Int, touristId)
            .query('SELECT SUM(score) AS totalScore FROM Quiz WHERE tourist_id = @touristId');
        return result.recordset[0].totalScore || 0; // Retorna 0 se nenhum score for encontrado
    } catch (error) {
        console.error(error);
        throw new Error('Failed to calculate total score by tourist id.');
    }
}

async function getScoreByQuestionId(questionId) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('questionId', sql.Int, questionId)
            .query('SELECT score FROM Questions WHERE id = @questionId');
        
        if (result.recordset.length > 0) {
            return result.recordset[0].score;
        } else {
            throw new Error('Question not found.');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch score for question.');
    }
}

async function getQuestionById(questionId) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('questionId', sql.Int, questionId)
            .query('SELECT * FROM Questions WHERE id = @questionId');
        
        if (result.recordset.length > 0) {
            return result.recordset[0];
        } else {
            throw new Error('Question not found.');
        }
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch question.');
    }
}

module.exports = {
    getAllQuestions: getAllQuestions,
    createQuiz: createQuiz,
    addScoreToQuiz: addScoreToQuiz,
    getAllQuizzes: getAllQuizzes,
    getQuizzesByTouristId: getQuizzesByTouristId,
    getQuizQuestions: getQuizQuestions,
    calculateQuizTotalScore: calculateQuizTotalScore,
    getTotalScoreByTouristId: getTotalScoreByTouristId,
    getScoreByQuestionId: getScoreByQuestionId,
    getQuestionById: getQuestionById
}