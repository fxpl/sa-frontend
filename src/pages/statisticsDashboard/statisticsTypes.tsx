 /* eslint-disable */
import { Card, Elevation } from "@blueprintjs/core";
import classNames from "classnames";
import NotificationBadge from "src/commons/notificationBadge/NotificationBadge";
import { filterNotificationsByAssessment } from "src/commons/notificationBadge/NotificationBadgeHelper";
import { useResponsive } from "src/commons/utils/Hooks";

export type StatisticsOverview = {
  id: number;
    openAt: string;
  private?: boolean;
  shortSummary: string;
  story: string | null;
  title: string;
  coverImage : string;
};

type StatisticsOverviewCardProps = {
  /** The assessment overview to display */
  overview: StatisticsOverview;
  /** Will only render the attempt button if true, regardless of attempt status. */
  renderAttemptButton: boolean;
  renderGradingTooltip: boolean;
};

export const StatisticsOverviewCard: React.FC<StatisticsOverviewCardProps> = ({
  overview,
  renderAttemptButton,
  renderGradingTooltip,
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
        
          <div className="listing-footer">
            <div className="listing-button">
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
