import React,{Component} from 'react';
import{Tab,Tabs,SelectItem,Button} from '@nokia-csf-uxr/csfWidgets';
import Landingscreen from './LandingScreenContent';
import ic_refresh from '@nokia-csf-uxr/csfWidgets/images/ic_refresh.svg';
import moment from 'moment';
import configData from "../Config.json";
import AlertVisualization from './AlertVisualization';
import http from './service';

var getPrivilegesIDS;
var lastdate;
var  Roles;
var defaultAppName;
class TabsComponent extends React.Component{
    constructor(props){
        super(props);
        defaultAppName = window.localStorage.getItem("SELECTED_APPNAME");
        getPrivilegesIDS=JSON.parse(window.localStorage.getItem("AllTABSACESSIDS"))
        Roles=window.localStorage.getItem("MDAroles");
        this.state={
            selectedTab:true,
            refreshedTime: Date().toLocaleString(),
            refreshclicked:0,
            SystemFlag:false,
            systemValue:defaultAppName,
            currenturl:window.location.href,
            boolvalue:false,
            ETLClicked:false,
            PortalClicked:false,
            ShowContentApp:false,
            showExternalIntegrationView:false,
            showDataQuality:false,
            showAlertsVisual:false,
            showIntegratedView:false,
            dummyVarBool:false
            } 
            getPrivilegesIDS=window.localStorage.getItem("AllTABSACESSIDS");
            Roles=window.localStorage.getItem("MDAroles"); 
            console.log("AppnMAES",defaultAppName);
            console.log("sysre,mm",this.state.systemValue);
   
            if(this.state.currenturl.includes('etl')){
              this.setState({boolvalue:true,ETLClicked:true})
            }
            if(this.state.currenturl.includes('portal')){
              this.setState({boolvalue:true,ETLClicked:false,PortalClicked:true})
            }

    }    
   

    componentWillMount() {
      
      getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.INTEGRATED_VIEW)? this.setState({showIntegratedView:true}):this.setState({showIntegratedView:false});
      getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.CONTENT_APP_RESULTS_VIEW)? this.setState({ShowContentApp:true}):this.setState({ShowContentApp:false});
      getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.EXTERNAL_INTEGRATION_VIEW)? this.setState({showExternalIntegrationView:true}):this.setState({showExternalIntegrationView:false});
      getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.DATA_QUALITY)? this.setState({showDataQuality:true}):this.setState({showDataQuality:false});
          getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.ALERTS_NOTIFICATIONS_VIEW)? this.setState({showAlertsVisual:true}):this.setState({showAlertsVisual:false});
          console.log("getroles",Roles) ;
        console.log('this roleMangmnt') 
        Roles.includes(configData.ROLES_NAMES.ADMIN)? this.setState({showIntegratedView:true,ShowContentApp:true,showDataQuality:true,showExternalIntegrationView:true,showAlertsVisual:true}):this.setState({dummyVarBool:false});
    
      }



    tabClick(event){
       // alert("tabs click:"+event.value);
        
    }
    onButtonClick=(e)=> {
      
        const timestamp = new Date();
        window.localStorage.setItem("refreshedDate", timestamp);
        let timezone=moment(window.localStorage.getItem("refreshedDate")).format('DD/MM/YYYY - HH:mm');
        this.setState({ refreshedTime:timezone,
        SystemFlag:!this.state.SystemFlag,refreshclicked:this.state.refreshclicked+1});
        // systemValue:window.localStorage.getItem("systemName") },()=>{
        // console.log("values",this.state.refreshedTime,this.state.refreshclicked,this.state.systemValue);
           
            
        // }
        
        // )
        // this.setState({ bool:false},()=>{console.log("values",this.state.refreshedTime,this.state.refreshclicked);})
         
// this.props.handleData(this.state.refreshclicked);

        
      }
    render(){
   
        if (window.localStorage.getItem("refreshedDate") === null || undefined || '') {
            lastdate = moment(Date.now()).format('DD/MM/YYYY - HH:mm')
          }
          else {
            lastdate = window.localStorage.getItem("refreshedDate");
            lastdate=moment(lastdate).format('DD/MM/YYYY - HH:mm')
          }

       
        return(

        <div>
              <Tabs alignment="left" className="CheckingClass">
              {this.state.showIntegratedView?    <Tab id="integratedView" label="INTEGRATED VIEW" onClick={() => this.tabClick(this)}>
                        {!this.state.SystemFlag && !this.state.ETLClicked && !this.state.PortalClicked?<Landingscreen  systemValue={this.state.systemValue}  ETLClicked={this.state.ETLClicked} boolvalue={this.state.boolvalue} />:null}
                        {this.state.SystemFlag && !this.state.ETLClicked && !this.state.PortalClicked?<Landingscreen refreshValue={this.state.refreshclicked}  ETLClicked={this.state.ETLClicked} boolvalue={this.state.boolvalue} systemValue={this.state.systemValue} />:null}
                        {this.state.ETLClicked && !this.state.PortalClicked?<Landingscreen ETLClicked={this.state.ETLClicked} boolvalue={this.state.boolvalue}/>:null}
                        {!this.state.ETLClicked && this.state.PortalClicked?<Landingscreen ETLClicked={this.state.ETLClicked} boolvalue={this.state.boolvalue} PortalClicked={this.state.PortalClicked}/>:null}
                        </Tab>:''}
                        {/* {this.state.ShowContentApp? <Tab id="contentApp" label="CONTENT APP" onClick={() => this.tabClick(this)}>                                   
                    </Tab>:''} */}
                    {/* {this.state.showDataQuality?<Tab id="dataQuality" label="DATA QUALITY" onClick={() => this.tabClick(this)}></Tab>:''}
                    {this.state.showExternalIntegrationView?  <Tab id="externalIntegrations" label="EXTERNAL INTEGRATIONS" onClick={() => this.tabClick(this)}></Tab>:''} */}
                   
                    {this.state.showAlertsVisual?<Tab id="alerts" label="ALERTS VISUALIZATION" onClick={() => this.tabClick(this)}>
                    {this.state.SystemFlag ? <AlertVisualization />:null}
                    {!this.state.SystemFlag ? <AlertVisualization />:null}
                    </Tab>:''}
                </Tabs>

                <span className="lastrefresheddate">  <Button id="default" icon={ic_refresh} onClick={this.onButtonClick} style={{  top: "8px", borderRadius: "4px", width: "86px", fontSize: "12px" }} />
                  Last updated:{lastdate} </span>
        </div>
        );
    }
}

export default TabsComponent;