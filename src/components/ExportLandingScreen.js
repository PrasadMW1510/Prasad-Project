import React from 'react';
import { CSVLink } from "react-csv";
import { SvgIcon, Dialog } from '@nokia-csf-uxr/csfWidgets';
import http from './service';
import * as XLSX from 'xlsx';
import configData from "../Config.json";
import * as dateTime from './DateAndTime';
import {connect} from 'react-redux';

const currentDate = dateTime.getCurrentDate();
const currentTime = dateTime.getCurrentTime();
const startDateTime="00:00:00";  


const EXPORT_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_import_file" iconColor="rgb(18, 65, 145)" />;
const FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_file" iconColor="rgb(117, 117, 117)" />;
const CSV_FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_csv_file" iconColor="rgb(117, 117, 117)" />;

const headers = [

];
 
var delimiter = ",";
var endl = "\n";
var lastdate;

class ExportLandingScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      exportData: [],
      headers: [],
      filename: '',
      exportDialog: false,
      isPopupClosed: false,
      appName: props.appName,      
      dashboardResponse :"" 
    }
    if (window.localStorage.getItem("refreshedDate") === null || undefined || '') {
      lastdate= new Date();
    }
    else {
      lastdate = window.localStorage.getItem("refreshedDate");
    //  lastdate=moment(lastdate).format('DD/MM/YYYY - HH:mm')    
  }  
  //console.log("dashboardResponse in Export***************", this.state.dashboardResponse);
  
  }

  componentDidMount = () =>{
    this.setState({dashboardResponse:this.props.dashboardResponse});
  }

  downloadCSV = () => {   

    this.setState({ isPopupClosed: false, exportDialog:false });   

    let output = [];
     let output1 = [];   
    
    let params = {
      //APPLICATION_NAME:"NCI",
      APPLICATION_NAME:this.state.appName,
      COMPONENT_NAME:"ETL",
      START_DATE:currentDate+startDateTime,      
      END_DATE:currentDate+currentTime
    }
    
     // http.get('https://default.mdaupdate.insights.dyn.nesc.nokia.net/getlandingpage',{params})
    // http.get(configData.API.SERVICE.LANDING,{params})
    // .then((response) => {
     //   if (response && response.data) {
      //    let numberOfLayers = response.data;
      if(this.state.dashboardResponse.data){
        let numberOfLayers = this.state.dashboardResponse.data;
        let layerNameArr = [];
        let errorCount = [];
        let warningCount = [];
        let normalCount = [];
        let serviceNameArr = [];

        numberOfLayers.forEach((layer1, layerIndex) => {
         var listOfLayers = layer1.listOfLayers;
       // var listOfLayers = layer1.listOfItems;
          
        for (let layer in listOfLayers) {
          layerNameArr.push(listOfLayers[layer].layerName); 
          layerNameArr.push(listOfLayers[layer].serviceName);

          for (let item in listOfLayers[layer].listOfItems) {
          let itemtemp = listOfLayers[layer].listOfItems[item];
          
          output.push(itemtemp);
           errorCount.push(itemtemp.error);
           warningCount.push(itemtemp.warning);
            normalCount.push(itemtemp.normal);
            serviceNameArr.push(itemtemp.serviceName);              
           
          }        
        }   
      })

        let cntNormal = 0;
        let cntWarning = 0;
        let cntError = 0;

        for (let i = 0; i < serviceNameArr.length; i++) {
          cntNormal = cntNormal + normalCount[i];
          cntWarning = cntWarning + warningCount[i];
          cntError = cntError + errorCount[i];
        }
        let today = new Date(),
        Curtime = today.toString();  
        
        let exportCurrentDate = dateTime.getExportCurrentDate();
        let exportCurrentTime = dateTime.getExportCurrentTime();
    
        let metaData = "NOKIA - MDA360\nSystem:"+ this.state.appName+"\nReport generated on: " + Curtime + "\nLast refreshed: " + lastdate + endl;
       
        let exportFileName = `Export_MDA360_${this.state.appName}_IntegratedView_${exportCurrentDate +"_"+ exportCurrentTime}.csv`;
        this.setState({filename:exportFileName});

        output1.push({ "NOKIA - MDA360": "System:" + this.state.appName }, { "NOKIA - MDA360": `Report generated on: ${Curtime}` },
          { "NOKIA - MDA360": `Last refreshed:  ${lastdate}` },
          { "NOKIA - MDA360": `Normal : ${cntNormal}` }, { "NOKIA - MDA360": `Warning : ${cntWarning} ` }, { "NOKIA - MDA360": `Error : ${cntError}` }
        );

        var ws = XLSX.utils.json_to_sheet(output1);
        // XLSX.utils.sheet_add_json(output);
        XLSX.utils.sheet_add_json(ws, output, { header: ["serviceName", "normal", "warning", "error"], origin: "A10" });

        let wb = { Sheets: { 'Sheet': ws }, SheetNames: ['Sheet'] };

        XLSX.writeFile(wb, (exportFileName));
        }
      
     // });

  }

  downloadExcel = () => {
    let output = [];
     let output1 = [];
    this.setState({ isPopupClosed: false, exportDialog:false });    
    
    // let params = {
    //   APPLICATION_NAME:"NCI",
    //   COMPONENT_NAME:"ETL",
    //   START_DATE:"2021-02-09 14:03:10",
    //   END_DATE:"2021-02-09 14:03:10"
    // }   

    let params = {
      //APPLICATION_NAME:"NCI",
      APPLICATION_NAME:this.state.appName,
      COMPONENT_NAME:"ETL",
      START_DATE:currentDate+startDateTime,      
      END_DATE:currentDate+currentTime
    }
    
    //http.get('https://default.mdaupdate.insights.dyn.nesc.nokia.net/getlandingpage',{params})
   // http.get(configData.API.SERVICE.LANDING,{params})
    //  .then((response) => {
    //    console.log("Export Landing data is"+JSON.stringify(response.data));

       // if (response && response.data) {
        if(this.state.dashboardResponse.data){
          let numberOfLayers = this.state.dashboardResponse.data;
          let layerNameArr = [];
          let errorCount = [];
          let warningCount = [];
          let normalCount = [];
          let serviceNameArr = [];

          numberOfLayers.forEach((layer1, layerIndex) => {
           var listOfLayers = layer1.listOfLayers;
         // var listOfLayers = layer1.listOfItems;
            
          for (let layer in listOfLayers) {
            layerNameArr.push(listOfLayers[layer].layerName); 
            layerNameArr.push(listOfLayers[layer].serviceName);

            for (let item in listOfLayers[layer].listOfItems) {
            let itemtemp = listOfLayers[layer].listOfItems[item];
            
            output.push(itemtemp);
             errorCount.push(itemtemp.error);
             warningCount.push(itemtemp.warning);
              normalCount.push(itemtemp.normal);
              serviceNameArr.push(itemtemp.serviceName);              
             
            }        
          }   
        })

          let cntNormal = 0;
          let cntWarning = 0;
          let cntError = 0;

          for (let i = 0; i < serviceNameArr.length; i++) {
            cntNormal = cntNormal + normalCount[i];
            cntWarning = cntWarning + warningCount[i];
            cntError = cntError + errorCount[i];
          }
          let today = new Date(),
          Curtime = today.toString();  
          
          let exportCurrentDate = dateTime.getExportCurrentDate();
          let exportCurrentTime = dateTime.getExportCurrentTime();
      
          let metaData = "NOKIA - MDA360\nSystem:"+ this.state.appName+"\nReport generated on: " + Curtime + "\nLast refreshed: " + lastdate + endl;
          //let fileName = `SystemReport_${today.getFullYear() + "_" + (today.getMonth() + 1) + "_" + today.getDate() + "_" + today.toTimeString()}.xlsx`;
          let exportFileName = `Export_MDA360_${this.state.appName}_IntegratedView_${exportCurrentDate +"_"+ exportCurrentTime}.xlsx`;
          this.setState({filename:exportFileName});

          output1.push({ "NOKIA - MDA360": "System:" + this.state.appName }, { "NOKIA - MDA360": `Report generated on: ${Curtime}` },
            { "NOKIA - MDA360": `Last refreshed:  ${lastdate}` },
            { "NOKIA - MDA360": `Normal : ${cntNormal}` }, { "NOKIA - MDA360": `Warning : ${cntWarning} ` }, { "NOKIA - MDA360": `Error : ${cntError}` }
          );

          var ws = XLSX.utils.json_to_sheet(output1);
          // XLSX.utils.sheet_add_json(output);
          XLSX.utils.sheet_add_json(ws, output, { header: ["serviceName", "normal", "warning", "error"], origin: "A10" });

          let wb = { Sheets: { 'Sheet': ws }, SheetNames: ['Sheet'] };

          XLSX.writeFile(wb, (exportFileName));
        }
     // });
  }

  popupClick = () => {
    this.setState({
      exportDialog :false
    })
  }

  renderExportDialog = () => {
    return (
      
      <Dialog id="exportLandingScreenPopup" title="Sample Popup" height={90} width={150}
        header={false} trapFocus={false}
        underlayClickExits={true}
        onClose={this.onClose}
        onClick={this.popupClick}
      >
       {/* <div
          style={{ display: "flex", borderBottom: "1px solid lightgray", paddingTop: "10px", cursor: "pointer", float: "left", marginLeft: "-25px", width: "150px" }}
        >
          <span style={{ marginLeft: "10px" }}>{FILE_ICON}</span>
          <span style={{ marginTop: "5px", marginLeft: "10px", fontSize: "12px" }}>PDF</span>
       </div> */}

        <div
          style={{ display: "flex", borderBottom: "1px solid lightgray", paddingTop: "10px", cursor: "pointer", float: "left", marginLeft: "-25px", width: "150px" }}
          onClick={this.downloadCSV}
        >
          <span style={{ marginLeft: "10px" }}>{CSV_FILE_ICON}</span>
          <span style={{ marginTop: "5px", marginLeft: "10px", fontSize: "12px" }}>CSV</span>
        </div>

        <div style={{ display: "flex", paddingTop: "10px", cursor: "pointer", float: "left", marginLeft: "-25px", width: "150px" }}
          onClick={this.downloadExcel}
        >
          <span style={{ marginLeft: "10px" }}>{FILE_ICON}</span>
          <span style={{ marginTop: "5px", marginLeft: "10px", fontSize: "12px" }}>EXCEL</span>
        </div>
      </Dialog>
      
    );
  }

  onClose = () => {
    this.setState({
      exportDialog: false
    })
  }

  getExportOptions = () => {
    this.setState({
      exportDialog: true
    });
  }

  render() {
    console.log("this.state.exportData", this.state.exportData);
    console.log("this.state.filename", this.state.filename);
    return <div>
      <div className="ExportImage" onClick={this.getExportOptions}>
        <span style={{ marginTop: "3px" }}>{EXPORT_ICON}</span>
        <span className="ExportLabel">Export</span>
      </div>
     <CSVLink
        data={this.state.exportData}
        headers={headers}
        filename={this.state.filename}
        asynconclick="{true}"
        ref={(r) => this.csvLink = r}
        target="_blank" />
      {this.state.exportDialog && this.renderExportDialog()}
    </div>

  }
}
function mapStateToProps(state){
  return {
    dashboardResponse: state.dashboardResponse
  }
}

export default connect(mapStateToProps)(ExportLandingScreen);