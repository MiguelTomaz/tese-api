class Questions{
    constructor(id,question_en, question_pt, answer1_en, answer2_en, answer3_en, correct_answer_en,
        answer1_pt, answer2_pt, answer3_pt, correct_answer_pt,
        score, difficulty){
        this.id = id; 
        this.question_en = question_en; 
        this.question_pt = question_pt;
        this.answer1_en = answer1_en;
        this.answer2_en = answer2_en;
        this.answer3_en = answer3_en;
        this.correct_answer_en = correct_answer_en;
        this.answer1_pt = answer1_pt;
        this.answer2_pt = answer2_pt;
        this.answer3_pt = answer3_pt;
        this.correct_answer_pt = correct_answer_pt;
        this.score = score;
        this.difficulty = difficulty; 
    }
}

module.exports = Questions;