import '../../styles/dashboard.scss'
import { Card, Elevation } from '@blueprintjs/core';

const Dashboard: React.FC = () => {
  return (<div className="card_box"> <Card className="contentdisplay-content" elevation={Elevation.THREE}></Card> <h1>Hej</h1></div>);

};

export const Component = Dashboard;
Component.displayName = 'Dashboard';

export default Dashboard;
