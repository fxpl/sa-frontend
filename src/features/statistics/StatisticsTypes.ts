// vilka filer behöver vi ha 

// Vad ska vi importa?

// vilka funktioner?



export type QuizStats = {
    userID: string;
    quizID: string;
    started: boolean;
    passed: boolean;
    // startTime & endTime?
}

export type ExerciseStatistic = {

}



export type StudentStatistic = {
    userID: string;
    quiz: QuizStats[];
    // exercise: ExerciseStatistic[];
    // lesson: 
} 