class Quiz_Question_Association{
    constructor(id,quiz_id, question_id){
        this.id = id; 
        this.quiz_id = quiz_id; 
        this.question_id = question_id;
    }
}

module.exports = Quiz_Question_Association;