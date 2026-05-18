// vilka filer behöver vi ha

// Vad ska vi importa?

// vilka funktioner?

// export type stat = {
//   answer: number;
//   questionId: number;
//   assessment: Assessment;
//   userID: number
// };

export type Stat = {
  questionId: number;
  assessmentId: number;
  courseRegistrationId: number;
  answer: number;
  attemptNumber: number;
};

export type QuizStatistic = {};

export type ExerciseStatistic = {};

export type Statistic = {
  userID: string;
  quiz: QuizStatistic[];
  // exercise: ExerciseStatistic[];
  // lesson:
};
