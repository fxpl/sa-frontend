import { Card, Elevation, H4, H6, Icon, Intent, Position, Text, Tooltip } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import defaultCoverImage from '../../assets/default_cover_image.jpg';
import AssessmentInteractButton from './AssessmentInteractButton';
import { AssessmentOverview } from './AssessmentTypes';
import { GetNumberOfQuestion, GetQuestionIdOffset, TempGetAllQuestions, TempGetAllStatsByAssessmentAndQuestionId } from 'src/features/statistics/middleman';
import { GetAverageNumberOfTries, GetNumberOfCorrectAnswers, GetNumberOfUniqueAnswers, GetTotalNumberOfStudents, statisticsGetNumberOfCorrectAnswers } from 'src/features/statistics/statisticsProcessing';
import { Role } from 'src/commons/application/ApplicationTypes';
import NotificationBadge from 'src/commons/notificationBadge/NotificationBadge';
import { filterNotificationsByAssessment } from 'src/commons/notificationBadge/NotificationBadgeHelper';
import { beforeNow, getPrettyDate } from 'src/commons/utils/DateHelper';
import { useResponsive, useSession } from 'src/commons/utils/Hooks';
import Markdown from 'src/commons/Markdown';
import { stat } from 'src/features/statistics/StatisticsTypes';
import '../../styles/statisticsStyle.module.scss';



type AssessmentOverviewCardProps = {
  /** The assessment overview to display */
  overview: AssessmentOverview;
  /** Will only render the attempt button if true, regardless of attempt status. */
  renderAttemptButton: boolean;
  renderGradingTooltip: boolean;
};

/** A card to display `AssessmentOverview`s. */
const StatisticsOverviewCard: React.FC<AssessmentOverviewCardProps> = ({
  overview,
  renderAttemptButton,
  renderGradingTooltip,
}) => {
  const { isMobileBreakpoint } = useResponsive();
  const { role } = useSession();
  const isAdmin = role === Role.Admin;

  // FIXME: lots of errorchecking needed!
  const statsAllQuestions = TempGetAllQuestions();
  const assessmentId = overview.id;
  let stat : stat;
  const numberOfQuestions = GetNumberOfQuestion(assessmentId);

  let arr : number[] = []
  let unique : number[] = []
  let tries : number[] = []

  const questionIdOffst = GetQuestionIdOffset(assessmentId);
  for (let i = 0; i < numberOfQuestions; i++) {
    let a = TempGetAllStatsByAssessmentAndQuestionId(assessmentId,i + questionIdOffst);
    arr[i] = GetNumberOfCorrectAnswers(a); 
    unique[i] = GetNumberOfUniqueAnswers(a);
    tries[i] = GetAverageNumberOfTries(a, unique[i]);
  }
      
  const listOfAnswers = arr.map(arr => <li>{arr}</li>);
  const listOfUniqueAnswers = unique // = unique.map(unique => <li style = {{display: "inline-block" }}>{unique}</li>); //Unique as in only one answer from each student

  //console.log(stat);
  //if (stat !== null) {
    //statisticsGetNumberOfCorrectAnswers(stat.assessment, stat?.questionId);
  //}
  return (
    <div>
      <Card className="row listing" elevation={Elevation.ONE}>
        <div className={classNames('listing-picture', !isMobileBreakpoint && 'col-xs-3')}>
          <NotificationBadge
            className="badge"
            notificationFilter={filterNotificationsByAssessment(overview.id)}
            large={true}
          />
          <img
            alt="Assessment"
            className={`cover-image-${overview.status}`}
            src={overview.coverImage ? overview.coverImage : defaultCoverImage}
          />
        </div>
        <div className={classNames('listing-text', !isMobileBreakpoint && 'col-xs-9')}>
          <AssessmentOverviewCardTitle
            overview={overview}
            renderProgressStatus={renderGradingTooltip}
          />
          <div className="listing-description">
            <Markdown content={overview.shortSummary} />
          </div>

          {isAdmin ? (
            <div className="listing-statistics">
              <div>
                <H6>{statsAllQuestions.length > 0 ? Table(numberOfQuestions, listOfUniqueAnswers, tries) : 'No answers yet...'}</H6>
              </div>    
            </div>
          ) : (
            <div>
              <H6> Student </H6>
            </div>
          )}

          <div className="listing-footer">
            <div>
              <Text className="listing-due-date">
                <Icon className="listing-due-icon" size={12} icon={IconNames.CALENDAR} />
                {`${beforeNow(overview.openAt) ? 'Opened' : 'Opens'}: ${getPrettyDate(
                  overview.openAt
                )}`}
              </Text>

              {beforeNow(overview.openAt) && (
                <Text className="listing-due-date">
                  <Icon className="listing-due-icon" size={12} icon={IconNames.TIME} />
                  {`Due: ${getPrettyDate(overview.closeAt)}`}
                </Text>
              )}
            </div>
            <div className="listing-button">
              {renderAttemptButton ? <AssessmentInteractButton overview={overview} /> : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};


function Table(numberOfQuestions : number, uniqueAnswers : number[], tries : number[]) {
  const questions = [];
  const answers = [];
  const avgTries = [];
  //const students = await GetTotalNumberOfStudents();
  //console.log("students: ", students);

  questions.push(<td>Questions</td>);
  answers.push(<td>Answers</td>);
  avgTries.push(<td>Average Tries</td>);
  
  for (let i = 0; i < numberOfQuestions; i++) {
    questions.push(<td>{"Q" + (i+1) + " "}</td>);
    answers.push(<td>{uniqueAnswers[i]}</td>)
    avgTries.push(<td>{tries[i]}</td>)
  }

  return (
    <table >
    <tr>
      {questions}
    </tr>
    <tr>
      {answers}
    </tr>
    <tr>
      {avgTries}
    </tr>
  </table> 
  )
}

type AssessmentOverviewCardTitleProps = {
  overview: AssessmentOverview;
  renderProgressStatus: boolean;
};

const AssessmentOverviewCardTitle: React.FC<AssessmentOverviewCardTitleProps> = ({
  overview,
  renderProgressStatus
}) => (
  <div className="listing-header">
    <Text ellipsize={true}>
      <H4 className="listing-title">
        {overview.title}
        {overview.private ? (
          <Tooltip
            className="listing-title-tooltip"
            content="This assessment is password-protected."
          >
            AssessmentOverviewCardTitle
            <Icon icon="lock" />
          </Tooltip>
        ) : null}
        {renderProgressStatus ? showGradingTooltip(overview.isGradingPublished) : null}
      </H4>
    </Text>
  </div>
);

const showGradingTooltip = (isGradingPublished: boolean) => {
  let iconName: IconName;
  let intent: Intent;
  let tooltip: string;

  if (isGradingPublished) {
    iconName = IconNames.TICK;
    intent = Intent.SUCCESS;
    tooltip = 'Fully graded';
  } else {
    // shh, hide actual grading progress from users even if graded
    iconName = IconNames.TIME;
    intent = Intent.WARNING;
    tooltip = 'Grading in progress';
  }

  return (
    <Tooltip className="listing-title-tooltip" content={tooltip} placement={Position.RIGHT}>
      <Icon icon={iconName} intent={intent} />
    </Tooltip>
  );
};

export default StatisticsOverviewCard;
