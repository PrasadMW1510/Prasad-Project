import React from 'react';
import PropTypes from 'prop-types';
import { DataGrid, SearchwChips,Dialog,AlertDialogInfo,SvgIcon } from '@nokia-csf-uxr/csfWidgets';
import configData from "../Config.json";
import http from './service';
import ExportAlerts from './ExportAlertVisualization';
import * as dateTime from './DateAndTime';
import "../Styles/AlertVisualization.css";


const startDateTime="00:00:00";   

var Roles;

const CustomCellRenderer = (params) => {
  let image;
  let desc;
  let color;
  if (params.value === 'MAJOR') {
    image = 'ic_major_kpi';
    desc = 'Major';
    color = "#ff7900";
  } else if (params.value === 'MINOR') {
    image = 'ic_minor_kpi';
    desc = 'Minor';
    color = "#ffbf02";
  } else if (params.value === 'CRITICAL') {
    image = 'ic_critical_kpi';
    desc = 'Critical';
    color = "#d9070a"
  } else if (params.value === 'WARNING') {
    image = 'ic_warning_kpi';
    desc = 'Warning';
    color = "#239df9";
  }
  return (
    <div
      style={{
        backgroundColor: color,
        width: '8px',
        height: '37px',
      }}
    >
      <div
        style={{
          marginLeft: '28px',
        }}
      >
        <SvgIcon
          id={`icon-${params.rowIndex}`}
          icon={image}
          retainIconColor
          iconWidth={37}
          iconHeight={37}
          desc={desc}
        />
      </div>
    </div>
  );
};
const colorComparator = (hexValue1, hexValue2) => {
  let hexValueA = hexValue1.substring(1, 7);
  let hexValueB = hexValue2.substring(1, 7);
  hexValueA = parseInt(hexValueA, 16);
  hexValueB = parseInt(hexValueB, 16);

  return hexValueB - hexValueA;
};


