import { Assessment } from 'src/commons/assessment/AssessmentTypes';
import { stat } from './StatisticsTypes';
import { Tokens, User } from 'src/commons/application/types/SessionTypes';
import { selectTokens } from 'src/commons/sagas/BackendSaga';
import { getAssessment, getStatistics, getStudents } from 'src/commons/sagas/RequestsSaga';
import { call } from 'redux-saga/effects';

export async function GetAssessment(assessmentId : number, tokens : Tokens) : Promise<Assessment | null> {  
  const assessment = await getAssessment(
      assessmentId,
      tokens
    );

  return assessment;

}

export async function GetNumberOfQuestion(assessmentId: number, all_stats :stat[], tokens : Tokens) : Promise<number> {
  const assessment = await getAssessment(
      assessmentId,
      tokens
    )

  console.log(assessment);
  return assessment!.questions.length;
}

export function GetQuestionIdOffset(assessment : Assessment, all_stats : stat[]) : number {
  return assessment.questions[0].id;
}

export function GetAllStatsByAssessmentAndQuestionId(assessmentId: number, questionId : number, all_stats : stat[]): stat[] {
  const stats : stat[] = [];    

  for (let i = 0; i < all_stats.length;i++) {
    console.log("stat:" , all_stats[i] as stat);
    console.log(all_stats[i].question_id);
    console.log(questionId, " == ", (all_stats[i] as stat).question_id, questionId == all_stats[i].question_id)
    if (all_stats[i].question_id == questionId) {
      stats.push(all_stats[i]);
    }
  }
  
  return stats;
}

export function GetNumberOfUniqueAnswers(stats : stat[] ) : number {
  let counter : number = 0;
  const usedUserID : number[] = [];

  for (let i = 0; i < stats.length;i++) {
      if (CheckIfUnique(stats[i].userID, usedUserID)) {
        usedUserID.push(stats[i].userID)
        counter++;
      }
  }

  return counter;
} 

export async function* GetTotalNumberOfStudents() {
  const tokens: Tokens = yield selectTokens();
  const students: User[] | null = yield call(getStudents, tokens);
  yield students == null ? 0 : students.length; 
}

export function* GetStatsFromDatabase(assessmentId: number, tokens: Tokens) {
  const a : stat[] | null = yield call(getStatistics,assessmentId,tokens)
  console.log("FromDatabase", a);
  return a;
}

export function GetAverageNumberOfTries(stats : stat[], uniqueAnswers : number) : number {  
  return uniqueAnswers == 0 ? 0 : stats.length / uniqueAnswers; 
}

function CheckIfUnique(value: number, list : number[]) : boolean {
  for (let i = 0; i < list.length; i++) {
    if (list[i] == value) {
      return false;
    }
  }

  return true;
}
