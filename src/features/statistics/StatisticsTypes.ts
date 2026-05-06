// vilka filer behöver vi ha
import { Assessment } from 'src/commons/assessment/AssessmentTypes';

// Vad ska vi importa?

// vilka funktioner?

export type stat = {
  answer: number;
  questionId: number;
  assessment: Assessment;
  userID: number
};

export type QuizStatistic = {};

export type ExerciseStatistic = {};

export type Statistic = {
  userID: string;
  quiz: QuizStatistic[];
  // exercise: ExerciseStatistic[];
  // lesson:
};
