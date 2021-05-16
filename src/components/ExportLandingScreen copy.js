import React from 'react';
import { CSVLink } from "react-csv";
import { SvgIcon, Dialog } from '@nokia-csf-uxr/csfWidgets';
import http from './service';
import * as XLSX from 'xlsx';

const EXPORT_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_import_file" iconColor="rgb(18, 65, 145)" />;
const FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_file" iconColor="rgb(117, 117, 117)" />;
const CSV_FILE_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_csv_file" iconColor="rgb(117, 117, 117)" />;

const headers = [

];
var today = new Date(),
  Curtime = today.toString();
var fileName = `SystemReport_${today.getFullYear() + "_" + (today.getMonth() + 1) + "_" + today.getDate() + "_" + today.toTimeString()}.csv`;

var errorCount = [];
var warningCount = [];
var normalCount = [];
var serviceNameArr = [];
var delimiter = ",";
var endl = "\n";
var metaData = "NOKIA - MDA360\nSystem: NCI\nReport generated on: " + Curtime + "\nLast refreshed: " + Curtime + endl;

class ExportLandingScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      exportData: [],
      headers: [],
      filename: '',
      exportDialog: false,
      isPopupClosed: false,
      appName: props.appName
    }
  }

  downloadCSV = () => {
    this.setState({ isPopupClosed: false, exportDialog:false });
    let output = "";
    let params = {
      APPLICATION_NAME: this.props.appName,
      START_DATE: "2021-01-13 11:46:02",
      END_DATE: "2021-01-13 11:46:02"
    }
    http.get('http://127.0.0.1:8081/getApplicationDetails', { params })
      .then((response) => {
        if (response && response.data) {
          let listOfLayers = response.data;
          let layerNameArr = [];
          for (let layer in listOfLayers) {
            layerNameArr.push(listOfLayers[layer].layerName);

            for (let item in listOfLayers[layer].listOfItems) {
              let itemtemp = listOfLayers[layer].listOfItems[item];

              errorCount.push(itemtemp.error);
              warningCount.push(itemtemp.warning);
              normalCount.push(itemtemp.normal);
              serviceNameArr.push(itemtemp.serviceName);

            }
          }
          let cntNormal = 0;
          let cntWarning = 0;
          let cntError = 0;

          for (let i = 0; i < serviceNameArr.length; i++) {
              cntNormal = cntNormal + normalCount[i];
              cntWarning = cntWarning + warningCount[i];
              cntError = cntError + errorCount[i];
          }
          output = metaData + `Normal :  ${cntNormal} \nWarning : ${cntWarning} \nError : ${cntError}\n\n\n`;
          output = output + "ServiceName , Normal , Warning , Error \n";

          for (let i = 0; i < serviceNameArr.length; i++) {
            output = output + serviceNameArr[i] + delimiter + normalCount[i] + delimiter + warningCount[i] + delimiter + errorCount[i] + endl;
          }
          this.setState({ exportData: output });
          this.csvLink.link.click();

        }
      });

  }

  downloadExcel = () => {
    let output = [];
    let output1 = [];
    this.setState({ isPopupClosed: false, exportDialog:false });
    let params = {
      APPLICATION_NAME: this.props.appName,
      START_DATE: "2021-01-13 11:46:02",
      END_DATE: "2021-01-13 11:46:02"
    }
    http.get('http://127.0.0.1:8081/getApplicationDetails', { params })
      .then((response) => {
        if (response && response.data) {
          let listOfLayers = response.data;

          for (let layer in listOfLayers) {

            for (let item in listOfLayers[layer].listOfItems) {

              let itemtemp = listOfLayers[layer].listOfItems[item];

              output.push(itemtemp);
              errorCount.push(itemtemp.error);
              warningCount.push(itemtemp.warning);
              normalCount.push(itemtemp.normal);
              serviceNameArr.push(itemtemp.serviceName);
            }
          }
          let cntNormal = 0;
          let cntWarning = 0;
          let cntError = 0;

          for (let i = 0; i < serviceNameArr.length; i++) {
            cntNormal = cntNormal + normalCount[i];
            cntWarning = cntWarning + warningCount[i];
            cntError = cntError + errorCount[i];
          }

          output1.push({ "NOKIA - MDA360": "System: NCI" }, { "NOKIA - MDA360": `Report generated on: ${Curtime}` },
            { "NOKIA - MDA360": `Last refreshed:  ${Curtime}` },
            { "NOKIA - MDA360": `Normal : ${cntNormal}` }, { "NOKIA - MDA360": `Warning : ${cntWarning} ` }, { "NOKIA - MDA360": `Error : ${cntError}` }
          );

          var ws = XLSX.utils.json_to_sheet(output1);
          // XLSX.utils.sheet_add_json(output);
          XLSX.utils.sheet_add_json(ws, output, { header: ["serviceName", "normal", "warning", "error"], origin: "A10" });

          const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };

          XLSX.writeFile(wb, (fileName));
        }
      });
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
    return <div>
      <div className="ExportImage" onClick={this.getExportOptions}>
        <span style={{ marginTop: "3px" }}>{EXPORT_ICON}</span>
        <span className="ExportLabel">Export</span>
      </div>
      <CSVLink
        data={this.state.exportData}
        headers={headers}
        filename={fileName}
        asynconclick="{true}"
        ref={(r) => this.csvLink = r}
        target="_blank" />
      {this.state.exportDialog && this.renderExportDialog()}
    </div>

  }
}

export default ExportLandingScreen;