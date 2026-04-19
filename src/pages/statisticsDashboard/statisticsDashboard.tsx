import { Button } from '@tremor/react';
import * as MM from '../../features/statistics/middleman';

const Dashboard: React.FC = () => {
  
  const someData = MM.TempReadData();
  const all_questions = MM.TempGetAllQuestions();
  const rows = [];
  for (let i = 0; i < all_questions.length;i++) {
    rows.push(<div>{i}</div>);
  }


  return (<div> <h1>Hej {someData} </h1><div> {rows}<div/></div> 
    <Button
      text='Clear Data'
      onClick={MM.clearTempValues}
      color='orange'
      /> </div> 


  );

};

export const Component = Dashboard;
Component.displayName = 'Dashboard';

export default Dashboard;
