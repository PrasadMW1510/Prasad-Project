import React from 'react';
import { CSVLink } from "react-csv";
import { SvgIcon, Dialog } from '@nokia-csf-uxr/csfWidgets';
import http from './service';
import * as XLSX from 'xlsx';
import configData from "../Config.json";
import * as dateTime from './DateAndTime';


//const currentDate = dateTime.getCurrentDate();
//const currentTime = dateTime.getCurrentTime();
const startDateTime="00:00:00";    


const EXPORT_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_import_file" iconColor="rgb(18, 65, 145)" />;
const FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_file" iconColor="rgb(117, 117, 117)" />;
const CSV_FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_csv_file" iconColor="rgb(117, 117, 117)" />;

//var today = new Date(),
   // Curtime = today.toString();

//var fileName = `SystemReport_${today.getFullYear() + "_" + (today.getMonth() + 1) + "_" + today.getDate() + "_" + today.toTimeString()}.csv`;
var lastdate;
class ExportInputDirStats extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            exportDialog: false,
            isPopupClosed: false,            
            appName: localStorage.getItem("SELECTED_APPNAME"),
            appId: localStorage.getItem("SELECTED_APPID")         
            }

        if (window.localStorage.getItem("refreshedDate") === null || undefined || '') {
            lastdate= new Date();
          }
          else {
            lastdate = window.localStorage.getItem("refreshedDate");             
        }
      
    }

    downloadCSV = () => {
        this.setState({ isPopupClosed: false, exportDialog:false });
        let metadata = [];
        let serviceData = [];        
       
        let exportCurrentDate = dateTime.getExportCurrentDate();
        let exportCurrentTime = dateTime.getExportCurrentTime();
        let fileName = `Export_MDA360_Alert_Visulaization_${exportCurrentDate +"_"+ exportCurrentTime}.csv`

        let today = new Date(),          
        Curtime = today.toString(); 

       
        let  params = {         
            applicationName:"CXM",  
            startTime:dateTime.getCurrentDate()+" "+startDateTime,
            endTime:dateTime.getCurrentDate()+" "+dateTime.getCurrentTime()
           }

          http.get(configData.API.SERVICE.ALERT_VISUALIZATION_DATAGRID,{params})
            .then((response) => {
                console.log("Response is :" + response);
                if (response && response.data) {
                     let listOfAlerts = response.data;
                    for (let layer in listOfAlerts) {
                        let file = listOfAlerts[layer];

                        serviceData.push({                            
                            "Alert ID": file.alertId,
                            "Application Name":file.applicationName,
                            "Alert Name": file.alertName,
                            "Component Name":file.interfaceName,
                            "KPI/Counter Name":file.parameterName,
                            "Severity": file.severity,
                            "Created Time": file.createdTime,
                            "Updated Time":file.updatedTime,
                            "Cleared Time":file.clearedTime,
                            "Number of Occurrences":file.numOfAlerts,
                            "Notification Type":file.notificationType
                        });
                       // otherData.push(interfaceDetails[layer].fileAvailablity.inputDirectoryStats.otherAttributes);
                   }
                    metadata.push({ "NOKIA - MDA360": ``}, { "NOKIA - MDA360": `Report generated on: ${Curtime}` },
                    { "NOKIA - MDA360": `Last refreshed:  ${lastdate}` }
                );
                    let ws = XLSX.utils.json_to_sheet(metadata);
                    XLSX.utils.sheet_add_json(ws, serviceData, { origin: "A7" });
                   // XLSX.utils.sheet_add_json(ws, otherData, { origin: "E7" });
                    let wb = { Sheets: { 'Sheet': ws }, SheetNames: ['Sheet'] };

                    XLSX.writeFile(wb, (fileName));

                 }
             });

    }

    downloadExcel = () => {
        this.setState({ isPopupClosed: false, exportDialog:false });
        let metadata = [];
        let serviceData = [];        
        
        let exportCurrentDate = dateTime.getExportCurrentDate();
        let exportCurrentTime = dateTime.getExportCurrentTime();
        let fileName = `Export_MDA360_Alert_Visulaization_${exportCurrentDate +"_"+ exportCurrentTime}.xlsx`

        let today = new Date(),          
        Curtime = today.toString(); 
       
        
        let  params = {         
            applicationName:"CXM",   
            startTime:dateTime.getCurrentDate()+" "+startDateTime,
            endTime:dateTime.getCurrentDate()+" "+dateTime.getCurrentTime()
           }
           
          http.get(configData.API.SERVICE.ALERT_VISUALIZATION_DATAGRID,{params})
            .then((response) => {
                console.log("Response is :" + response);
                if (response && response.data) {
                    let listOfAlerts = response.data;
                    for (let layer in listOfAlerts) {
                        let file = listOfAlerts[layer];

                        serviceData.push({
                            "Alert ID": file.alertId,
                            "Application Name":file.applicationName,
                            "Alert Name": file.alertName,
                            "Component Name":file.interfaceName,
                            "KPI/Counter Name":file.parameterName,
                            "Severity": file.severity,
                            "Created Time": file.createdTime,
                            "Updated Time":file.updatedTime,
                            "Cleared Time":file.clearedTime,
                            "Number of Occurrences":file.numOfAlerts,
                            "Notification Type":file.notificationType
                        });
                       // otherData.push(interfaceDetails[layer].fileAvailablity.inputDirectoryStats.otherAttributes);
                   }
                    metadata.push({ "NOKIA - MDA360": ``}, { "NOKIA - MDA360": `Report generated on: ${Curtime}` },
                    { "NOKIA - MDA360": `Last refreshed:  ${lastdate}` }
                );
                    let ws = XLSX.utils.json_to_sheet(metadata);
                    XLSX.utils.sheet_add_json(ws, serviceData, { origin: "A7" });
                   // XLSX.utils.sheet_add_json(ws, otherData, { origin: "E7" });
                    let wb = { Sheets: { 'Sheet': ws }, SheetNames: ['Sheet'] };

                    XLSX.writeFile(wb, (fileName));
    }

            });
    }

    popupClick = () => {
        alert("popupClick");
    }

    renderExportDialog = () => {
        return (
            <Dialog id="exportAlertVisualPopup" title="Sample Popup" height={90} width={150}
                header={false} trapFocus={false}
                underlayClickExits={true}
                onClose={this.onClose}
                onClick={this.popupClick}
            >
            
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
        return <div>
            <div className="ExportImage" style={{float: "right",marginTop:"16px"}} onClick={this.getExportOptions}>
            <span style={{ marginTop: "-5px", marginRight: "0px"}} className={this.props.className}> {EXPORT_ICON} </span>
            <span id="Export" className={this.props.className}>Export      
            </span>
            </div>
            {this.state.exportDialog && this.renderExportDialog()}
        </div>
    }
}

export default ExportInputDirStats;