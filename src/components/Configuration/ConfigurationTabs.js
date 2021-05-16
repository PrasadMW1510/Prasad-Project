import React, { Component } from 'react';
import { Tab, Tabs, SelectItem } from '@nokia-csf-uxr/csfWidgets';
import Onboard from './Onboard';
import AdapterLanding from "./AdapterLanding";
import ApplicationConfig from "./ApplicationConfig";
import RoleManagement from './RoleManagement';
import configData from "../../Config.json";
import AlertConfigurationView from './AlertConfigurationView';


var getPrivilegesIDS;
var  Roles;
class ConfigurationTabs extends React.Component {
    constructor(props) {
        getPrivilegesIDS=JSON.parse(window.localStorage.getItem("AllTABSACESSIDS"))
        Roles=window.localStorage.getItem("MDAroles");
        console.log("Roles",Roles)
        super(props);
        this.state = {
            tabsCollection:[],
            selectedTab: true,
            roleMangmnt:false,
            ScheduleExport:false,
            alertsView:false,
            onboard:false,
            adapater:false,
        }
        getPrivilegesIDS=window.localStorage.getItem("AllTABSACESSIDS");
        Roles=window.localStorage.getItem("MDAroles");
        console.log("all tabs access",getPrivilegesIDS)
  //  alert("Roles",  Roles.includes('PortalAdmin'))
      
    }
    componentWillMount() {
    //  if(Roles.includes('PortalAdmin')) {
    //         this.setState({roleMangmnt:true,onboard:true,adapater:true,ScheduleExport:true})}
    //         else{
    //             this.setState({roleMangmnt:false});}
    //             alert("Roles",  Roles.includes('PortalAdmin'))
    // if( getPrivileges.includes(configData.TABS_PRIVILIGES.SCHEDULE_EXPORT)){
    //      this.setState({ScheduleExport:true});}
    //      else
    //      {this.setState({ScheduleExport:true});}
    //      if( getPrivileges.includes(configData.TABS_PRIVILIGES.ALERT_VIEW)){
    //         this.setState({alertsView:true});}
    //         else
    //         {this.setState({alertsView:true});}

        getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.SCHEDULE_EXPORT)? this.setState({ScheduleExport:true}):this.setState({ScheduleExport:false});
        getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.ALERTS_CONFIG_VIEW)? this.setState({alertsView:true}):this.setState({alertsView:false});
        getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.ONBOARD)? this.setState({onboard:true}):this.setState({onboard:false});
        getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.ADAPTER)? this.setState({adapater:true}):this.setState({adapater:false});
        console.log("getroles",Roles) ;
      console.log('this roleMangmnt') 
      Roles.includes(configData.ROLES_NAMES.ADMIN)? this.setState({roleMangmnt:true,onboard:true,adapater:true,ScheduleExport:true}):this.setState({roleMangmnt:false});
  
    }
    tabClicked(event) {
        // alert("tabs click:"+event.value);

    }


    render() {

        return (

            <div>
                <Tabs alignment="left">
                  {this.state.onboard?<Tab id="onboard" label="ONBOARD" onClick={() => this.tabClicked(this)}>
                        <Onboard />
                    </Tab>:''}
                      {/* {this.state.adapater?<Tab id="adapter" label="ADAPTER" onClick={() => this.tabClicked(this)}>
                    <AdapterLanding />
                    </Tab>:''} */}
                    { this.state.roleMangmnt? <Tab id="roleManagement" label="ROLE MANAGEMENT" onClick={() => this.tabClicked(this)}>
                     <RoleManagement/>
                    </Tab>:''}
                     { this.state.ScheduleExport? <Tab id="scheduledExport" label="SCHEDULED EXPORT" onClick={() => this.tabClicked(this)}> 
                    <div style={{margin:"250px", marginLeft:"500px"}}>
                    Page is under development
                   </div> </Tab>:''}
                    {this.state.alertsView?<Tab id="AlertConfiguration" label="ALERT CONFIGURATION" onClick={() => this.tabClicked(this)}>
                   <AlertConfigurationView />
                    </Tab>:''}
                    
                </Tabs>
            </div>
        );
    }
}

export default ConfigurationTabs;


