import React from 'react';
import { SelectItem, SvgIcon, Dialog } from '@nokia-csf-uxr/csfWidgets';
import UpdateOverAllStatus from './UpdateStatus';
import PropTypes from 'prop-types';
import CardCollectionComponent from './CardCollectionComponent';
import ETLcomponent from './ETLComponent';
import BreadCrumb from './Breadcrumb';
import '../Styles/LandingScreenContent.css';
import ExportLandingScreen from './ExportLandingScreen';
import PortalExpansionPanel from './PortalHealthStatus';
import http from './service';
import configData from "../Config.json";
import * as dateTime from './DateAndTime';
import Constants from '../assets/Constants.json';
import { withRouter } from 'react-router';
import axios from "axios";
import moment from 'moment';
import {connect} from 'react-redux';


const startDateTime="00:00"; 
const endDateTime="23:59";
var dashboardResponse;   

const FILTER_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_filter" iconColor="rgb(18, 65, 145)" />;

const systemsSample=[
  // {
  //     "label":"NCI",
  //     "value":"NCI"
  // },
  // {
  //     "label":"CNI",
  //     "value":"CNI"
  // },
  // {
  //     "label":"Sandbox",
  //     "value":"Sandbox"
  // },
  // {
  //     "label":"PRE",
  //     "value":"PRE"
  // }

];
var getactions;
var Roles;
var getTabs;
var defaultAppID, defaultAppName;
//var selectdata = "NCI";
class landingScreenContent extends React.Component {
  static propTypes = {
    responsive: PropTypes.bool,
    selectable: PropTypes.bool,
    singleSelection: PropTypes.bool,
    selectableCardSizeNotChanged: PropTypes.bool,
    appToolbar: PropTypes.bool,
  };
  static defaultProps = {
    responsive: false,
    selectable: false,
    singleSelection: false,
    selectableCardSizeNotChanged: false,
    appToolbar: false,
  };
  constructor(props) {
    let getactionvalue=JSON.parse(window.localStorage.getItem('ALLACTIONSACCESSIDS'));
    Roles=window.localStorage.getItem("MDAroles");
    super(props);

    this.onSystemNameChange = this.onSystemNameChange.bind(this);
    defaultAppID = window.localStorage.getItem("SELECTED_APPID");
    defaultAppName = window.localStorage.getItem("SELECTED_APPNAME");

    this.state = {
      boolvalue: props.boolvalue,
      ETLClicked:props.ETLClicked,
      PortalClicked:props.PortalClicked,
      systems: [],
      systemSelectedValue: defaultAppID,
      breadCrumbLabel: "",
      totalCntNormal: 0,
      totalCntWarning: 0,
      totalCntError: 0,
      defaultclick: true,
      updateClick: false,
      statusClickStatus: false,
      updateElementId: "",
      NormalIconClicked: false,
      ErrorIconClicked: false,
      WarningIconClicked: false,
      ApplicationChangeFlag: false,
      tempApplicationChangeFlag: true,
      refreshValue: props.refreshValue,
      systemValue: props.systemValue,
      exportDialog: false,
      isPopupClosed: true,
      currenturl:window.location.href,
      applicationName:props.systemValue,
      getActions:getactionvalue,
      showExport:false,
      isOverallStatusUpdated:false

    }

     dashboardResponse = this.props.dashboardResponse;
    console.log("dashboardResponse in landing***************", dashboardResponse);
   

    this.getApplicationNames();
    this.getAppWiseStatusCnt(this.state.systemSelectedValue,this.props.systemValue);

    this.outputEvent = this.outputEvent.bind(this);
    this.StatusClickEvent = this.StatusClickEvent.bind(this);

  };
  componentWillMount() {
    let action=window.localStorage.getItem('ALLACTIONSACCESSIDS');
    console.log("getActions",action);
    this.setState({getActions:action})
 
      console.log("getActions",this.state.getActions);
      if(((action).includes(configData.TABS_PRIVILIGES_IDS.EXPORT))){
        this.setState({showExport:true});
        }
        else{
          this.setState({showExport:false}); 
            }
        
        if( Roles.includes(configData.ROLES_NAMES.ADMIN)){
       this.setState({showExport:true});
        }
        this.forceUpdate();   
   
  }
  componentWillReceiveProps(props) {
    this.setState({ refreshValue: props.refreshValue, systemValue: props.systemValue });
  }