class DashboardAlertVisualization extends React.Component {
  constructor(props) {
    let getactionvalue=JSON.parse(window.localStorage.getItem('ALLACTIONSACCESSIDS'));
    Roles=window.localStorage.getItem("MDAroles");

    super(props);
    this.results = null;
    this.columnDefs = [
      {
        headerName: 'Severity',
        field: 'severity',
        headerClass: 'severity',
        width: 100,
        cellRendererFramework: CustomCellRenderer,
        cellClass: 'colorBar',
        cellStyle: {
          paddingLeft: '0px', // light green
        },
        pinned: 'left',
        comparator: colorComparator,
      },
      { headerName: 'Alert ID', field: 'alertId', width: 100 },
      { headerName: 'Application Name', field: 'applicationName', width: 170 },
      { headerName: 'Alert Name', field: 'alertName', width: 190 },      
      { headerName: 'Component Name', field: 'interfaceName', width:170},
      { headerName: 'KPI/Counter Name', field: 'parameterName', width:170},     
      { headerName: 'Created Time', field: 'createdTime', width: 190 },
      { headerName: 'Updated Time', field: 'updatedTime', width: 190 },
      { headerName: 'Cleared Time', field: 'clearedTime', width: 190 },
      { headerName: 'Number of Occurrences', field: 'numOfAlerts', width: 160 },
      { headerName: 'Notification Type', field: 'notificationType', width: 160 },
      { headerName: 'Status', field: 'status', width: 160 }

      
    ];
    this.state = {
      ongoingCaseResponse: [],
      showDialog:false,
      selectedAlertID:"",
      selectedAppName:"",
      selectedInterfaceName:"",
      selectedParamName:"",
      selectedAlertAction:"",
	    rowData: "",
      alertProbableInfo:[],
      alertName:"",
      applicationName:"" ,
      alertSeverity:"",
      alertCreatedTime:"",
      alertUpdatedTime:"",
      showExport:false,
      showAck:false,
      showAlertPopup:false,
      responseData:"Some error occurred in the service, please try after sometime"
	  }   

    this.getServiceCall();

    this.gridOptionsSearchWChips = {
      columnDefs:this.columnDefs,
      rowAction: {
        types: [],            
        multiActionOption:true,    
        callback:this.rowActionCallback,
        diable(){
          return false
        }
      },
      dynamicRowActions(params) {        
         
        const dynamicActions = [
          {
            name: 'View',
            icon: 'ic_show',
          },
          // {
          //   name: 'Clear',
          //   icon: 'ic_erase',
          // },
          {
            name: 'ACK',
            icon: 'ic_toggle-switch-off'
          }
        ];
        
        const dynamicActions1 = [
          {
            name: 'View',
            icon: 'ic_show',
          },
          // {
          //   name: 'Clear',
          //   icon: 'ic_erase',
          // },
          {
            name: 'UNACK',
            icon: 'ic_toggle-switch-off'
          }
        ];

        if (params.rowData.ackUnackStatus === "ACK") {
          setTimeout(() => {
            params.updateActions(dynamicActions1);
          }, 1000);
        } else {
          setTimeout(() => {
            params.updateActions(dynamicActions);
          }, 1000);
        }
      }, 
    
      moreHeaderMenuOptions: {
        hideCompactRows: false,
        hideExportToCsv: true
        
              
      },
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,
    
    };
  }  
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
       this.setState({showExport:true,showAck:false});
        }
        this.forceUpdate();   
   
  }

  getServiceCall(){
    let  params = {         
      applicationName:"CXM",     
      startTime:dateTime.getETLCurrentDate()+" "+startDateTime,
      endTime:dateTime.getETLCurrentDate()+" "+dateTime.getCurrentTime()
     }

     http.get(configData.API.SERVICE.ALERT_VISUALIZATION_DATAGRID,{params})    
     .then((response) => {
         console.log("Response is :" + response);
         if (response && response.data) {
          this.setState({rowData:response.data});          
         }
         
        });
 
  }
  
  rowActionCallback = (params) =>{
    switch(params.value.name){
      case "View":{    
      this.setState({selectedAlertID:JSON.stringify(params.value.items[0].data.alertId),
        selectedAppName:params.value.items[0].data.applicationName,
        selectedInterfaceName:params.value.items[0].data.interfaceName,
        selectedParamName:params.value.items[0].data.parameterName,
      },()=>{
        this.renderDialogContent();
      });
     
      break;
     }
        // case "Clear":{
        //   console.log("Clear");
        //     break;
        // }
        case "ACK":{
          this.setState({selectedAlertID:JSON.stringify(params.value.items[0].data.alertId),
            selectedAppName:params.value.items[0].data.applicationName,
            selectedInterfaceName:params.value.items[0].data.interfaceName,
            selectedParamName:params.value.items[0].data.parameterName,
            selectedAlertAction:"ACK"
          },()=>{
            console.log("Acknowledge");
            this.renderAlertStatus();
          });
            break;
        }
        case "UNACK":{
         
          this.setState({selectedAlertID:JSON.stringify(params.value.items[0].data.alertId),
            selectedAppName:params.value.items[0].data.applicationName,
            selectedInterfaceName:params.value.items[0].data.interfaceName,
            selectedParamName:params.value.items[0].data.parameterName,
            selectedAlertAction:"UNACK"
          },()=>{
            console.log("UnAcknowledge");
            this.renderAlertStatus();
          });
            break;
        }
        default:{
            console.log("Default case");
        }
    }
  }
  
  isExternalFilterPresent = () => {
    if (this.results && this.results.length > 0) {
      return true;
    }
    return false;
  }

  doesExternalFilterPass = (node) => {
    const { data } = node;
    console.log("node is ", node)
    console.log("data is ", data)
    for (let iterm = 0; iterm < this.results.length; iterm += 1) {
      const term = this.results[iterm].queryTerm;
      for (let icol = 0; icol < this.columnDefs.length; icol += 1) {
        const col = this.columnDefs[icol];
        let value = data[col.field];
        if (value) {
          value = value.toString().toLowerCase();
          if (value.indexOf(term.toLowerCase()) > -1) {
            return true;
          }
        }
      }
    }
  }

