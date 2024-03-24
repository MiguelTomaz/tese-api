var Db  = require('./dboperations');

//Models
var User = require('./src/Models/User');
var Questions = require('./src/Models/Questions');
var Quiz = require('./src/Models/Quiz')
var Photo = require('./src/Models/Photo')

var express = require("express");
var bodyParser = require('body-parser');
var cors = require('cors');

//Routes
const userRoute = require('./src/routes/user');
const questionsRoute = require('./src/routes/questions');
const quizRoute = require('./src/routes/quiz');
const photoRoute = require('./src/routes/photo');
const route = require('./src/routes/route');


var app = express();
app.use(bodyParser.json({limit: '50000000000mb'}));
app.use(bodyParser.urlencoded({limit: '50000000000mb', extended: true}));

//var router = express.Router();

const bcrypt = require('bcrypt');



app.use(cors());
app.use('/api/user', userRoute);
app.use('/api/questions', questionsRoute);
app.use('/api/quiz', quizRoute);
app.use('/api/photo', photoRoute);
app.use('/api/route', route);
/**
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api/user/', router);

router.use((request,response,next)=>{
    console.log('router test');
    next();
 })
 
router.route('/users').get((request,response)=>{

    Db.getUsers().then(result => {
        response.json(result);
    })
})

router.route('/users').post((request,response)=>{

    const { email, password } = request.body; // Assume que os dados são enviados no corpo da requisição

    // Verifica se os dados obrigatórios (email e password) estão presentes
    if (!email || !password) {
        return response.status(400).json({ error: 'O email e a senha são obrigatórios: ' +  JSON.stringify(request.body) });
    }

    try {
        // Chama a função addUser para adicionar o novo usuário
        Db.addUser({ email, password });
        response.status(201).json({ message: 'Usuário adicionado com sucesso.' });
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: 'Ocorreu um erro ao adicionar o usuário.' });
    }
})
 */
var port = 3000;
app.listen(port);
console.log('Order API is runnning at ' + port);
