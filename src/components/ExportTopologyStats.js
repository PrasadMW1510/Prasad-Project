import React from 'react';
import { CSVLink } from "react-csv";
import { SvgIcon, Dialog } from '@nokia-csf-uxr/csfWidgets';
import http from './service';
import * as XLSX from 'xlsx';
import configData from "../Config.json";
import * as dateTime from './DateAndTime';
import moment from 'moment';

const currentDate = moment(dateTime.getCurrentDate()).format('YYYY-DD-MM');
const currentTime = dateTime.getCurrentTime();
const startDateTime="00:00:00";    


const EXPORT_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_import_file" iconColor="rgb(18, 65, 145)" />;
const FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_file" iconColor="rgb(117, 117, 117)" />;
const CSV_FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_csv_file" iconColor="rgb(117, 117, 117)" />;

var today = new Date(),
    Curtime = today.toString();
var fileName = `SystemReport_${today.getFullYear() + "_" + (today.getMonth() + 1) + "_" + today.getDate() + "_" + today.toTimeString()}.csv`;

class ExportTopologyStats extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            exportDialog: false,
            isPopupClosed: false,
            appName: props.appName
        }
    }

    downloadCSV = () => {
        this.setState({ isPopupClosed: false, exportDialog:false });
        let output = [];
        let output1 = [];
        let output2 = [];

        // let params = {
        //     APPLICATION_NAME: "NCI",
        //     COMPONENT_NAME: "ETL",
        //     START_DATE:"2021-02-09 14:03:10",
        //     END_DATE:"2021-02-09 14:03:10"            
        //   } 
        let params = {
            APPLICATION_NAME: "CXM",
            COMPONENT_NAME: "ETL",
            START_DATE:currentDate+ " " +startDateTime,      
            END_DATE:currentDate+ " " +currentTime
          }        
          
          //http.get('https://default.mdaupdate.insights.dyn.nesc.nokia.net/etlservice',{params})
          http.get(configData.API.SERVICE.ETL,{params})
            .then((response) => {
                console.log("Response is :" + response);
                if (response && response.data) {
                    let interfaceDetails = response.data.interfaceDetails;
                    for (let layer in interfaceDetails) {
                        output1.push({ name: (interfaceDetails[layer].name) });
                        output2.push(interfaceDetails[layer].fileAvailablity.topologyStatus);
                    }
                    output.push({ "NOKIA - MDA360": "System: CXM" }, { "NOKIA - MDA360": `Report generated on: ${Curtime}` },
                        { "NOKIA - MDA360": `Last refreshed:  ${Curtime}` }
                    );

                    let ws = XLSX.utils.json_to_sheet(output);
                    XLSX.utils.sheet_add_json(ws, output1, { header: ["name"], origin: "A10" });
                    XLSX.utils.sheet_add_json(ws, output2, { origin: "B10" });

                    let wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
                    XLSX.writeFile(wb, (fileName));

                }
            });

    }

    downloadExcel = () => {
        this.setState({ isPopupClosed: false, exportDialog:false });
        let output = [];
        let output2 = [];

        // let params = {
        //     APPLICATION_NAME: "NCI",
        //     COMPONENT_NAME: "ETL",
        //     START_DATE:"2021-02-09 14:03:10",
        //     END_DATE:"2021-02-09 14:03:10"            
        //   }   

        let params = {
            APPLICATION_NAME: "CXM",
            COMPONENT_NAME: "ETL",
            START_DATE:currentDate+" "+startDateTime,      
            END_DATE:currentDate+" "+currentTime
          }   

          //http.get('https://default.mdaupdate.insights.dyn.nesc.nokia.net/etlservice',{params}) 
          http.get(configData.API.SERVICE.ETL,{params})
            .then((response) => {
                console.log("Response is :" + response);
                if (response && response.data) {
                    let interfaceDetails = response.data.interfaceDetails;
                    for (let layer in interfaceDetails) {

                        let file = interfaceDetails[layer].fileAvailablity.topologyStatus;

                        output2.push({
                            "Name": (interfaceDetails[layer].name),
                            "Source Backlog": file.srcBacklog,
                            "ETL Backlog": file.etlBacklog,
                            "Usage Backlog": file.usageBacklog,
                            "Rejected count": file.rejectedCnt,
                            "Error file count": file.errFileCnt,
                            "Sink Backlog Ret": file.sinkBacklogRet

                        });
                    }
                    output.push({ "NOKIA - MDA360": "System: CXM" }, { "NOKIA - MDA360": `Report generated on: ${Curtime}` },
                        { "NOKIA - MDA360": `Last refreshed:  ${Curtime}` }
                    );

                    let ws = XLSX.utils.json_to_sheet(output);
                    XLSX.utils.sheet_add_json(ws, output2, { origin: "A10" });

                    let wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
                    XLSX.writeFile(wb, (fileName));
                }

            });
    }

    popupClick = () => {
        alert("popupClick");
    }

    renderExportDialog = () => {
        return (
            <Dialog id="exportTopologyPopup" title="Sample Popup" height={90} width={150}
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
        return <div>
            <div className="ExportImage" onClick={this.getExportOptions}>
            <span style={{ marginTop: "-5px", marginRight: "0px"}} className={this.props.className}> {EXPORT_ICON} </span>
            <span id="Export" className={this.props.className}>Export      
            </span>
            </div>
            {this.state.exportDialog && this.renderExportDialog()}
        </div>
    }
}

export default ExportTopologyStats;