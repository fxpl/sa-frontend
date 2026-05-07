import { Assessment } from 'src/commons/assessment/AssessmentTypes';
import { stat, Statistic } from './StatisticsTypes';

const all_stats: stat[] = [];

export function TempWriteData(answer: number, question: number, assessment: Assessment, userID : number | null) {
  const stats: stat = {
    answer: answer,
    questionId: question,
    assessment: assessment,
    userID: userID == null ? -1 : userID
  };

  all_stats.push(stats);
}

// This is ineffcient, hopefully we don't need this when using database 
export function GetQuestionIdOffset(assessmentId : number) : number {
  for(let i = 0; i < all_stats.length; i++) {
    if (all_stats[i].assessment.id == assessmentId) {
      return all_stats[i].assessment.questions[0].id;

    }
  }

  console.log("Error, could not find QuestionIdOffset");
  return 0;
}

export function TempGetAllStatsByAssessmentAndQuestionId(assessmentId: number, questionId : number): stat[] {
  const stats : stat[] = [];    
  console.log("AssessmentID, QuestionUD" , assessmentId, questionId);
  for (let i = 0; i < all_stats.length; i++) {
    console.log(all_stats[i])
    if (all_stats[i].assessment.id == assessmentId && all_stats[i].questionId == questionId) {
      stats.push(all_stats[i]);
    }
  }

  
  return stats;
}

export function GetAllStatsInAssessment(assessmentId : number) : stat[] {
  const stats : stat[] = []
  for (let i = 0; i < all_stats.length;i++) {
    if (all_stats[i].assessment.id == assessmentId) {
      stats.push(all_stats[i])
    } 
  }

  return stats;
}

export function GetNumberOfQuestion(assessmentId: number) : number {
  for (let i = 0; i < all_stats.length;i++ ) {
    if (all_stats[i].assessment.id == assessmentId) {
      return all_stats[i].assessment.questions.length;
    }
  }

  return -1;
}