  getAppWiseStatusCnt = (selectedSystemID,selectedSystemName) => {
    if (this.props.systemValue !== undefined || null || '') {
      //this.setState({ systemSelectedValue: this.state.systemValue, appName: this.state.systemValue });
    //  this.setState({ systemSelectedValue: this.state.systemSelectedValue, appName: this.state.systemValue });
    this.setState({ systemSelectedValue: selectedSystemID, appName: selectedSystemName });
     
    }
    else {
     // this.setState({ systemSelectedValue: 'NCI', appName: 'NCI' });
     this.setState({ systemSelectedValue: defaultAppID, appName: defaultAppName });
    
    }
    
    this.setState({
      totalCntNormal: 0,
      totalCntWarning: 0,
      totalCntError: 0
    });
    
    let  params = {
     // APPLICATION_NAME:this.props.appName,
     APPLICATION_ID:this.state.systemSelectedValue,
     APPLICATION_NAME:this.state.applicationName,
     COMPONENT_NAME:"ETL",     
     START_DATE:dateTime.getCurrentDate()+" "+startDateTime,
     END_DATE:dateTime.getCurrentDate()+" "+endDateTime
    }

    console.log("dashboardResponse inside call",dashboardResponse);   
      
      http.get(configData.API.SERVICE.LANDING,{params})
      .then(response => {
        console.log("Landing Screen data is"+JSON.stringify(response.data));
        let listOfLayers = response.data;

        this.props.dispatch({
          type:"GET_DASHBOARD_RESPONSE",
          payload:response
        });

        let cnt = 0;
        let totalCntNormal = 0;
        let totalCntWarning = 0;
        let totalCntError = 0;
      if (response && response.data.length>0) {   
        listOfLayers.forEach((layer, layerIndex) => {         
          let eachLayerServices = layer.listOfLayers;             
          eachLayerServices.forEach((service, serviceIndex) => {
            let listOfItems=service.listOfItems;
            listOfItems.forEach((item,index)=>{
            totalCntNormal = totalCntNormal + item.normal;
            totalCntWarning = totalCntWarning + item.warning;
            totalCntError = totalCntError + item.error;
          })
        })
        })
      }
        this.setState({
          totalCntNormal: totalCntNormal,
          totalCntWarning: totalCntWarning,
          totalCntError: totalCntError,
          isOverallStatusUpdated:true
        });
        // this.setState({getActions:window.localStorage.getItem('ALLACTIONSACCESS')},()=>{
        //   console.log("getActions",this.state.getActions);
        //   if(!(JSON.stringify(this.state.getActions).includes('Export'))){
        //     this.setState({showExport:false});
        //     }

        // });
      })
      .catch(error => this.setState({ error }));
  }
  getETLStatusCount = () => {

    this.setState({
      totalCntNormal: 0,
      totalCntWarning: 0,
      totalCntError: 0
    });
    

    //currentDate = moment(currentDate).format('YYYY-DD-MM');
    const params = {     
      APPLICATION_ID:this.state.systemSelectedValue,
      APPLICATION_NAME:this.state.applicationName,
      COMPONENT_NAME: "ETL",
      START_DATE:dateTime.getETLCurrentDate()+" "+startDateTime,
      END_DATE:dateTime.getETLCurrentDate()+" "+dateTime.getCurrentTime()
    }
   
   http.get(configData.API.SERVICE.ETL,{params})
      .then(response => {
        let interfaceDetails = response.data.interfaceDetails;
        let interfaceCount = interfaceDetails.length;
        let errorCnt = 0;
        let warningCnt = 0;
        let normalCnt = 0;
        interfaceDetails.forEach((interfaceDtl, interfaceIndex) => {
          let fileAvailablity = interfaceDtl.fileAvailablity;
          let inputDirectoryStats = fileAvailablity.inputDirectoryStats;
          let inputDirStatusType = inputDirectoryStats.status;
          // let topologyStatus = fileAvailablity.topologyStatus;
          // let topologyStatusType = topologyStatus.status;

          if (inputDirStatusType === 'ERROR') {
            errorCnt = errorCnt + 1;
          } else if (inputDirStatusType === 'WARNING') {
            warningCnt = warningCnt + 1;
          } else if (inputDirStatusType === 'NORMAL') {
            normalCnt = normalCnt + 1;
          }
         /* if (topologyStatusType === 'ERROR') {
            errorCnt = errorCnt + 1;
          } else if (topologyStatusType === 'WARNING') {
            warningCnt = warningCnt + 1;
          } else if (topologyStatusType === 'SUCCESS') {
            normalCnt = normalCnt + 1;
          }*/

        })
        this.setState({
          totalCntNormal: normalCnt, totalCntWarning: warningCnt,
          totalCntError: errorCnt
        });
        console.log("normalCnt",normalCnt,"warningCnt",warningCnt,"errorCnt",errorCnt);

      })
      .catch(error => this.setState({ error }));


  }

