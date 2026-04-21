/* eslint-disable */

import * as MM from '../../features/statistics/middleman';
import { StatisticsOverview, StatisticsOverviewCard } from './statisticsTypes';

const Dashboard: React.FC = () => {
  const someData = MM.TempReadData();
  const all_questions = MM.TempGetAllQuestions();
  const rows = [];
  const overview: StatisticsOverview = {
    id: 0,
    openAt: 'va',
    closeAt: 'Close',
    shortSummary: 'då',
    story: null,
    title: 'hej',
    coverImage: 'https://robohash.org/212.25.146.155.png'
  };

  for (let i = 0; i < all_questions.length; i++) {
    rows.push(<div>{i}</div>);
  }

  return (
    <div>
      {' '}
      <h1> Hej {someData} </h1>
      <div>
        {' '}
        {rows}
        <div />
      </div>
      <StatisticsOverviewCard
        key={3}
        overview={overview}
        renderAttemptButton
        renderGradingTooltip={false}
      />
      <button onClick={MM.clearTempValues} color="orange">
        {' '}
        Clear{' '}
      </button>{' '}
    </div>
  );
};

export const Component = Dashboard;
Component.displayName = 'Dashboard';

export default Dashboard;
