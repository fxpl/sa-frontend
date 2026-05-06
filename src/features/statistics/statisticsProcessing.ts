import { Assessment } from 'src/commons/assessment/AssessmentTypes';
import { stat } from './StatisticsTypes';
import { Tokens, User } from 'src/commons/application/types/SessionTypes';
import { selectTokens } from 'src/commons/sagas/BackendSaga';
import { getStudents } from 'src/commons/sagas/RequestsSaga';
import { call } from 'redux-saga/effects';

export function statisticsGetNumberOfCorrectAnswers(assessment: Assessment, questionId: number) {
  // console.log(assessment.questions[questionId].answer);
}

export function GetNumberOfCorrectAnswers(stats : stat[]) : number {
  return stats.length;
}

export function GetNumberOfUniqueAnswers(stats : stat[] ) : number {
  let counter : number = 0;
  let usedUserID : Number[] = [];

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

function CheckIfUnique(value: object, list : object[]) : boolean {
  for (let i = 0; i < list.length; i++) {
    if (list[i] == value) {
      return false;
    }
  }

  return true;
}





