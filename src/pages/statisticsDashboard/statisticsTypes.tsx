import { Card, Elevation, H4, H6, Icon, Tooltip, Text, Button } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import classNames from 'classnames';
import Markdown from 'src/commons/Markdown';
import NotificationBadge from 'src/commons/notificationBadge/NotificationBadge';
import { filterNotificationsByAssessment } from 'src/commons/notificationBadge/NotificationBadgeHelper';
import { beforeNow, getPrettyDate } from 'src/commons/utils/DateHelper';
import { useResponsive } from 'src/commons/utils/Hooks';

export type StatisticsOverview = {
  id: number;
  openAt: string;
  closeAt: string;
  private?: boolean;
  shortSummary: string;
  story: string | null;
  title: string;
  coverImage: string;
};

type StatisticsOverviewCardProps = {
  /** The assessment overview to display */
  overview: StatisticsOverview;
  /** Will only render the attempt button if true, regardless of attempt status. */
  renderAttemptButton: boolean;
  renderGradingTooltip: boolean;
};

type StatisticsOverviewCardTitleProps = {
  overview: StatisticsOverview;
  renderProgressStatus: boolean;
};

const StatisticsOverviewCardTitle: React.FC<StatisticsOverviewCardTitleProps> = ({
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
        {null}
      </H4>
    </Text>
  </div>
);


export const StatisticsOverviewCard: React.FC<StatisticsOverviewCardProps> = ({
  overview,
  renderAttemptButton,
  renderGradingTooltip
}) => {
  const { isMobileBreakpoint } = useResponsive();
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
            
            src={overview.coverImage}
          />
        </div>
        <div className={classNames('listing-text', !isMobileBreakpoint && 'col-xs-9')}>
          <StatisticsOverviewCardTitle
            overview={overview}
            renderProgressStatus={renderGradingTooltip}
          />
          <div className="listing-description">
            <Markdown content={overview.shortSummary} />
          </div>
          
            <div>
              <H6> This is an individual assessment. </H6>
            </div>
        
          <div className="listing-footer">
            <div>
              <Text className="listing-due-date">
                <Icon className="listing-due-icon" size={12} icon={IconNames.CALENDAR} />
                {`${beforeNow(overview.openAt) ? 'Opened' : 'Opens'}: ${getPrettyDate(
                  overview.openAt
                )}`}
              </Text>
              SOverviewC
              {beforeNow(overview.openAt) && (
                <Text className="listing-due-date">
                  <Icon className="listing-due-icon" size={12} icon={IconNames.TIME} />
                  {`Due: ${getPrettyDate(overview.closeAt)}`}
                </Text>
              )}
            </div>
            <div className="listing-button">
              <Button>Button here</Button>
            </div>
          </div>
        </div>
      <img
      src='src/assets/statsprototyp.jpg'
      />
      </Card>

    </div>
  );
};




