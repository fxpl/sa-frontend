import '../../styles/statisticsStyle.module.scss';

import { Card, Elevation, H4, H6, Icon, Intent, Position, Text, Tooltip } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Role } from 'src/commons/application/ApplicationTypes';
import { Tokens } from 'src/commons/application/types/SessionTypes';
import AssessmentInteractButton from 'src/commons/assessment/AssessmentInteractButton';
import { Assessment, AssessmentOverview } from 'src/commons/assessment/AssessmentTypes';
import Markdown from 'src/commons/Markdown';
import NotificationBadge from 'src/commons/notificationBadge/NotificationBadge';
import { filterNotificationsByAssessment } from 'src/commons/notificationBadge/NotificationBadgeHelper';
import { getStatistics } from 'src/commons/sagas/RequestsSaga';
import { beforeNow, getPrettyDate } from 'src/commons/utils/DateHelper';
import { useResponsive, useSession } from 'src/commons/utils/Hooks';
import {
  GetAllStatsByAssessmentAndQuestionId,
  GetAssessment,
  GetAverageNumberOfTries,
  GetNumberOfQuestion,
  GetNumberOfUniqueAnswers,
  GetQuestionIdOffset} from 'src/features/statistics/statisticsProcessing';
import { stat } from 'src/features/statistics/StatisticsTypes';

import defaultCoverImage from '../../assets/default_cover_image.jpg';

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
  renderGradingTooltip
}) => {
  const { isMobileBreakpoint } = useResponsive();
  const { role, accessToken, refreshToken } = useSession();
  const isAdminOrStaff = role === Role.Admin || role === Role.Staff;
  const at = accessToken;
  const rt = refreshToken;

  const [stats, setStats] = useState<stat[]>([]);
  const [numberOfQuestions, setQuestions] = useState<number>();
  const [assessment, setAssessment] = useState<Assessment>();

  const tokens: Tokens = {
    accessToken: at!,
    refreshToken: rt!
  };

  useEffect(() => {
    if (!isAdminOrStaff || !tokens.accessToken) return;
    getStatistics(overview.id, tokens as Tokens).then(data => {
      if (data) setStats(data);
    });

    GetAssessment(overview.id, tokens as Tokens).then(data => {
      if (data) setAssessment(data);
    });

    GetNumberOfQuestion(overview.id, stats, tokens as Tokens).then(data => {
      if (data) setQuestions(data);
    });
  }, [overview.id, isAdminOrStaff, tokens.accessToken, tokens.refreshToken]);

  //,

  if (at == undefined || rt == undefined) {
    return <div>Accesstoken expired, please login again</div>;
  }

  if (assessment == null) {
    return;
  }

  const assessmentId = overview.id;

  const unique: number[] = [];
  const tries: number[] = [];
  const questionIdOffst = GetQuestionIdOffset(assessment!, stats);

  for (let i = 0; i < numberOfQuestions!; i++) {
    const a = GetAllStatsByAssessmentAndQuestionId(assessmentId, i + questionIdOffst, stats);

    unique[i] = GetNumberOfUniqueAnswers(a);
    tries[i] = GetAverageNumberOfTries(a, unique[i]);
  }

  const listOfUniqueAnswers = unique;

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

          {isAdminOrStaff ? (
            <div className="listing-statistics">
              <div>
                <H6>
                  {numberOfQuestions! > 0
                    ? Table(numberOfQuestions!, listOfUniqueAnswers, tries)
                    : 'No answers submitted'}
                </H6>
              </div>
            </div>
          ) : (
            <div>
              <H6> If you are a student and are seeing this, conntact course teachers </H6>
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

function Table(numberOfQuestions: number, uniqueAnswers: number[], tries: number[]) {
  const questions = [];
  const answers = [];
  const avgTries = [];

  questions.push(<td>Questions</td>);
  answers.push(<td>Students</td>);
  avgTries.push(<td>Average Tries</td>);

  for (let i = 0; i < numberOfQuestions; i++) {
    questions.push(<td>{'Q' + (i + 1) + ' '}</td>);
    answers.push(<td>{uniqueAnswers[i]}</td>);
    avgTries.push(<td>{tries[i]}</td>);
  }

  return (
    <table>
      <tr>{questions}</tr>
      <tr>{answers}</tr>
      <tr>{avgTries}</tr>
    </table>
  );
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
