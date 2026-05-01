import { Assessment } from "src/commons/assessment/AssessmentTypes";
import { stat, Statistic } from "./StatisticsTypes";

let someData: number = 3;
let all_question: number[] = [];
const all_stats: stat[] = [];


export function TempWriteData(answer: number, question: number, assessment : Assessment) {
  const stats : stat = {
    answer: answer,
    questionId: question,
    assessment: assessment
  }
  
  all_stats.push(stats);
  someData = answer;
  all_question.push(question);
  console.log('Writing Data', someData);
}

export function TempReadData() {
  return someData;
}

export function TempGetAllQuestions(): number[] {
  return all_question;
}

export function TempGetStatsById(id : number) : stat | null {
  for (let i = 0; i < all_stats.length;i++) {
    if (all_stats[i].assessment.id == id) {
      return all_stats[i];
    }
  }

  console.log("ERROR no statistics for assessment with id ", id);
  return null;
}


export function clearTempValues() {
  console.log('Cleared temp values!');
  all_question = [];
  someData = 0;
}
