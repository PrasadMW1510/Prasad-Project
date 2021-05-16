import React from 'react';
import { AppBanner, AppToolbar, SearchwChips, Image, SimpleList, Tab, Tabs, Label, SelectItem, SvgIcon } from '@nokia-csf-uxr/csfWidgets';
import Redirect from './ClouderaManager';
import { BrowserRouter, Route, Link, NavLink, Switch } from 'react-router-dom';
import Landingscreen from './LandingScreenContent';
import IframeComponent from './IframeComponent';
import ExportCSV from './ExportCSV';
//ic_completed_failed
//ic_error_alert
//ic_finished_w_warning
const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const WARNING_ICON = <SvgIcon key="icon-warning" iconWidth="30" icon="ic_warning" iconColor="rgb(232, 157, 0)" />;
const ERROR_ICON = <SvgIcon key="icon-error" iconWidth="30" icon="ic_error_alert" iconColor="rgb(199, 47, 33)" />;

class StatusComponent extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      systemSelectedValue: "CXM",
      viewId: 'dashboard',
    };
  }


  render() {
    return (
      <div>
        <div className="statusAlign">
          {SUCCESS_ICON}
          <label>NORMAL(6)</label>
        </div>
        <div className="statusAlign">
          {WARNING_ICON}
          <label>WARNING(3)</label>
        </div>
        <div className="statusAlign">
          {ERROR_ICON}
          <label>ERROR(6)</label>
        </div>
      </div>
    );
  }
}

export default StatusComponent;