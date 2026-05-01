import { Assessment } from "src/commons/assessment/AssessmentTypes";

export function statisticsGetNumberOfCorrectAnswers(assessment : Assessment, questionId : number) {
    console.log(assessment.questions[questionId].answer);
}