  getApplicationNames = () => {    
    http.get(configData.API.SERVICE.ONBOARD_APPNAMES)
      .then(response => {
        let applicationNames = response.data;        
        let appName=[];
        let appID=[];
        applicationNames.forEach((item,index)=>{
           appName.push(item.appName);  
           appID.push(item.id);    
        
        })   

        for(var i=0; i<appName.length; i++)  {
         this.state.systems.push({label: appName[i], value: appID[i]});
        
         //this.state.systemID.push({label: appID[i], value: appID[i]});            
      }
console.log("this.state.systems:",this.state.systems);
console.log("systemsSample:", systemsSample);

      })    

      .catch(error => this.setState({ error }));
  }


  outputEvent(event) {
    console.log("event",event)
    if(this.state.currenturl.includes('etl')){
      event.value.id ='ETL';  
    }
    if(this.state.currenturl.includes('portal')){
      event.value.id ='PORTAL';   
    }
    this.setState({ breadCrumbLabel: event.value})
   console.log("breadcrums",this.state.breadCrumbLabel)
    if (event.target.innerText.includes('ETL')) {
      this.getETLStatusCount();
      this.setState({ boolvalue: true,ETLClicked:true,PortalClicked:false });
    } 
     else if (event.target.innerText.includes('Portal')) {
      this.setState({ boolvalue: true, PortalClicked:true,ETLClicked: false });
     }
    
    else {
      this.setState({ boolvalue: false, ETLClicked: false, PortalClicked:false });
    }
  }
  onSystemNameChange = (e) => {

    const systemSelectedValue = e.value;
    const applicationName = e.nativeEvent.target.innerText;
   this.setState({applicationName:e.nativeEvent.target.innerText});

    window.localStorage.setItem("SELECTED_APPNAME",applicationName);
    window.localStorage.setItem("SELECTED_APPID",systemSelectedValue);

    if (this.state.systemSelectedValue.value !== systemSelectedValue) {
      //this.getAppWiseStatusCnt(systemSelectedValue,applicationName);
      this.setState({
        isOverallStatusUpdated:false,
        ApplicationChangeFlag: this.state.tempApplicationChangeFlag,
        tempApplicationChangeFlag: this.state.ApplicationChangeFlag,
        defaultclick: this.state.ApplicationChangeFlag,
        updateClick: this.state.tempApplicationChangeFlag,
        statusClickStatus: false,
        NormalIconClicked: false,
        ErrorIconClicked: false,
        WarningIconClicked: false
      }, () => {
        this.getAppWiseStatusCnt(systemSelectedValue,applicationName);
        console.log('ApplicationChangeFlag', this.state.ApplicationChangeFlag,
          this.state.tempApplicationChangeFlag)
      })

    }
    //selectdata = e.value;

    console.log("this.state.systemSelectedValue:",this.state.systemSelectedValue);

    this.setState({
      systemSelectedValue: e.value
    }, () => {
      console.log('new state', this.state.systemSelectedValue);
      window.localStorage.setItem("systemName", this.state.systemSelectedValue);
    })
  }
  StatusClickEvent(event) {
    if (event.currentTarget.id === this.state.updateElementId) {
      if (this.state.NormalIconClicked === true || this.state.ErrorIconClicked === true
        || this.state.WarningIconClicked === true) {
        this.setState({ statusClickStatus: false });
      } else {
        this.setState({ statusClickStatus: true });
      }
    } else {
      this.setState({ statusClickStatus: true });
    }
    this.setState({
      defaultclick: !this.state.defaultclick, updateClick: !this.state.updateClick,
      tempApplicationChangeFlag: !this.state.defaultclick, ApplicationChangeFlag: !this.state.updateClick,
      updateElementId: event.currentTarget.id
    }
      , () => {
        console.log('boolean state', this.state.defaultclick, this.state.updateClick,
          this.state.updateElementId)
      });

    if (event.currentTarget.id == "Normal") {
      this.setState({
        NormalIconClicked: !this.state.NormalIconClicked,
        ErrorIconClicked: false,
        WarningIconClicked: false
      });
    }
    else if (event.currentTarget.id == "Error") {
      this.setState({
        NormalIconClicked: false,
        ErrorIconClicked: !this.state.ErrorIconClicked,
        WarningIconClicked: false
      });
    }
    else if (event.currentTarget.id == "Warning") {
      this.setState({
        NormalIconClicked: false, ErrorIconClicked: false,
        WarningIconClicked: !this.state.WarningIconClicked
      });
    }
  }

