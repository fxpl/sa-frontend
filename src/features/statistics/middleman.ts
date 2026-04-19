let someData : number = 3;
let all_question : number[] = [];


export function TempWriteData(answer : number, question : number) {
    someData = answer;
    all_question.push(question);
    console.log("Writing Data", someData);
}

export function TempReadData() {
    return someData;
}

export function TempGetAllQuestions() : number[] {
    return all_question;
}

export function clearTempValues() {
    console.log("Cleared temp values!");
    all_question = [];
    someData = 0;
}