renderDialogContent(){
  
  http.post(configData.API.SERVICE.ALERT_VISUALIZATION_POPUP,{
    "applicationName":this.state.selectedAppName,   
    "interfaceName":this.state.selectedInterfaceName, 
    "parameterName":this.state.selectedParamName,
    "alertId":this.state.selectedAlertID,
    "startTime":dateTime.getETLCurrentDate()+" "+startDateTime,
    "endTime":dateTime.getETLCurrentDate()+" "+dateTime.getCurrentTime()
  })    
  .then((response) => {
      console.log("Response is :" + response);
      if (response && response.data) {       
       let numberofAlerts = response.data;
       let alertItems = [];
       let alertDetails = [];
       let resLength = response.data.length;
       resLength = resLength-1;
       for(let i=0; i<response.data.length;i++){
        this.setState({
          alertName:response.data[0].alertName,
          applicationName:response.data[0].applicationName,
          alertSeverity:response.data[0].severity,
          alertCreatedTime:response.data[resLength].createdTime,
          alertUpdatedTime:response.data[0].updatedTime
        })
       }
       numberofAlerts.forEach((alert,index)=>{
         let alertId = alert.alertId;
         let alertName = alert.alertName;
         let applicationName = alert.applicationName;
         let interfaceName = alert.interfaceName;
         let createdTime = alert.createdTime;
         let updatedTime = alert.updatedTime;
         let severity = alert.severity;
         let status = alert.status;
         let alertData = alert.alertData;
         let probableCause = alert.probableCause;

         alertItems.push(
                
                    <div style={{marginTop:"10px"}}>
                    <div style={{display:"flex",paddingTop:"10px",
                    paddingLeft:"10px",borderBottom:"2px solid lightgray",paddingBottom:"15px"}}>                    
                    <span style={{marginRight:"46px",fontSize:"12px",
                    display:"inline-block",width:"200px",wordBreak:"break-word"}}>{alertData}</span>                  
                    <span style={{marginRight:"10px",fontSize:"12px",
                    display:"inline-block",width:"300px"}}>{probableCause}</span>                    
                    <span style={{marginRight:"56px",fontSize:"12px",
                    display:"inline-block",width:"180px"}}>{severity}</span>
                    <span style={{marginRight:"16px",fontSize:"12px",
                    display:"inline-block",width:"180px"}}>{status}</span>                    
                    <span style={{marginRight:"0px",fontSize:"12px",
                    display:"inline-block",width:"140px"}}>{createdTime}</span>                    
                    </div>
                    </div>
                  
         );

       })
       this.setState({alertProbableInfo:alertItems});
      }
     });
     this.setState({showDialog:true})
} 

renderAlertStatus(){ 
  console.log("inside function",)
   http.post(configData.API.SERVICE.ALERT_VISUALIZATION_STATUS,{
    "applicationName":this.state.selectedAppName,   
    "interfaceName":this.state.selectedInterfaceName, 
    "parameterName":this.state.selectedParamName,
    "alertId":this.state.selectedAlertID,
    "ackUnackStatus":this.state.selectedAlertAction,
    "startTime":dateTime.getETLCurrentDate()+" "+startDateTime,
    "endTime":dateTime.getETLCurrentDate()+" "+dateTime.getCurrentTime()
  })    
  .then((response) => {
   
    if (response && response.data) { 
    console.log("alertstatus",response.data);
    this.setState({showAlertPopup:true})
    this.setState({responseData:response.data});   
    }
    this.getServiceCall();
    
  }
  )
  .catch(error=>this.setState({error,showAlertPopup:true}))
 
}
oncloseDeletePopup=()=>{
  this.setState({showAlertPopup:false})
}