  render() {
    const { responsive, selectable, singleSelection, selectableCardSizeNotChanged } = this.props;
    const responsiveCardCss = backgroundColor =>
      (responsive ? { backgroundColor, height: 275 } : { backgroundColor, width: 250, height: 275 });

      if(!this.state.currenturl.includes('etl') && (this.state.ETLClicked)){
        console.log("this.state.currenturl",this.state.currenturl,"this.state.ETLClicked",this.state.ETLClicked)
        this.props.history.push(Constants.Routerpath.ETL);
        this.setState({boolvalue:true})    ;
        this.getETLStatusCount();
      }
      
      if(!this.state.currenturl.includes('portal') && this.state.PortalClicked){
        this.props.history.push(Constants.Routerpath.Portal);
        this.setState({boolvalue:true})
      }

      if(this.state.currenturl.includes('etl') && !(this.state.ETLClicked)){
         this.setState({boolvalue:true,ETLClicked:true,breadCrumbLabel:"ETL"});
         this.getETLStatusCount();}

      if(this.state.currenturl.includes('portal') &&  !(this.state.PortalClicked)){
        this.setState({boolvalue:true,PortalClicked:true,ETLClicked:false,breadCrumbLabel:"Portal"})
       }
    return (

     <div>

        {!this.state.boolvalue ?
          <div>
            <div className="secondLayerContainer">
              <SelectItem
                id="system"
                hasOutline                
                width={200}
                height={500}
                required={true}
                options={this.state.systems}
                selectedItem={this.state.systemSelectedValue}
                onChange={this.onSystemNameChange}
              />
              <UpdateOverAllStatus normal={this.state.totalCntNormal} StatusClick={this.StatusClickEvent}
                warning={this.state.totalCntWarning} error={this.state.totalCntError}
                Normal={this.state.NormalIconClicked} Error={this.state.ErrorIconClicked}
                Warning={this.state.WarningIconClicked} />
              <div style={{position:"absolute",float:"right",right:"15px"}}>
              {this.state.showExport && this.state.isOverallStatusUpdated?<ExportLandingScreen appID = {this.state.systemSelectedValue} appName={this.state.applicationName}/>:null}
              </div>

            </div>
            {this.state.isOverallStatusUpdated &&!this.state.defaultclick && this.state.updateClick && this.state.ApplicationChangeFlag ? <div>
              <CardCollectionComponent appID = {this.state.systemSelectedValue} appName={this.state.applicationName}
                data={this.props.data} updateClickvalue={this.state.updateClick}
                updateElementId={this.state.updateElementId}
                statusClickStatus={this.state.statusClickStatus} clickHandler={this.outputEvent} />
            </div> : null}
            {this.state.isOverallStatusUpdated && this.state.defaultclick && !this.state.updateClick && this.state.tempApplicationChangeFlag ? <div>
              <CardCollectionComponent appID = {this.state.systemSelectedValue} appName={this.state.applicationName}
                data={this.props.data} updateClickvalue={this.state.updateClick}
                updateElementId={this.state.updateElementId} statusClickStatus={this.state.statusClickStatus}
                clickHandler={this.outputEvent} />
            </div> : null}

          </div>
          :null}
          
       {this.state.boolvalue?   <div> 
         <div  style={{position:"relative",zIndex:"0",pointerEvents:"auto"}}>
            <BreadCrumb breadCrumbLabel={this.state.breadCrumbLabel} boolvalue={this.state.boolvalue} /></div>
            <div className="secondLayerContainer">
              <div className="BreadCrumblabel">{this.state.breadCrumbLabel} </div>
              {this.state.ETLClicked ? <div><UpdateOverAllStatus normal={this.state.totalCntNormal} StatusClick={this.StatusClickEvent}
                warning={this.state.totalCntWarning} error={this.state.totalCntError}
                Normal={this.state.NormalIconClicked} Error={this.state.ErrorIconClicked}
                Warning={this.state.WarningIconClicked} /></div>:null}
              {/* <div className="ExportImage" style={{marginRight:"30px"}}>
                <span style={{ marginTop: "9px" }}> {FILTER_ICON} </span>
                <span>
                  <label className="ExportLabel">Filter</label>
                </span>
              </div> */}
             
            </div>
            {!this.state.defaultclick && this.state.updateClick && this.state.ETLClicked ? <div>
              <ETLcomponent updateClickvalue={this.state.updateClick}
                updateElementId={this.state.updateElementId}
                statusClickStatus={this.state.statusClickStatus}
                appID = {this.state.systemSelectedValue} appName={this.state.applicationName} />
            </div> : null}
            {this.state.defaultclick && !this.state.updateClick && this.state.ETLClicked ? <div>
              <ETLcomponent updateClickvalue={this.state.updateClick}
                updateElementId={this.state.updateElementId}
                statusClickStatus={this.state.statusClickStatus}
                appID = {this.state.systemSelectedValue} appName={this.state.applicationName}
              />
            </div> : null}
             {this.state.PortalClicked && <div><PortalExpansionPanel appID = {this.state.systemSelectedValue} appName={this.state.applicationName} /></div>}
          </div>:null}
      </div>

    );
  }

}

function mapStateToProps(state){
  return {
    dashboardResponse: state.dashboardResponse
  }
}
export default connect(mapStateToProps)(withRouter(landingScreenContent));