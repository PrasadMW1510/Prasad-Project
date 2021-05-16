import React, { Component } from 'react';
import {BrowserRouter, Route, Link, NavLink, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './ReduxStore/Dashboard/DashboardStore';
import Login from './components/Login';
import OverviewScreen from './components/Overview';
import ETLComponent from './components/ETLComponent';
import TabsComponent from './components/TabsComponent';
import DashboardUI from './components/Dispatchers/dashoardUI';
import ETLdispUI from './components/Dispatchers/ETLDispUI';
import IframeUI from './components/Dispatchers/IframeUI';
import OnboardUI from './components/Dispatchers/onboardUI';
import PortalUI from './components/Dispatchers/portalUI';
import ResourceUtilizationUI from './components/Dispatchers/ResourceUtilizationUI';
import Constants from '../src/assets/Constants.json';
// import SparkLinesInCardCollectionSource from './components/ResourceUtilization/SparkLineInCardSol';
import AreaChartResponsiveContainer from './components/ResourceUtilization/UtilizationTrendCPU';

class App extends Component {
  render() {
    return (    
      // <Provider store={store}>
      //   <BrowserRouter>
      //   <Switch>
		  //   <div>     
      //   <Route exact path={Constants.Routerpath.Login} component={Login}/>
      //   <Route exact path="/overview" component={OverviewScreen} /> 
      //   <Route exact path={Constants.Routerpath.ETL} component={ETLdispUI}/>
      //   <Route exact path={Constants.Routerpath.Dashboard} component={DashboardUI}/>
      //   <Route exact path={Constants.Routerpath.Iframe} component={IframeUI}/>
      //   <Route exact path={Constants.Routerpath.Configuration} component={OnboardUI}/>
      //   <Route exact path={Constants.Routerpath.Portal}  component={PortalUI}/> 
      //   <Route exact path={Constants.Routerpath.ResourceUtil} component={ResourceUtilizationUI}/>
      //   </div> 
      //   </Switch>
      //   </BrowserRouter> 
      //   </Provider>
      // // <SparkLinesInCardCollectionSource />
      <AreaChartResponsiveContainer />
    );
  }
}

export default App;