renderAlertPopup(){
    return(
        <Dialog id="alertPopup" title={this.state.selectedAlertID} height={600} width={1200}
            header={true} trapFocus={false}            
            close="true"              
            onClose={this.onClose}             
            >    
           {this.renderAlertInfo()}
        </Dialog>
    );
}


onClose = () => {
    this.setState({
        showDialog: false
    })
}

onCancel = () =>{
    this.setState({
        showDialog: false
    });
}

renderAlertInfo = () =>{

    return(
        <div>            
           <div className="alertInfoContainer" style={{marginTop:"10px",background:"#fafafa",
          paddingLeft:"10px",paddingTop:"10px",paddingBottom:"10px"}}>
            <div className="alertRowContainer">
            <span className="alignHeader">Alert Name</span>
            <span className="alignInfo">{this.state.alertName}</span>
            </div>
            <div className="alertRowContainer">
            <span className="alignHeader">Application Name</span>
            <span className="alignInfo">{this.state.applicationName}</span>
            </div>
            <div className="alertRowContainer">
            <span className="alignHeader">Severity</span>
            <span className="alignInfo">{this.state.alertSeverity}</span>
            </div>
            <div className="alertRowContainer">
            <span className="alignHeader">Created Time</span>
            <span className="alignInfo">{this.state.alertCreatedTime}</span>
            </div>
            <div className="alertRowContainer">
            <span className="alignHeader">Updated Time</span>
            <span className="alignInfo">{this.state.alertUpdatedTime}</span>
            </div>
            </div> 
                   
                <div>
                <div style={{marginTop:"20px",fontSize:"14px"}}>
                        Alert Details
                    </div>
                    <div style={{marginTop:"10px",height:"40px",background:"#fafafa"}}>
                    <div style={{display:"flex",paddingTop:"10px",paddingLeft:"10px"}}>                    
                    <span className="alignpopupContent">Alert Data</span>                
                    <span className="alignpopupContent">Alert Probable Cause</span>  
                    <span className="alignpopupContent">Severity</span>
                    <span className="alignpopupContent">Status</span>                
                    <span style={{marginRight:"0px",fontSize:"12px",color:"#737373"}}>Timestamp</span>                    
                    </div>
                    </div>                   
                      {this.state.alertProbableInfo}
                    
                </div>
        </div>
    )
 
}


  onGridReady = (params) => {
    this.api = params.value.api;	
  }
  onUpdate = (data) => {
    this.results = data;
    console.log('title', this.results, this.api);
    this.api.onFilterChanged();
  }

  
  render() {
    return (
	<div>
    {this.state.showExport && <ExportAlerts /> }
      <DataGrid 
      domLayout="autoHeight"
	    gridOptions={this.gridOptionsSearchWChips} 
      onGridReady={this.onGridReady} 
      rowData={this.state.rowData}
      showMoreButton={true}
      unSortIcon={false}
      suppressScrollOnNewData={false}
      suppressTooltips={true}
      multiActionMoreButtonToolTipLabel={true}
	  id="config-grid">
        <StatefulSearchwChips placeHolder="Search.." onUpdate={this.onUpdate} />
      </DataGrid>

      {this.state.showAlertPopup===true?<AlertDialogInfo id="alertStatus" title="Information" infoText={this.state.responseData}
        onClose={this.oncloseDeletePopup} trapFocus={false} focusDialog={false} /> :''}
      {this.state.showDialog && this.renderAlertPopup()}
	  </div>	  		
	
    );
  }
}

  
class StatefulSearchwChips extends React.Component { 
  static propTypes = {
    onUpdate: PropTypes.func.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      chips: []
    };
  }

  handleUpdate = (data) => {
    this.setState({ chips: data.data });
    this.props.onUpdate(data.data.map(chipsItem => ({
      queryTerm: chipsItem.text
    })));
  }

  
  render() {
    const {
      onUpdate,
      ...props
    } = this.props;
    const {
      chips,
    } = this.state;
    return (<SearchwChips
      {...props}
      chips={chips}
      onUpdate={this.handleUpdate}	  
    />);
  }
}

export default DashboardAlertVisualization;