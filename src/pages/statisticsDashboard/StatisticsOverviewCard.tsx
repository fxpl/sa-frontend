import { Card, Elevation, H4, H6, Icon, Intent, Position, Text, Tooltip } from '@blueprintjs/core';
import { IconName, IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import defaultCoverImage from '../../assets/default_cover_image.jpg';
import { Role } from 'src/commons/application/ApplicationTypes';
import { Tokens } from 'src/commons/application/types/SessionTypes';
import NotificationBadge from 'src/commons/notificationBadge/NotificationBadge';
import { filterNotificationsByAssessment } from 'src/commons/notificationBadge/NotificationBadgeHelper';
import { beforeNow, getPrettyDate } from 'src/commons/utils/DateHelper';
import { useResponsive, useSession, useTokens } from 'src/commons/utils/Hooks';
import Markdown from 'src/commons/Markdown';
import { getStatistics } from 'src/commons/sagas/RequestsSaga';
import AssessmentInteractButton from './AssessmentInteractButton';
import { AssessmentOverview } from './AssessmentTypes';
import '../../styles/statisticsStyle.module.scss';
import { Stat } from 'src/features/statistics/StatisticsTypes';
// import { range } from 'lodash'; Remove?

// 1. get all stats from assessment
// 2. filter each stat connected to each question
// 3.

type AssessmentOverviewCardProps = {
  overview: AssessmentOverview;
  renderAttemptButton: boolean;
  renderGradingTooltip: boolean;
};

// Retrieves all stats given questionId, also using getStatistics call from backend.
function getStatsByQuestionId(stats: Stat[], questionId: number): Stat[] {
  const result: Stat[] = [];
  for (let i = 0; i < stats.length; i++) {
    if (stats[i].questionId === questionId) {
      result.push(stats[i]);
    }
  }
  return result;
}

// retrieves all unique questionID's
function getUniqueQuestionIds(stats: Stat[], assessmentId: number): number[] {
  const result: number[] = [];
  const filtered: Stat[] = stats.filter(stat => stat.assessmentId === assessmentId);
  for (let i = 0; i < filtered.length; i++) {
    if (result.indexOf(filtered[i].questionId) === -1) {
      result.push(filtered[i].questionId);
    }
  }
  return result;
}

// calculates average tries for each question
function avgTries(stats: Stat[], questionId: number): number {
  const qStats = getStatsByQuestionId(stats, questionId);
  if (qStats.length === 0) return 0; //qStats are now filled with single stats per question (UNIQUE)
  let total = 0;
  for (let i = 0; i < qStats.length; i++) {
    total += qStats[i].attemptNumber;
  }
  return total / qStats.length;
}

function StatsTable(numberOfQuestions: number, uniqueAnswers: number[], avgTries: number[]) {
  const questions = [<td key="q-label">Questions</td>];
  const answers = [<td key="a-label">Unique answers</td>];
  const tries = [<td key="t-label">Average tries</td>];

  for (let i = 0; i < numberOfQuestions; i++) {
    questions.push(<td key={`q-${i}`}>{`Q${i + 1}`}</td>);
    answers.push(<td key={`a-${i}`}>{uniqueAnswers[i]}</td>);
    tries.push(<td key={`t-${i}`}>{avgTries[i].toFixed(1)}</td>);
  }

  return (
    <table>
      <tbody>
        <tr>{questions}</tr>
        <tr>{answers}</tr>
        <tr>{tries}</tr>
      </tbody>
    </table>
  );
}

const StatisticsOverviewCard: React.FC<AssessmentOverviewCardProps> = ({
  overview,
  renderAttemptButton,
  renderGradingTooltip
}) => {
  const { isMobileBreakpoint } = useResponsive();
  const { role } = useSession();
  const tokens = useTokens({ throwWhenEmpty: false });
  const isAdminOrStaff = role === Role.Admin || role === Role.Staff;

  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    if (!isAdminOrStaff || !tokens.accessToken) return;
    getStatistics(overview.id, tokens as Tokens).then(data => {
      if (data) setStats(data);
    });
  }, [overview.id, isAdminOrStaff, tokens.accessToken, tokens.refreshToken]);

  //Get all questionIds in this assessment
  const questionIds: number[] = getUniqueQuestionIds(stats, overview.id);

  const uniqueAnswers = questionIds.map(
    qId => getStatsByQuestionId(stats, qId).length // one row = one student
  );

  const tries = questionIds.map(qId => avgTries(stats, qId));

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
              <H6>
                {stats.length > 0
                  ? StatsTable(questionIds.length, uniqueAnswers, tries)
                  : 'No answers yet...'}
              </H6>
            </div>
          ) : (
            <div>
              <H6>Student</H6>
            </div>
          )}

          <div className="listing-footer">
            <div>
              <Text className="listing-due-date">
                <Icon className="listing-due-icon" size={12} icon={IconNames.CALENDAR} />
                {`${beforeNow(overview.openAt) ? 'Opened' : 'Opens'}: ${getPrettyDate(overview.openAt)}`}
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
