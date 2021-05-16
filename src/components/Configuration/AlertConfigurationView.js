import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DataGrid, Label, ToggleSwitch, RadioButtonGroup, CheckBox, RadioButton, TextArea, TextInput, SelectItem, SearchwChips, Dialog, SvgIcon, AlertDialogConfirm, AlertDialogInfo, Button } from '@nokia-csf-uxr/csfWidgets';
import "../../Styles/AlertConfigurationView.css";
import http from '../service';
import axios from "axios";
import configData from '../../Config.json';


const ADD_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_add_circle" iconColor="#124191" />;
const REMOVE_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_remove_circle_outline" iconColor="red" />;
const UP_ICON_RED = <SvgIcon key="ic_arrow_upward" iconWidth="20" icon="ic_arrow_upward" iconColor="red" />;
const UP_ICON_ORANGE = <SvgIcon key="ic_arrow_upward" iconWidth="20" icon="ic_arrow_upward" iconColor="orange" />;
const DOWN_ICON = <SvgIcon key="ic_arrow_downward" iconWidth="20" icon="ic_arrow_downward" iconColor="rgb(116, 170, 50)" />;

var defaultAppName;
var alertIdAsParam;
var alertStatusAsParam;
var alertIdforDelete;
var actionName = "";
let formErrors = {};
var Roles;
var showEdit = false;
var isErrorPresent = false;
class AlertConfigurationView extends React.Component {
  constructor(props) {
    let getactionvalue = JSON.parse(window.localStorage.getItem('ALLACTIONSACCESSIDS'));
    Roles = window.localStorage.getItem("MDAroles");
    super(props);
    this.results = null;
    this.columnDefs = [
      { headerName: 'Alert ID', field: 'alertId', width: 100 },
      { headerName: 'Alert Name', field: 'alertName', width: 150 },
      { headerName: 'Application Name', field: 'applicationName', width: 180 },
      { headerName: 'Component Name', field: 'interfaceName', width: 150 },
      { headerName: 'KPI/Counter Name', field: 'parameterName', width: 130 },
      { headerName: 'Time Interval', field: 'interval', width: 130 },
      { headerName: 'Created On', field: 'createdTime', width: 130 },
      { headerName: 'Alert status', field: 'status', width: 130 },
    ];
    defaultAppName = window.localStorage.getItem("SELECTED_APPNAME");
    this.removeExpression = this.removeExpression.bind(this);

    this.state = {
      ongoingCaseResponse: [],
      showDialog: false,
      rowData: [],
      eachRowDataonClickofDrilldown: {},
      rowDataOnDrilldown: {},
      lengthofConditions: 0,
      actualConditions: [],
      notifications: {},
      email: [],
      Smsto: [],
      deleteConfirmDialog: false,
      deleteYES: false,
      enableOrDisableStatusConfirmDialog: false,
      enableDisbaleYes: false,
      recordUpdatedMessage: '',
      alertId: '',
      recordDeleteMessage: '',
      errorServiceMessage: '',
      errorServiceMessageforPopup: '',
      AddAlertDialog: false,
      alertIdOndrilldown: '',
      alertNameofNewAlert: '',
      applicationNameofNewAlert: '',
      componentNameofNewAlert: '',
      KPICounterNameofNewAlert: '',
      alertDescofNewAlert: '',
      timeIntervalofNewAlert: '',
      alertExpressionofNewAlert: '',
      lowerthresholdValueofNewAlert: "",
      upperthresholdValueofNewAlert: "",
      severityofNewAlert: '',
      enabledNotification: 'No',
      emailofNewAlert: false,
      emailofNewAlertTextBox: "",
      snmpofNewAlert: false,
      snmpofNewAlertSelectBox: "",
      alertStatusofNewAlert: true,
      enableDisableAlertMessage: "",
      enableOrDisableLabel: "Enabled",
      widthofDialog: 973,
      listOfExpressions: [],
      listofAlertExpressiondynamically: [],
      disableEmailTextBox: true,
      disabledSNMPselectbox: true,
      disableEmailCheckbox: true,
      disableSNMPcheckbox: true,
      componentNameErrorFlag: false,
      applicationNameErrorFlag: false,
      alertNameErrorFlag: false,
      kpiErrorFlag: false,
      alertDescErrorFlag: false,
      timelyErrorFlag: false,
      timelyErrorMsg: '',
      componentNameErrorMsg: '',
      applicationNameErrorMsg: '',
      alertNameErrorMsg: '',
      kpiErrorMsg: '',
      alertDescErrorMsg: '',
      lowerThresholdErrMsg: '',
      lowerThresholdErrFlag: false,
      upperThresholdErrMsg: '',
      upperThresholdErrFlag: false,
      alertSeverityErrMsg: '',
      alertSeverityErrFlag: false,
      expressionErrMsg: '',
      expressionErrFlag: '',
      applicationNameDropdown: [],
      componentNameDropdown: [],
      kpiNameDropdown: [],
      alertNameDropdown: [],
      snmpListDropdown: [],
      conditionListofExpressionDropdown: [],
      intervalListDropdown: [],
      severityListDropdown: [],
      formErrorFlag: false,
      applicationNameEnabled: false,
      componentNameEnabled: false,
      kpiNameEnabled: false,
      alertNameEnabled: false,
      alertDescEnabled: false,
      // showEdit:false,
      getActions: getactionvalue



    }
    let action = window.localStorage.getItem('ALLACTIONSACCESSIDS');
    console.log("getActions", action);
    this.setState({ getActions: action })

    console.log("getActions", this.state.getActions);
    if (((action).includes(configData.TABS_PRIVILIGES_IDS.EDIT))) {
      // this.setState({showEdit:true});
      showEdit = true;
    }
    else {
      // this.setState({showEdit:false}); 
      showEdit = false;
    }

    if (Roles.includes(configData.ROLES_NAMES.ADMIN)) {
      // this.setState({showEdit:true});
      showEdit = true;
    }

    formErrors.listOfalertExpressionError = [];
    formErrors.listOfLowerThresholdError = [];
    formErrors.listOfUpperThresholdError = [];
    formErrors.listOfSeverityError = [];
    this.getOnloadDataGrid();
    this.getapplicationName();
    this.getConditionList();
    this.getSeverityList();
    this.getIntervalList();
    //this.getSnmpList();
    // this.getComponentName();
    // this.getKPIname();
    // this.getAlertsName();

    this.gridOptionsSearchWChips = {
      columnDefs: this.columnDefs,
      rowAction: {
        types: [],
        multiActionOption: true,
        callback: this.rowActionCallback,


      },
      ensureDomOrder: true,
      suppressColumnVirtualisation: true,
      dynamicRowActions(params) {
        console.log("params", params.rowData.status)
        console.log("this.state.showEdit", showEdit)
        var dynamicActions = [
          {
            name: 'View',
            icon: 'ic_show',
          },
          {
            name: 'Edit',
            icon: 'ic_edit',
          },
          {
            name: 'Delete',
            icon: 'ic_delete',
          },
          {
            name: 'Enable',
            icon: 'ic_toggle-switch-off',
          }
        ];
        var dynamicActions1 = [
          {
            name: 'View',
            icon: 'ic_show',
          },
          {
            name: 'Edit',
            icon: 'ic_edit',
          },

          {
            name: 'Delete',
            icon: 'ic_delete',
          },
          {
            name: 'Disable',
            icon: 'ic_toggle-switch',
          }
        ];
        if (!(showEdit === true)) {
          dynamicActions.splice(1, 1);
          dynamicActions1.splice(1, 1);
        }
        if (params.rowData.status === "ENABLED") {
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
        hideExportToXls: true,
        hideExportToCsv: true
      },

      callback: this.rowActionCallback,
      isExternalFilterPresent: this.isExternalFilterPresent,
      doesExternalFilterPass: this.doesExternalFilterPass,

    };
  }
  multiactiontoolbarCallback = (params) => {
    const newToggleState = params.value.state === 'on';

    // gets the selected rows of grid.
    const itemsToCompare = this.api.getSelectedRows();
    const itemsToUpdate = [];

    // iterates and updates the rowData
    this.api.forEachNodeAfterFilterAndSort((rowNode) => {
      const { data } = rowNode;
      const itemToUpdate = itemsToCompare.filter(item => item.id === data.id);
      if (itemToUpdate.length > 0) {
        data.isEnabled = newToggleState;
        itemsToUpdate.push(data);
      }
    });
    this.api.updateRowData({ update: itemsToUpdate });
  };




  getOnloadDataGrid() {
    console.log("default app name", defaultAppName)
    // axios('http://127.0.0.1:8081/getAlertConfigurationDataGrid', {
    let params = {
      applicationName: defaultAppName

    }
    http.get(configData.API.SERVICE.ALERT_CONFIG_DATAGRID, {
      // method: 'get',
      headers: { 'Content-Type': 'application/json' },
      params: params
    }).then(response => {
      console.log("response of datagrid", response);
      this.setState({ rowData: response.data }, () => { console.log("onload data", this.state.rowData) });

    })
      .catch(error => this.setState({ error, errorServiceMessage: "Some error occured in the service, please try after a while to see data" }));
  }

  getapplicationName() {

    http.get(configData.API.SERVICE.AlERTS_CONFIG_APPNAMELIST)
      .then((response) => {
        this.setState({ applicationNameDropdown: response.data }, () => { this.getSnmpList() })
      }
      )
      .catch(error => this.setState({ error }))

  }

  getComponentName(valueofApplicationDropdown) {
    let params = {
      applicationName: valueofApplicationDropdown
    }
    http.get(configData.API.SERVICE.ALERTS_CONFIG_COMPONENT_NAME, { params })
      .then((response) => {
        this.setState({ componentNameDropdown: response.data })
      }
      )
      .catch(error => this.setState({ error }))

  }
  getKPIname(interfaceName) {
    let params = {
      applicationName: this.state.applicationNameofNewAlert,
      interfaceName: interfaceName
    }
    http.get(configData.API.SERVICE.ALERTS_CONFIG_KPICOUNTER_NAME, { params })
      .then((response) => {
        this.setState({ kpiNameDropdown: response.data })
      }
      )
      .catch(error => this.setState({ error }))
  }
  getAlertsName(kpiname) {
    let params = {
      applicationName: this.state.applicationNameofNewAlert,
      interfaceName: this.state.componentNameofNewAlert,
      parameterName: kpiname
    }
    http.get(configData.API.SERVICE.ALERTS_CONFIG_ALERT_NAME, { params })
      .then((response) => {
        this.setState({ alertNameDropdown: response.data })
      }
      )
      .catch(error => this.setState({ error }))
  }
  getConditionList() {

    http.get(configData.API.SERVICE.ALERTS_CONFIG_GET_CONDITION_LIST)
      .then((response) => {
        this.setState({ conditionListofExpressionDropdown: response.data })
      }
      )
      .catch(error => this.setState({ error }))
  }

  getSeverityList() {

    http.get(configData.API.SERVICE.ALERTS_CONFIG_GET_SEVERITY)
      .then((response) => {
        this.setState({ severityListDropdown: response.data })
      }
      )
      .catch(error => this.setState({ error }))
  }
  getIntervalList() {

    http.get(configData.API.SERVICE.ALERTS_CONFIG_GET_INTERVAL)
      .then((response) => {
        this.setState({ intervalListDropdown: response.data })
      }
      )
      .catch(error => this.setState({ error }))
  }
  getSnmpList(value) {

    let params = {
      applicationName: value
    }
    http.get(configData.API.SERVICE.ALERTS_CONFIG_GET_SNMP_LIST, { params })
      .then((response) => {
        this.setState({ snmpListDropdown: response.data })
      }
      )
      .catch(error => this.setState({ error }))
  }








  toggleCallback = (params) => {
    this.updateStateAfterToggle(params.value.rowData.id, params.value.state, params.value.rowIndex);
  }

  updateStateAfterToggle = (id, toggleState, rowIndex) => {
    // updates the row data of the row
    const itemsToUpdate = [];
    this.api.forEachNodeAfterFilterAndSort((rowNode) => {
      const { data } = rowNode;
      if (data.id === id) {
        data.isEnabled = toggleState;
        itemsToUpdate.push(data);
      }
    });
    this.api.updateRowData({ update: itemsToUpdate });
    // Focus the currently clicked toggle button as the focus as lost after updateRowData api call
    this.api.setFocusedCell(rowIndex, 'isEnabled');
    const currentlyChosenToggle = ReactDOM.findDOMNode(this).querySelectorAll(`#my-datagrid-id .ag-center-cols-container [row-index="${rowIndex}"] .datagrid-row-actions`); // eslint-disable-line react/no-find-dom-node
    currentlyChosenToggle && setTimeout(() => currentlyChosenToggle[0].focus());
  }

  enableOrDisable = (alertIdAsParam, alertStatusAsParam) => {
    http.post(configData.API.SERVICE.ALERT_CONFIG_UPDATE_STATUS, {
      "alertId": alertIdAsParam,
      "status": alertStatusAsParam
    })
      .then(response => {
        console.log("response of popup", response);
        this.setState({ enableDisbaleYes: true, recordUpdatedMessage: response.data });
        this.getOnloadDataGrid();

      })
      .catch(error => this.setState({ enableDisbaleYes: true, error, recordUpdatedMessage: "Some error occured in the service, please try after a while to see data" }));


  }



  rowActionCallback = (params) => {

    console.log("params inside function", params.value.items[0].data)
    alertIdforDelete = params.value.items[0].data.alertId;
    if (params.value.items[0].data.status === "ENABLED") {
      this.setState({ enableDisableAlertMessage: "Are you sure you want to disable the alert?" })
    }
    else {
      this.setState({ enableDisableAlertMessage: "Are you sure you want to enable the alert?" })
    }

    this.setState({ alertIdOndrilldown: JSON.stringify(params.value.items[0].data.alertId) }, () => console.log("alerId", this.state.alertIdOndrilldown))

    switch (params.value.name) {
      case "View": {


        const payload = {
          alertId: params.value.items[0].data.alertId
        }
        this.setState({ alertIdOndrilldown: JSON.stringify(params.value.items[0].data.alertId) }, () => console.log("alerId", this.state.alertIdOndrilldown))
        console.log("alerId", this.state.alertIdOndrilldown)

        axios(configData.API.SERVICE.ALERT_CONFIG_POPUP, {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
          params: payload
        })
          .then(response => {
            console.log("response of popup", response)
            console.log("onclick of drilldown", response.data.notifications.email);
            this.setState({
              actualConditions: response.data.conditions,
              rowDataOnDrilldown: response.data,
              notifications: response.data.notifications,
              email: response.data.notifications.email,
              lengthofConditions: response.data.conditions.length,
              Smsto: response.data.notifications.sms,
            }, () => {
              console.log("onclick of notifications", this.state.notifications);
              this.setState({ showDialog: true, eachRowDataonClickofDrilldown: params.value.items.data })
            }
            );


          })
          .catch(error => this.setState({ error, errorServiceMessageforPopup: "Some error occured in the service, please try after a while to see data", showDialog: true, eachRowDataonClickofDrilldown: params.value.items.data }));

        break;
      }

      case "Edit": {
        actionName = "Edit";

        const payload = {
          alertId: params.value.items[0].data.alertId
        }
        alertIdAsParam = params.value.items[0].data.alertId;
        axios(configData.API.SERVICE.ALERT_CONFIG_POPUP, {
          method: 'get',
          headers: { 'Content-Type': 'application/json' },
          params: payload
        })
          .then(response => {
            console.log("response of popup", response)
            console.log("onclick of drilldown", response.data.notifications.email);
            console.log("condirions", response.data.conditions, " and", response.data.conditions.length)


            let conditionsArray = [];
            for (let i = 1; i < response.data.conditions.length; i++) {
              conditionsArray.push({
                "childAlertExpression": response.data.conditions[i].expression, "childLowerTvalue": response.data.conditions[i].ltValue,
                "childUpperTvalue": response.data.conditions[i].utValue, "ChildSeverity": response.data.conditions[i].severity
              });
            }
            console.log("edited list expressions", conditionsArray)
            //  this.setState({listOfExpressions:conditionsArray},()=>{console.log("edited list expressions",this.state.listOfExpressions)});


            this.setState({ listOfExpressions: conditionsArray }, () => {
              console.log("edited this.state.listOfExpressions", this.state.listOfExpressions)
            })
            if (response.data.status === "ENABLED" || response.data.status === "Enabled" || response.data.status === "enabled") {
              this.setState({ alertStatusofNewAlert: true, enableOrDisableLabel: "Enabled" }, () => { console.log("status from edit", this.state.alertStatusofNewAlert, "", this.state.enableOrDisableLabel) })
            }
            else {
              this.setState({ alertStatusofNewAlert: false, enableOrDisableLabel: "Disabled" }, () => { console.log("status from edit", this.state.alertStatusofNewAlert, "", this.state.enableOrDisableLabel) })
            }

            if (response.data.notifications.email.length > 0) {
              var splittedemail = '';
              for (let i = 0; i < response.data.notifications.email.length; i++) {
                splittedemail = splittedemail + response.data.notifications.email[i] + ",";
              }
              console.log("splittedmail", splittedemail);
              var finalMails = splittedemail.substring(0, splittedemail.length - 1);
              console.log("finalMails", finalMails);
              this.setState({ emailofNewAlertTextBox: finalMails })
            }
            this.setState({
              alertNameofNewAlert: response.data.alertName,
              alertDescofNewAlert: response.data.description,
              componentNameofNewAlert: response.data.interfaceName,
              KPICounterNameofNewAlert: response.data.parameterName,
              applicationNameofNewAlert: response.data.applicationName,
              timeIntervalofNewAlert: response.data.interval,
              alertExpressionofNewAlert: response.data.conditions[0].expression,
              lowerthresholdValueofNewAlert: response.data.conditions[0].ltValue,
              upperthresholdValueofNewAlert: response.data.conditions[0].utValue,
              severityofNewAlert: response.data.conditions[0].severity,
              emailofNewAlertTextBox: response.data.notifications.email,
              snmpofNewAlertSelectBox: response.data.notifications.snmp,
              applicationNameEnabled: true,
              kpiNameEnabled: true,
              componentNameEnabled: true,
              alertNameEnabled: true,
              alertDescEnabled: true,
              enabledNotification: response.data.isNotificationEnabled


              // AddAlertDialog:true
              //  Smsto: response.data.notifications.sms,
            }, () => {
              this.getSnmpList(this.state.applicationNameofNewAlert);
              if (this.state.enabledNotification === "Yes") {
                this.setState({ disableEmailTextBox: false, disabledSNMPselectbox: false })
              }
              else {
                this.setState({ disableEmailTextBox: true, disabledSNMPselectbox: true })

              }
              console.log("onclick of notifications", this.state.alertNameofNewAlert, "", this.state.alertDescofNewAlert, "", this.state.componentNameofNewAlert, "",
                this.state.KPICounterNameofNewAlert, "", this.state.applicationNameofNewAlert);
              this.state.componentNameDropdown.push({ label: this.state.componentNameofNewAlert, value: this.state.componentNameofNewAlert });
              this.state.applicationNameDropdown.push({ label: this.state.applicationNameofNewAlert, value: this.state.applicationNameofNewAlert });
              this.state.kpiNameDropdown.push({ label: this.state.KPICounterNameofNewAlert, value: this.state.KPICounterNameofNewAlert });
              this.state.alertNameDropdown.push({ label: this.state.alertNameofNewAlert, value: this.state.alertNameofNewAlert });

              // if (this.state.snmpofNewAlert !== "" || this.state.emailofNewAlertTextBox !== "") {
              //   this.setState({ enabledNotification: false });
              // }
              // this.getComponentName(this.state.applicationNameofNewAlert)
              // this.getKPIname(this.state.applicationNameofNewAlert,this.state.componentNameofNewAlert);
              // this.getAlertsName(this.state.applicationNameofNewAlert,this.state.componentNameofNewAlert,this.state.KPICounterNameofNewAlert)
              this.setState({ AddAlertDialog: true, eachRowDataonClickofDrilldown: params.value.items.data })
            }
            );


          })
          .catch(error => this.setState({ error, errorServiceMessageforPopup: "Some error occured in the service, please try after later to edit data" }));

        break;
      }



      case "Delete": {
        this.setState({ deleteConfirmDialog: true })
        this.setState({ deleteConfirmDialog: true, alertId: alertIdforDelete }, () => { console.log("Delete", this.state.deleteConfirmDialog) })
        break;
      }
      case "Enable": {
        alertIdAsParam = params.value.items[0].data.alertId;
        alertStatusAsParam = params.value.items[0].data.status;
        console.log("alertIdAsParam", alertIdAsParam, "alertStatusAsParam", alertStatusAsParam)
        this.setState({ enableOrDisableStatusConfirmDialog: true })
        break;
      }
      case "Disable": {
        alertIdAsParam = params.value.items[0].data.alertId;
        alertStatusAsParam = params.value.items[0].data.status;
        this.setState({ enableOrDisableStatusConfirmDialog: true })
        break;
      }

      default: {
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
  onCloseonAlertPopup = () => {
    this.setState({ showDialog: false, errorServiceMessageforPopup: "" });
    //this.resetAddAlert();

  }
  renderAlertPopup() {
    return (
      <Dialog id="Drilldown" title={this.state.alertIdOndrilldown} height={500} width={976}
        header={true} trapFocus={false}
        close={true}
        onClose={this.onCloseonAlertPopup}

      >
        {this.renderAlertInfo()}
      </Dialog>
    );
  }


  onClose = () => {
    this.setState({
      showDialog: false,
      errorServiceMessageforPopup: ""
    });
    // this.resetAddAlert();
  }

  onCancel = () => {
    this.setState({
      showDialog: false,
      errorServiceMessageforPopup: ""
    });
    // this.resetAddAlert();
  }
  onCancelonAddalert = (e) => {
    console.log("cancel", e)
    this.setState({
      AddAlertDialog: false
    });
    this.resetAddAlert();

  }

  resetAddAlert() {
    this.setState({
      alertNameofNewAlert: '',
      applicationNameofNewAlert: '',
      componentNameofNewAlert: '',
      KPICounterNameofNewAlert: '',
      alertDescofNewAlert: '',
      timeIntervalofNewAlert: '',
      alertExpressionofNewAlert: '',
      lowerthresholdValueofNewAlert: "",
      upperthresholdValueofNewAlert: "",
      severityofNewAlert: '',
      enabledNotification: 'No',
      emailofNewAlert: false,
      emailofNewAlertTextBox: "",
      snmpofNewAlert: false,
      snmpofNewAlertSelectBox: "",
      alertStatusofNewAlert: true,
      enableDisableAlertMessage: "",
      enableOrDisableLabel: "Enabled",
      widthofDialog: 973,
      listOfExpressions: [],
      listofAlertExpressiondynamically: [],
      disableEmailTextBox: true,
      disabledSNMPselectbox: true,
      disableEmailCheckbox: true,
      disableSNMPcheckbox: true,
      componentNameErrorFlag: false,
      applicationNameErrorFlag: false,
      alertNameErrorFlag: false,
      kpiErrorFlag: false,
      alertDescErrorFlag: false,
      timelyErrorFlag: false,
      timelyErrorMsg: '',
      componentNameErrorMsg: '',
      applicationNameErrorMsg: '',
      alertNameErrorMsg: '',
      kpiErrorMsg: '',
      alertDescErrorMsg: '',
      lowerThresholdErrMsg: '',
      lowerThresholdErrFlag: false,
      upperThresholdErrMsg: '',
      upperThresholdErrFlag: false,
      alertSeverityErrMsg: '',
      alertSeverityErrFlag: false,
      expressionErrMsg: '',
      expressionErrFlag: '',
      applicationNameEnabled: false,
      kpiNameEnabled: false,
      componentNameEnabled: false,
      alertNameEnabled: false,
      alertDescEnabled: false,
      formErrorFlag: false,
      applicationNameDropdown: [],
      componentNameDropdown: [],
      kpiNameDropdown: [],
      alertNameDropdown: [],
      snmpListDropdown: [],
      errorServiceMessageforPopup: ""
    });
    actionName = "";
    alertIdAsParam = "";
    formErrors.listOfalertExpressionError = [];
    formErrors.listOfLowerThresholdError = [];
    formErrors.listOfUpperThresholdError = [];
    formErrors.listOfSeverityError = [];
  }
  onCloseConfirmationDelete = () => {
    this.setState({ deleteConfirmDialog: false })
  }

  onConfirmofdelete = () => {
    console.log("alertIdforDelete", alertIdforDelete)
    const params = {
      alertId: alertIdforDelete
    }

    http.get(configData.API.SERVICE.ALERT_CONFIG_DELETE, {
      headers: { 'Content-Type': 'application/json' },
      params: params
    })
      .then(response => {
        console.log("on delete roles", response);
        this.setState({ deleteYES: true, recordDeleteMessage: response.data })
        this.getOnloadDataGrid();
      })
      .catch(error =>
        this.setState({ deleteYES: true, recordDeleteMessage: "Error occurred while deleting in server, please try later" }));

  }
  oncloseDeletePopup = () => {
    this.setState({ deleteYES: false, deleteConfirmDialog: false })
  }

  renderAlertInfo = () => {
    return (
      <div style={{ paddingBottom: "30px" }}>

        {this.state.errorServiceMessageforPopup !== '' ? <div style={{ textAlign: "center", color: 'red', fontSize: '16px', margin: "15px" }}> {this.state.errorServiceMessageforPopup}</div> :
          <div>
            <div className="alertInfoContainer">
              <div className="alertRowContainer">
                <span className="alignHeaderforAlertName">Alert Name</span>
                <span className="alignInfo">{this.state.rowDataOnDrilldown.alertName}</span>
              </div>
              <div className="alertRowContainer">
                <span className="alignHeader">Application Name</span>
                <span className="alignInfo">{this.state.rowDataOnDrilldown.applicationName}</span>
              </div>
              <div className="alertRowContainer">
                <span className="alignHeader">Component Name</span>
                <span className="alignInfo">{this.state.rowDataOnDrilldown.interfaceName}</span>
              </div>
              <div className="alertRowContainer">
                <span className="alignHeaderforAlertName">KPI/Counter Name</span>
                <span className="alignInfo">{this.state.rowDataOnDrilldown.parameterName}</span>
              </div>
              <div className="alertRowContainer">
                <span className="alignHeaderforAlertName">Created On</span>
                <span className="alignInfo">{this.state.rowDataOnDrilldown.createdTime}</span>
              </div>
              <div className="alertRowContainer">
                <span className="alignHeaderforAlertName">Time Interval</span>
                <span className="alignInfo">{this.state.rowDataOnDrilldown.interval}</span>
              </div>
              <div className="alertRowContainer">
                <span className="alignHeader">Alert Status</span>
                <span className="alignInfo">{this.state.rowDataOnDrilldown.status}</span>
              </div>
            </div>

            <div>
              <div style={{ marginTop: "15px", color: "grey" }}>Conditions ( <span>{this.state.lengthofConditions}</span>) </div>
              <div>
                {
                  this.state.actualConditions.map((eve, i) => {
                    return (
                      <div key={i} style={{ margin: "10px 0px", border: "1px solid lightgrey", width: "510px" }}>
                        {this.state.actualConditions.length === 0 ? <div><span style={{ color: "grey", fontSize: "12px", margin: "5px" }}>No alerts set</span>  </div> : <div>
                          {eve.utValue === "" ? <div style={{ paddingRight: "15px", paddingLeft: "20px", marginTop: "6px", display: 'flex', flex: '1' }}>
                            <div style={{ display: "flex", flex: "1", marginLeft: "-10px" }}>

                              <div><span style={{ color: "grey", fontSize: "12px", margin: "4px" }}>Alert me when threshold value is</span>  </div>
                              <div> <span style={{ fontSize: "12px", fontWeight: "bold" }}>{" "} {eve.expression} {" "} {eve.ltValue}.</span> </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>{eve.severity === "CRITICAL" ? <div style={{ display: 'flex', flex: '1' }}><div >{UP_ICON_RED}</div><div style={{ color: "red" }}>{eve.severity}</div></div> : ''}
                              {eve.severity === "MINOR" ? <div style={{ display: 'flex', flex: '1' }}><div>{DOWN_ICON}</div><div style={{ color: "green" }}>{eve.severity}</div></div> : ''}
                              {eve.severity === "MAJOR" ? <div style={{ display: 'flex', flex: '1' }}><div>{UP_ICON_ORANGE}</div><div style={{ color: "orange" }}>{eve.severity}</div></div> : ''}

                            </div>
                          </div> : ''}
                          {eve.utValue !== "" ? <div style={{ paddingRight: "15px", paddingLeft: "20px", marginTop: '6px', display: 'flex', flex: '1' }}>
                            <div style={{ display: "flex", flex: "1", marginLeft: "-10px" }}>
                              <div><span style={{ color: "grey", fontSize: "12px", margin: "4px" }}>Alert me when threshold value is</span> </div>
                              <div> <span style={{ fontSize: "12px", fontWeight: "bold" }}>{" "} {eve.expression} {" "} {eve.ltValue}-{eve.utValue}.</span></div>
                            </div>
                            <div style={{ textAlign: 'right' }}>{eve.severity === "CRITICAL" ? <div style={{ display: 'flex', flex: '1' }}><div>{UP_ICON_RED}</div><div style={{ color: "red" }}>{eve.severity}</div></div> : ''}
                              {eve.severity === "MINOR" ? <div style={{ display: 'flex', flex: '1' }}><div>{DOWN_ICON}</div><div style={{ color: "green" }}>{eve.severity}</div></div> : ''}
                              {eve.severity === "MAJOR" ? <div style={{ display: 'flex', flex: '1' }}><div>{UP_ICON_ORANGE}</div><div style={{ color: "orange" }}>{eve.severity}</div></div> : ''}

                            </div>
                          </div> : ''}
                        </div>}
                        {/* {eve.utValue!=="NULL"? <div style={{paddingRight:"20px",paddingLeft:"20px",display:'flex',flex:'1'}}><span style={{color:"grey",fontSize:"12px"}}>Alert me when threshold value is </span> <span style={{fontSize:"12px",fontWeight:"bold"}}>{eve.expression} {" "} {eve.ltValue}-{eve.utValue}.</span><div><div style={{display:'flex',flex:'1', textAlign:'right'}}><div>{DOWN_ICON}</div><div>{eve.severity}</div></div></div></div>:''} */}
                      </div>)
                  })}</div>
              <div>



              </div>


            </div>

            <div style={{ color: "grey", marginTop: "10px" }}> Notifications</div>
            <div style={{ display: "flex", flex: "1", flexWrap: "wrap" }}>
              <div style={{ paddingTop: "15px" }}>Email to:</div>
              <div style={{ display: "flex", flex: "1", flexWrap: "wrap" }}>
                {this.state.email.length > 0 ?
                  this.state.email.map((eve, i) => {
                    return (
                      <div key={i} style={{ border: "1px solid lightgrey", paddingTop: "5px", paddingBottom: "5px", paddingLeft: "10px", paddingRight: "10px", borderRadius: "25px", margin: "8px" }}>
                        {eve}</div>)
                  }) : <div style={{ border: "1px solid lightgrey", paddingTop: "5px", paddingBottom: "5px", paddingLeft: "10px", paddingRight: "10px", borderRadius: "25px", margin: "8px" }}> No emails configured</div>}
              </div> </div>

            {/* <div style={{ display: "flex", flex: "1" }}>
              <span style={{ paddingTop: "15px", paddingRight: "10px" }}>SMS to: </span>
              {
                this.state.Smsto.map((eve, i) => {
                  return (
                    <div key={i} style={{ border: "1px solid lightgrey", paddingTop: "5px", paddingBottom: "5px", paddingLeft: "10px", paddingRight: "10px", borderRadius: "25px", margin: "8px" }}>
                      {eve}</div>)
                })}
            </div> */}
            <div style={{ display: "flex", flex: "1" }}>
              <div style={{ paddingTop: "15px", paddingRight: "10px" }}>SNMP :</div>
              {this.state.notifications.snmp ? <div style={{ border: "1px solid lightgrey", paddingTop: "5px", paddingBottom: "5px", paddingLeft: "10px", paddingRight: "10px", borderRadius: "25px", margin: "8px" }}>{this.state.notifications.snmp}</div> : <span style={{ paddingLeft: "10px", marginTop: "15px" }}>No SNMP Configured</span>}

            </div>
            <div style={{ color: "grey", marginTop: "20px" }}> Alert Description</div>
            <div style={{ marginTop: "5px" }}>{this.state.rowDataOnDrilldown.description} </div></div>
        }
      </div>
    );
  }


  onGridReady = (params) => {
    this.api = params.value.api;
  }
  onUpdate = (data) => {
    this.results = data;
    console.log('title', this.results, this.api);
    this.api.onFilterChanged();
  }

  onAddAlert = () => {
    this.getapplicationName();
    this.setState({ AddAlertDialog: true })
  }

  onClose = () => {
    this.setState({ AddAlertDialog: false });
    this.resetAddAlert();
  }


  validate = () => {
    if (this.state.componentNameofNewAlert === '') {
      this.setState({ componentNameErrorFlag: true, componentNameErrorMsg: "Please select component name" });
    }
    if (this.state.applicationNameofNewAlert === '') {
      this.setState({ applicationNameErrorFlag: true, applicationNameErrorMsg: "Please select application name" });
    }
    if (this.state.alertNameofNewAlert === '') {
      this.setState({ alertNameErrorFlag: true, alertNameErrorMsg: "Please select alert name" });
    }
    if (this.state.KPICounterNameofNewAlert === '') {
      this.setState({ kpiErrorFlag: true, kpiErrorMsg: "Please select KPI/counter name" });
    }
    if (this.state.alertDescofNewAlert === '') {
      this.setState({ alertDescErrorFlag: true, alertDescErrorMsg: "Please select alert description" });
    }
    if (this.state.timeIntervalofNewAlert === '') {
      this.setState({ timelyErrorFlag: true, timelyErrorMsg: "Please select time interval" });
    }
    if (this.state.alertExpressionofNewAlert === '') {
      this.setState({ expressionErrFlag: true, expressionErrMsg: "Please select expression" });
    }
    if (this.state.lowerthresholdValueofNewAlert === '') {
      this.setState({ lowerThresholdErrFlag: true, lowerThresholdErrMsg: "Please enter lower threshold value" });
    }
    if (this.state.severityofNewAlert === '') {
      this.setState({ alertSeverityErrFlag: true, alertSeverityErrMsg: "Please select severity" });
    }

    if (this.state.alertExpressionofNewAlert === "BETWEEN") {

      if (this.state.upperthresholdValueofNewAlert === '') {
        this.setState({ upperThresholdErrFlag: true, upperThresholdErrMsg: "Please enter upper threshold value" });
      }
    }




    // if (this.state.alertExpressionofNewAlert === '' && ((this.state.lowerthresholdValueofNewAlert !== '') || (this.state.severityofNewAlert !== ''))) {
    //   this.setState({ expressionErrFlag: true, expressionErrMsg: "Please select expression" });
    // }
    // if (this.state.alertExpressionofNewAlert === '' && ((this.state.lowerthresholdValueofNewAlert !== '') && (this.state.severityofNewAlert !== ''))) {
    //   this.setState({ expressionErrFlag: true, expressionErrMsg: "Please select expression" });
    // }

    // if (this.state.lowerthresholdValueofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') || (this.state.severityofNewAlert !== ''))) {
    //   this.setState({ lowerThresholdErrFlag: true, lowerThresholdErrMsg: "Please enter lower threshold value" });
    // }
    // if (this.state.lowerthresholdValueofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') && (this.state.severityofNewAlert !== ''))) {
    //   this.setState({ lowerThresholdErrFlag: true, lowerThresholdErrMsg: "Please enter lower threshold value" });
    // }

    // if (this.state.severityofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') || (this.state.lowerthresholdValueofNewAlert !== ''))) {
    //   this.setState({ alertSeverityErrFlag: true, alertSeverityErrMsg: "Please select severity" });
    // }
    // else if (this.state.severityofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') && (this.state.lowerthresholdValueofNewAlert !== ''))) {
    //   this.setState({ alertSeverityErrFlag: true, alertSeverityErrMsg: "Please select severity" });
    // }
    // else if (this.state.severityofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') || (this.state.lowerthresholdValueofNewAlert !== '') || (this.state.upperthresholdValueofNewAlert !== ''))) {
    //   this.setState({ alertSeverityErrFlag: true, alertSeverityErrMsg: "Please select severity" });
    // }
    // else if (this.state.severityofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') && (this.state.lowerthresholdValueofNewAlert !== '') && (this.state.upperthresholdValueofNewAlert !== ''))) {
    //   this.setState({ alertSeverityErrFlag: true, alertSeverityErrMsg: "Please select severity" });
    // }
    // if (this.state.alertExpressionofNewAlert === "BETWEEN") {
    //   if (this.state.upperthresholdValueofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') && (this.state.lowerthresholdValueofNewAlert !== '') && (this.state.severityofNewAlert !== ''))) {
    //     this.setState({ upperThresholdErrFlag: true, upperThresholdErrMsg: "Please enter upper threshold value" });
    //   }
    //   if (this.state.upperthresholdValueofNewAlert === '' && ((this.state.alertExpressionofNewAlert !== '') || (this.state.lowerthresholdValueofNewAlert !== '') || (this.state.severityofNewAlert !== ''))) {
    //     this.setState({ upperThresholdErrFlag: true, upperThresholdErrMsg: "Please enter upper threshold value" });
    //   }

    // }

    console.log(this.state.listOfExpressions)

    if (this.state.listOfExpressions.length > 0) {
      for (let i = 0; i < this.state.listOfExpressions.length; i++) {

        if (this.state.listOfExpressions[i].childAlertExpression === '' && ((this.state.listOfExpressions[i].childLowerTvalue !== '') || (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
          formErrors.listOfalertExpressionError[i] = 'Please select expression';
        }
        else if (this.state.listOfExpressions[i].childAlertExpression === '' && ((this.state.listOfExpressions[i].childLowerTvalue !== '') && (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
          formErrors.listOfalertExpressionError[i] = 'Please select expression';
        }
        else if (this.state.listOfExpressions[i].childAlertExpression === '' && ((this.state.listOfExpressions[i].ChildSeverity !== '') || (this.state.listOfExpressions[i].childLowerTvalue !== '') || (this.state.listOfExpressions[i].childUpperTvalue !== ''))) {
          formErrors.listOfalertExpressionError[i] = 'Please select expression';
        }
        else if (this.state.listOfExpressions[i].childAlertExpression === '' && ((this.state.listOfExpressions[i].ChildSeverity !== '') && (this.state.listOfExpressions[i].childLowerTvalue !== '') && (this.state.listOfExpressions[i].childUpperTvalue !== ''))) {
          formErrors.listOfalertExpressionError[i] = 'Please select expression';
        }


        if (this.state.listOfExpressions[i].childLowerTvalue === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') || (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
          formErrors.listOfLowerThresholdError[i] = "Please enter lower threshold value";
        }
        else if (this.state.listOfExpressions[i].childLowerTvalue === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') && (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
          formErrors.listOfLowerThresholdError[i] = "Please enter lower threshold value";
        }
        else if (this.state.listOfExpressions[i].childLowerTvalue === '' && ((this.state.listOfExpressions[i].ChildSeverity !== '') || (this.state.listOfExpressions[i].childAlertExpression !== '') || (this.state.listOfExpressions[i].childUpperTvalue !== ''))) {
          formErrors.listOfLowerThresholdError[i] = "Please enter lower threshold value";
        }
        else if (this.state.listOfExpressions[i].childLowerTvalue === '' && ((this.state.listOfExpressions[i].ChildSeverity !== '') && (this.state.listOfExpressions[i].childAlertExpression !== '') && (this.state.listOfExpressions[i].childUpperTvalue !== ''))) {
          formErrors.listOfLowerThresholdError[i] = "Please enter lower threshold value";
        }

        if (this.state.listOfExpressions[i].ChildSeverity === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') || (this.state.listOfExpressions[i].childLowerTvalue !== ''))) {
          formErrors.listOfSeverityError[i] = "Please select severity";
        }
        else if (this.state.listOfExpressions[i].ChildSeverity === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') && (this.state.listOfExpressions[i].childLowerTvalue !== ''))) {
          formErrors.listOfSeverityError[i] = "Please select severity";
        }
        else if (this.state.listOfExpressions[i].ChildSeverity === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') || (this.state.listOfExpressions[i].childLowerTvalue !== '') || (this.state.listOfExpressions[i].childUpperTvalue !== ''))) {
          formErrors.listOfSeverityError[i] = "Please select severity";
        }
        else if (this.state.listOfExpressions[i].ChildSeverity === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') && (this.state.listOfExpressions[i].childLowerTvalue !== '') && (this.state.listOfExpressions[i].childUpperTvalue !== ''))) {
          formErrors.listOfSeverityError[i] = "Please select severity";
        }
        // if (this.state.listOfExpressions[i].ChildSeverity !== "") {
        //   formErrors.listOfSeverityError[i] = "";
        // }
        if (this.state.listOfExpressions[i].childAlertExpression === "BETWEEN") {
          if (this.state.listOfExpressions[i].childUpperTvalue === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') && (this.state.listOfExpressions[i].childLowerTvalue !== '') && (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
            formErrors.listOfUpperThresholdError[i] = "Please enter upper threshold value";
          }
          else if (this.state.listOfExpressions[i].childUpperTvalue === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') || (this.state.listOfExpressions[i].childLowerTvalue !== '') || (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
            formErrors.listOfUpperThresholdError[i] = "Please enter upper threshold value";
          }
          //   if (this.state.listOfExpressions[i].childLowerTvalue === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') && (this.state.listOfExpressions[i].childUpperTvalue !== '') && (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
          //     formErrors.listOfLowerThresholdError[i] = "Please enter lower threshold value";
          //   }
          // else  if (this.state.listOfExpressions[i].childLowerTvalue === '' && ((this.state.listOfExpressions[i].childAlertExpression !== '') || (this.state.listOfExpressions[i].childUpperTvalue !== '') || (this.state.listOfExpressions[i].ChildSeverity !== ''))) {
          //     formErrors.listOfLowerThresholdError[i] = "Please enter lower threshold value";
          //   }
          // else if (this.state.upperthresholdValueofNewAlert==='' && ((this.state.alertExpressionofNewAlert!=='') && (this.state.upperthresholdValueofNewAlert!=='') )){
          //   this.setState({upperThresholdErrFlag:true,upperThresholdErrMsg:"Please enter upper threshold value"});  
          // }
        }

        // if( !(formErrors.listOfUpperThresholdError[i]==="") ||  !(formErrors.listOfSeverityError[i]==="") || !(formErrors.listOfLowerThresholdError[i]==="")
        //  || !(formErrors.listOfalertExpressionError[i]==="")){
        //   isErrorPresent=true;
        // }
        // else{
        //   isErrorPresent=false;
        // }
      }
    }
  }
  onSave = () => {

    this.validate();
    console.log("formErrors", formErrors)
    console.log("formErrors.listOfLowerThresholdError", formErrors.listOfLowerThresholdError[0]);
    console.log("formErrors.listOfUpperThresholdError", formErrors.listOfUpperThresholdError[0]);
    console.log("loadash formerrors", ((formErrors.listOfLowerThresholdError).filter(e => e)));
    console.log("loadash formerrors", (formErrors.listOfUpperThresholdError).filter(e => e));
    let expressionError = (formErrors.listOfalertExpressionError).filter(e => e);
    let lowerThresholdError = (formErrors.listOfLowerThresholdError).filter(e => e);
    let upperThresholdError = (formErrors.listOfUpperThresholdError).filter(e => e);
    let severityError = (formErrors.listOfSeverityError).filter(e => e);
    console.log("splitted formerrors",lowerThresholdError);
   // console.log("splitted formerrors", lowerThresholdError.split(""));

    setTimeout(() => {
      if ((expressionError.length === 0) &&
        (lowerThresholdError.length === 0) &&
        (upperThresholdError.length === 0) &&
        (severityError.length === 0) && this.state.applicationNameErrorMsg === '' && this.state.alertNameErrorMsg === '' && this.state.kpiErrorMsg === '' && this.state.alertDescErrorMsg === '' &&
        this.state.lowerThresholdErrMsg === '' && this.state.upperThresholdErrMsg === '' && this.state.alertSeverityErrMsg === '' && this.state.expressionErrMsg === '' && this.state.timelyErrorMsg === "") {
        const conditions = [];
        const condition1 = [];

        conditions.push({
          "expression": this.state.alertExpressionofNewAlert, "ltValue": this.state.lowerthresholdValueofNewAlert,
          "utValue": this.state.upperthresholdValueofNewAlert, "severity": this.state.severityofNewAlert
        });

        for (let i = 0; i < this.state.listOfExpressions.length; i++) {
          conditions.push({
            "expression": this.state.listOfExpressions[i].childAlertExpression, "ltValue": this.state.listOfExpressions[i].childLowerTvalue,
            "utValue": this.state.listOfExpressions[i].childUpperTvalue, "severity": this.state.listOfExpressions[i].ChildSeverity
          });
        };
        console.log("list of expressions", conditions)
        let statusofEnableOrDisable = '';
        if (this.state.enableOrDisableLabel === "Disabled") {
          statusofEnableOrDisable = 'DISABLED'
        } else {
          statusofEnableOrDisable = 'ENABLED';
        }

        let payload = {
          // "alertId": this.state.alertNameDropdown,
          "alertName": this.state.alertNameofNewAlert,
          "description": this.state.alertDescofNewAlert,
          "parameterName": this.state.KPICounterNameofNewAlert,
          "interfaceName": this.state.componentNameofNewAlert,
          "applicationName": this.state.applicationNameofNewAlert,
          "interval": this.state.timeIntervalofNewAlert,
          "status": statusofEnableOrDisable,
          "conditions": conditions,
          "isNotificationEnabled": this.state.enabledNotification,
          "notifications": {
            "snmp": this.state.snmpofNewAlertSelectBox
          }
        }
        if (Array.isArray(this.state.emailofNewAlertTextBox)) {
          payload.notifications.email = this.state.emailofNewAlertTextBox;
          console.log("payload.notifications.email", payload.notifications.email)
        }
        else if (this.state.emailofNewAlertTextBox !== "") {
          payload.notifications.email = (this.state.emailofNewAlertTextBox).split(",");
          console.log("payload.notifications.email", payload.notifications.email)
        }
        else {
          payload.notifications.email = [];
          console.log("payload.notifications.email", payload.notifications.email)
        }
        if (actionName === "Edit") {
          payload.alertId = alertIdAsParam;
          http.post(configData.API.SERVICE.ALERTS_CONFIG_EDIT_ALERTS, payload)
            .then(response => {
              console.log("response of popup", response.data);
              this.setState({ enableDisbaleYes: true, recordUpdatedMessage: response.data });
              this.resetAddAlert();
              // this.setState({enableDisbaleYes:true,recordUpdatedMessage:response.data});
              this.getOnloadDataGrid();


            })
            .catch(error => this.setState({ enableDisbaleYes: true, error, recordUpdatedMessage: "Some error occured in the service, please try after a while to see data" }));

        }
        else {
          http.post(configData.API.SERVICE.ALERTS_CONFIG_SAVE_ALERTS, payload)
            .then(response => {
              console.log("response of popup", response.data);
              this.setState({ enableDisbaleYes: true, recordUpdatedMessage: response.data });
              this.resetAddAlert();
              // this.setState({enableDisbaleYes:true,recordUpdatedMessage:response.data});
              this.getOnloadDataGrid();


            })
            .catch(error => this.setState({ enableDisbaleYes: true, error, recordUpdatedMessage: "Some error occured in the service, please try after a while to see data" }));

        }

      }
      else {
        this.setState({ formErrorFlag: true })
      }
    }, 1000);
  }


  onCloseConfirmationEnableDisable = () => {
    this.setState({ enableOrDisableStatusConfirmDialog: false })
  }
  onConfirmofEnableDisable = () => {
    this.setState({ enableOrDisableStatusConfirmDialog: false })
    this.enableOrDisable(alertIdAsParam, alertStatusAsParam);

  }

  oncloseofEnableDisableYes = () => {
    this.setState({ enableOrDisableStatusConfirmDialog: false, enableDisbaleYes: false, AddAlertDialog: false });
    this.resetAddAlert();
  }




  alertExpressionOnChangeDynamically = (e) => {
    console.log("alertExpressionOnChange", e.value);

    this.setState({ alertExpressionofNewAlert: e.value });
    // if(e.value==="BETWEEN"){
    //   this.setState({ widthofDialog:870});
    // }
  }

  addAlertsElements = (e) => {
    this.setState(prevState => ({ listOfExpressions: [...prevState.listOfExpressions, { childAlertExpression: '', childLowerTvalue: '', childUpperTvalue: '', ChildSeverity: '' }] }))
  }

  removeExpression(i) {
    let listOfExpressions = [...this.state.listOfExpressions];
    let listofAlertExpressiondynamically = [...this.state.listofAlertExpressiondynamically]
    listOfExpressions.splice(i, 1);
    listofAlertExpressiondynamically.splice(i, 1);
    formErrors.listOfalertExpressionError.splice(i, 1);
    formErrors.listOfLowerThresholdError.splice(i, 1);
    formErrors.listOfUpperThresholdError.splice(i, 1);
    formErrors.listOfSeverityError.splice(i, 1);

    this.setState({ listOfExpressions, listofAlertExpressiondynamically }, () => { console.log("remove listOfExpressions", this.state.listOfExpressions, "listofAlertExpressiondynamically", listofAlertExpressiondynamically) });

  }

  handleExpressionforDropdown = (i, event) => {
    console.log("event of dropdown",event, "index", i);
    console.log("formErrors.listOfalertExpressionError",formErrors.listOfalertExpressionError);
    console.log("formErrors.listOfSeverityError",formErrors.listOfSeverityError);

    const { id, innerText } = event.nativeEvent.target;
    const value = (event.value);
    let value1;
    if (id.includes("childAlertExpression")) {
      value1 = id.substring(0, 20);
    }
    else {
      value1 = id.substring(0, 13);
    }
    console.log("id", value1, "value1", innerText)
    let listOfExpressions = [...this.state.listOfExpressions];

    const name = "childAlertExpression";
    listOfExpressions[i] = { ...listOfExpressions[i], [value1]: innerText };

    let listofAlertExpressiondynamically = [...this.state.listofAlertExpressiondynamically];
    listofAlertExpressiondynamically[i] = { ...listofAlertExpressiondynamically[i], [value1]: innerText };

    if (id.includes("childAlertExpression") && innerText !== '') {
      formErrors.listOfalertExpressionError[i]="";
    }
    else if (innerText !== '') {
      formErrors.listOfSeverityError[i]="";
    }
    this.setState({ listOfExpressions, listofAlertExpressiondynamically }, () => {
      console.log("listOfExpressions", this.state.listOfExpressions, "listofAlertExpressiondynamically", listofAlertExpressiondynamically);
      if (this.state.listOfExpressions[i].ChildSeverity !== '') {
        formErrors.listOfSeverityError[i]="";
      }
      if (this.state.listOfExpressions[i].childAlertExpression !== "") {
        formErrors.listOfalertExpressionError[i]="";
      }

    });



  }
  handleExpression = (i, event) => {
   

    const { name, value } = event.nativeEvent.target;
    console.log("name", name)
    let listOfExpressions = [...this.state.listOfExpressions];
    listOfExpressions[i] = { ...listOfExpressions[i], [name]: value };
    this.setState({ listOfExpressions }, () => console.log("listOfExpressions", this.state.listOfExpressions));
    // console.log("listOfExpressions", this.state.listOfExpressions);


    if (event.value === "BETWEEN" || this.state.alertExpressionofNewAlert === "BETWEEN" || this.state.listOfExpressions[i].childAlertExpression === "BETWEEN") {
      this.setState({ widthofDialog: 973 });
    }
    else {
      this.setState({ widthofDialog: 973 });
    }
    //  if (this.state.listOfExpressions[i].childUpperTvalue !== "") {
    if (name.includes("childUpperTvalue")) {
      if (!((this.state.listOfExpressions[i].childUpperTvalue).match(/^[a-zA-Z0-9]*$/))) {
        formErrors.listOfUpperThresholdError[i] = "Value can only have alphanumeric characters";
      }
      else {

       // formErrors.listOfUpperThresholdError.splice(i, 1);
       formErrors.listOfUpperThresholdError[i]="";

      }
    }
    // if (this.state.listOfExpressions[i].childLowerTvalue !== "") {
    else {
      if (!((this.state.listOfExpressions[i].childLowerTvalue).match(/^[a-zA-Z0-9]*$/))) {
        formErrors.listOfLowerThresholdError[i] = "Value can only have alphanumeric characters";
      }
      else {
        // formErrors.listOfLowerThresholdError.splice(i, 1);
        formErrors.listOfLowerThresholdError[i]="";


      }
    }
    // if (!((e.value).match(/^[a-zA-Z0-9]*$/))) {

    //   this.setState({ lowerThresholdErrFlag: true, lowerThresholdErrMsg: "Value can only have alphanumeric characters" })
    // }
    // else {
    //   this.setState({ lowerThresholdErrFlag: false, lowerThresholdErrMsg: "" });
    // }


    // if (this.state.listOfExpressions[i].childAlertExpression !== "") {
    //   formErrors.listOfalertExpressionError[i] = "";
    // }

    // if (this.state.listOfExpressions[i].ChildSeverity !== '') {
    //   formErrors.listOfSeverityError[i] = "";
    // }
    //this.validate();
    console.log("formErrors.listOfLowerThresholdError",formErrors.listOfLowerThresholdError);
    console.log("formErrors.listOfUpperThresholdError",formErrors.listOfUpperThresholdError);


    console.log("hiii", this.state.listOfExpressions)

  }
  renderFooter = () => {
    return (
      <div>
        <Button id="cancel" text="CANCEL" aria-label="Cancel" onClick={this.onCancelonAddalert} />
        <Button id="save" text="SAVE" aria-label="Save" enabled isCallToAction onClick={this.onSave} />
      </div>
    )
  }


  renderAddAlertPopup = () => {
    return (
      <Dialog id="addAlertPopup" title="Alert Configuration" height={1500} width={this.state.widthofDialog}
        header={true} trapFocus={false}
        close={true}
        onClose={this.onClose}
        renderFooter={this.renderFooter}
      >
        {this.renderAddAlertUI()}
      </Dialog>
    )
  }
  renderAddAlertUI = () => {
    return (
      <div>
        {this.state.formErrorFlag === true ? <div style={{ color: "#d9070a", fontSize: "14px", margin: "15px", textAlign: 'center' }}>Please give the required inputs</div> : null}

        {this.state.errorServiceMessageforPopup !== '' ? <div style={{ color: "#d9070a", fontSize: "14px", margin: "15px", textAlign: 'center' }}>{this.state.errorServiceMessageforPopup}</div> : null}

        <div style={{ display: 'flex', flex: "1", marginBottom: "15px" }}>
          <div style={{ marginRight: "15px" }}>
            <SelectItem label={"Application Name"} width={360}

              id="selectItem" dynamicHeight required={true}
              options={this.state.applicationNameDropdown}
              noResultsText="No matching terms"
              error={this.state.applicationNameErrorFlag}
              errorMsg={this.state.applicationNameErrorMsg}
              isRequired={true}
              isDisabled={this.state.applicationNameEnabled}
              hasOutline
              onChange={(e) => {
                console.log("LT", this.state.applicationNameofNewAlert)
                this.setState({ applicationNameofNewAlert: e.value });
                if (e.value !== "") {
                  this.setState({ applicationNameErrorMsg: "", applicationNameErrorFlag: false })
                }

                this.getComponentName(e.value);
                this.getSnmpList(e.value)
              }}
              selectedItem={this.state.applicationNameofNewAlert}
            />
          </div>


          <SelectItem label={"Component Name"} width={360} style={{ marginRight: "15px" }} marginRight={15}
            id="selectItem" dynamicHeight required={true}
            options={this.state.componentNameDropdown}
            noResultsText="No matching terms"
            isDisabled={this.state.componentNameEnabled}
            hasOutline
            error={this.state.componentNameErrorFlag}
            errorMsg={this.state.componentNameErrorMsg}
            isRequired={true}
            onChange={(e) => {
              console.log("LT", this.state.componentNameofNewAlert)
              this.setState({ componentNameofNewAlert: e.value })

              if (e.value !== '') {
                this.setState({ componentNameErrorFlag: false, componentNameErrorMsg: "" });
              }
              this.getKPIname(e.value);
            }}
            selectedItem={this.state.componentNameofNewAlert}
          />

        </div>

        <div style={{ display: 'flex', flex: "1" }}>
          <div style={{ marginRight: "15px" }}>


            <SelectItem label={"KPI/Counter Name"} width={360}
              id="selectItem" dynamicHeight required={true}
              options={this.state.kpiNameDropdown}
              error={this.state.kpiErrorFlag}
              errorMsg={this.state.kpiErrorMsg}
              searchable={true}
              noResultsText="No matching terms"
              isDisabled={this.state.kpiNameEnabled}
              isRequired={true}
              hasOutline
              onChange={(e) => {
                console.log("LT", this.state.KPICounterNameofNewAlert)
                this.setState({ KPICounterNameofNewAlert: e.value });
                if (e.value !== '') {
                  this.setState({ kpiErrorFlag: false, kpiErrorMsg: "" });
                }
                this.getAlertsName(e.value);
              }}
              selectedItem={this.state.KPICounterNameofNewAlert}

            />
          </div>
          <SelectItem label={"Alert Name"} width={360} style={{ marginRight: "15px" }} marginRight={15}
            id="selectItem" dynamicHeight required={true}
            options={this.state.alertNameDropdown}
            isRequired={true}
            noResultsText="No matching terms"
            searchable={true}
            error={this.state.alertNameErrorFlag}
            errorMsg={this.state.alertNameErrorMsg}
            isDisabled={this.state.alertNameEnabled}
            hasOutline
            onChange={(e) => {
              console.log("LT", this.state.alertNameofNewAlert)
              this.setState({ alertNameofNewAlert: e.value });
              if (e.value !== '') {
                this.setState({ alertNameErrorFlag: false, alertNameErrorMsg: "" });
              }
            }}
            selectedItem={this.state.alertNameofNewAlert}
          />
        </div>



        <div style={{ marginTop: "15px" }}>
          <TextArea
            id="alertDescription"
            text={this.state.alertDescofNewAlert}
            onChange={(e) => {
              console.log("LT", this.state.alertDescofNewAlert)
              this.setState({ alertDescofNewAlert: e.value });
              if (e.value !== '') {
                this.setState({ alertDescErrorFlag: false, alertDescErrorMsg: "" });
              }
            }}
            error={this.state.alertDescErrorFlag}
            errorMsg={this.state.alertDescErrorMsg}
            disabled={this.state.alertDescEnabled}
            required={true}
            lockWidth={true}
            placeholder="Enter"
            label="Alert Description"
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <div style={{ marginTop: "15px", marginBottom: "3px" }}>
            <Label text="Configure Threshold" />
          </div>
          <div style={{ display: "flex", flex: "1", flexWrap: "wrap" }}>
            <div style={{ fontSize: '12px', marginTop: "6px" }}>Alert me when threshold value is</div>
            <div style={{ marginLeft: "5px", marginRight: "23px" }}>
              <SelectItem
                // label={"Application Name"}
                placeholder={"Select Expression"}
                error={this.state.expressionErrFlag}
                isRequired={true}
                errorMsg={this.state.expressionErrMsg}
                width={150} marginRight={25}
                id="selectItem" dynamicHeight required={true}
                options={this.state.conditionListofExpressionDropdown}
                noResultsText="No matching terms"
                hasOutline
                selectedItem={this.state.alertExpressionofNewAlert}
                onChange={(e) => {
                  this.setState({ alertExpressionofNewAlert: e.value });
                  if (e.value !== '') {
                    this.setState({ expressionErrFlag: false, expressionErrMsg: "" })
                  }
                  if (e.value === "BETWEEN") {
                    this.setState({ widthofDialog: 973 });
                  }
                  else {
                    this.setState({ widthofDialog: 973 });
                  }
                }}
              />

            </div>
            <div style={{ marginLeft: "5px", marginRight: "20px" }}>
              <TextInput
                text={this.state.lowerthresholdValueofNewAlert}
                id="Lowerthreshold"
                required={true}
                placeholder={"Lowerthreshold value"}
                error={this.state.lowerThresholdErrFlag}
                errorMsg={this.state.lowerThresholdErrMsg}
                width={150}
                onChange={(e) => {
                  console.log("LT", this.state.lowerthresholdValueofNewAlert)
                  this.setState({ lowerthresholdValueofNewAlert: e.value });
                  //  if (!((e.value).match(/^[a-zA-Z0-9]*$/))) {
                  if (!((e.value).match(/^[a-zA-Z0-9]*$/))) {

                    this.setState({ lowerThresholdErrFlag: true, lowerThresholdErrMsg: "Value can only have alphanumeric characters" })
                  }
                  else {
                    this.setState({ lowerThresholdErrFlag: false, lowerThresholdErrMsg: "" });
                  }

                }}
              />
            </div>
            {this.state.alertExpressionofNewAlert.includes("BETWEEN") ? <div style={{ marginLeft: "5px", marginRight: "5px" }}>
              <TextInput
                text={this.state.upperthresholdValueofNewAlert}
                id="Upperthreshold"
                required={true}
                placeholder={"Upperthreshold value"}
                // label="Alert Name"
                error={this.state.upperThresholdErrFlag}
                errorMsg={this.state.upperThresholdErrMsg}
                width={165}
                onChange={(e) => {
                  console.log("this.state.upperthresholdValueofNewAlert", this.state.upperthresholdValueofNewAlert)
                  this.setState({ upperthresholdValueofNewAlert: e.value });
                  if (!((e.value).match(/^[a-zA-Z0-9]*$/))) {
                    this.setState({ upperThresholdErrFlag: true, upperThresholdErrMsg: "Value can only have alphanumeric characters" })
                  }
                  else {
                    this.setState({ upperThresholdErrFlag: false, upperThresholdErrMsg: "" });
                  }
                }}
              />
            </div> : ''}

            <div style={{ marginLeft: "5px", marginRight: "5px" }}>
              <SelectItem
                width={150} style={{ marginRight: "15px" }} marginRight={15}
                id="selectItem" dynamicHeight isRequired={true}
                options={this.state.severityListDropdown}
                noResultsText="No matching terms"
                hasOutline
                placeholder={"Select Severity"}
                error={this.state.alertSeverityErrFlag}
                errorMsg={this.state.alertSeverityErrMsg}
                selectedItem={this.state.severityofNewAlert}
                onChange={(e) => {
                  console.log("severity", this.state.severityofNewAlert)
                  this.setState({ severityofNewAlert: e.value });
                  if (e.value !== '') {
                    this.setState({ alertSeverityErrFlag: false, alertSeverityErrMsg: "" })
                  }
                }}

              />

            </div>
            <div style={{ marginLeft: "15px", cursor: "pointer" }} onClick={this.addAlertsElements.bind(this)}>
              {ADD_ICON}</div>

          </div>
          {/* <div style={{ display: "flex", flex: "1", marginTop: '15px', marginBottom: "15px", marginLeft: "-5px", width: "200px", cursor: "pointer" }} onClick={this.addAlertsElements.bind(this)}>
            {ADD_ICON}Add Expression</div> */}

          <div>
            {this.createAlertExpressions()}
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <SelectItem
            label={"Time Interval"}
            width={150} style={{ marginRight: "15px" }} marginRight={15}
            id="timeinterval" dynamicHeight isRequired={true}
            options={this.state.intervalListDropdown}
            error={this.state.timelyErrorFlag}
            errorMsg={this.state.timelyErrorMsg}
            noResultsText="No matching terms"
            hasOutline
            selectedItem={this.state.timeIntervalofNewAlert}
            onChange={(e) => {
              console.log("severity", this.state.timeIntervalofNewAlert)
              this.setState({ timeIntervalofNewAlert: e.value });
              if (e.value !== '') {
                this.setState({ timelyErrorFlag: false, timelyErrorMsg: "" });
              }
            }}

          />

        </div>
        <div>
          <RadioButtonGroup
            id="EnableNotification"
            disabled={false}
            selectedItem={this.state.enabledNotification}
            name="EnableNotification"
            label={"Notification Required"}
            layout='horizontal'
            onChange={e => {
              console.log(e, 'onChange');
              this.setState({ enabledNotification: e.value })
              if (e.value === 'Yes') {
                this.setState({ disableEmailTextBox: false, disabledSNMPselectbox: false })
              }
              else {
                this.setState({ disableEmailTextBox: true, disabledSNMPselectbox: true })
              }
            }
            }
          >

            <RadioButton
              label="Yes"
              value="Yes"
            />
            <RadioButton
              label="No"
              value="No"
            />
          </RadioButtonGroup>
        </div>
        <div style={{ display: 'flex', flex: 1, marginLeft: "5px", marginTop: "15px" }}>
          {/* <div>
<CheckBox
      value={this.state.emailofNewAlert}
      label="Email"
      width={100}
      disabled={this.state.disableEmailCheckbox}
      onChange={(e) => {
        console.log("this.state.emailofNewAlert",this.state.emailofNewAlert)
      this.setState({ emailofNewAlert: e.value }) ;
      if(this.state.emailofNewAlert===true){
        this.setState({disableEmailTextBox:true})
      }
      else{
        this.setState({disableEmailTextBox:false})
      }
      }}
    />
</div> */}
          <div>
            <TextInput
              text={this.state.emailofNewAlertTextBox}
              id="TextInputID"
              placeholder="Enter email"
              label="Email"
              disabled={this.state.disableEmailTextBox}
              width={450}
              onChange={(e) => {
                console.log("this.state.emailofNewAlertTextBox", this.state.emailofNewAlertTextBox)
                this.setState({ emailofNewAlertTextBox: e.value })
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, marginLeft: "5px", marginTop: "15px" }}>
          {/* <div>
<CheckBox
      value={this.state.snmpofNewAlert}
      label="SNMP"
      disabled={this.state.disableSNMPcheckbox}
      onChange={(e) => {
        console.log("this.state.snmpofNewAlert",this.state.snmpofNewAlert)
      this.setState({ snmpofNewAlert: e.value }) ;
      if(this.state.snmpofNewAlert===true){
        this.setState({disabledSNMPselectbox:true})
      }
      else{
        this.setState({disabledSNMPselectbox:false})
      }
      }}
    />
</div> */}
          <div >



            <SelectItem
              width={150} style={{ marginRight: "15px" }} marginRight={15}
              isDisabled={this.state.disabledSNMPselectbox}
              id="snmpofNewAlertSelectBox" dynamicHeight required={true}
              options={this.state.snmpListDropdown}
              noResultsText="No matching terms"
              label="SNMP"
              hasOutline
              selectedItem={this.state.snmpofNewAlertSelectBox}
              onChange={(e) => {
                console.log("this.state.snmpofNewAlertSelectBox", this.state.snmpofNewAlertSelectBox)
                this.setState({ snmpofNewAlertSelectBox: e.value })
              }}
            // onChange={this.severityofNewlertOnClick}      
            />
          </div>
        </div>
        <div style={{ marginTop: "20px" }}>
          <div><Label text="Alert Status" /></div>

          <ToggleSwitch
            id={this.state.enableOrDisableLabel}
            onChange={(e) => {
              console.log("e", e)
              if (e.value === true) {
                this.setState({ alertStatusofNewAlert: e.value, enableOrDisableLabel: "Enabled" },
                  console.log("this.state.alertStatusofNewAlert", this.state.alertStatusofNewAlert))
              }
              else {
                this.setState({ alertStatusofNewAlert: e.value, enableOrDisableLabel: "Disabled" },
                  console.log("this.state.alertStatusofNewAlert", this.state.alertStatusofNewAlert))
              }
            }}
            checked={this.state.alertStatusofNewAlert}
            stateColor
            labelPosition="right"
            onLabel="ON"
            offLabel="OFF"
            label={this.state.enableOrDisableLabel}
          />
        </div>
      </div>

    )

  }
  createAlertExpressions() {
    const { listOfalertExpressionError = [], listOfLowerThresholdError = [], listOfUpperThresholdError = [], listOfSeverityError = [] } = formErrors
    return this.state.listOfExpressions.map((evn, i) =>
      <div style={{ display: "flex", flex: "1", flexWrap: "wrap", marginBottom: "10px" }}>
        <div style={{ fontSize: '12px', marginTop: "6px" }}>Alert me when threshold value is</div>
        <div style={{ marginLeft: "5px", marginRight: "23px" }}>
          {/* <SelectItem  
  // label={"Application Name"}
  placeHolder="Alert Expression"
  //  width={150} style={{marginRight:"15px"}} marginRight={15}
  //         id="selectItem" dynamicHeight required={true}
  //         options={expressionOptions}
  //         noResultsText="No matching terms"
  //         hasOutline   
  //         name="childAlertExpression"
  //         valueKey={evn.childAlertExpression || ''}         
  //        selectedItem={evn.childAlertExpression}           
  //        onChange={this.handleExpression.bind(this, i)}        
  //        value={evn.childAlertExpression || ''} 



         width={150} style={{marginRight:"15px"}} marginRight={15}
         id="childAlertExpression" dynamicHeight required={true}
         options={expressionOptions}
         noResultsText="No matching terms"
         hasOutline       
         onChange={this.handleExpression.bind(this, i)}      
        selectedItem={evn.childAlertExpression} 
        name="childAlertExpression"
        value={evn.childAlertExpression || ''}  
        // valueKey={evn.childAlertExpression || ''}
         />     */}
          <SelectItem
            // label={"Application Name"}
            placeholder={"Select Expression"}
            width={150} style={{ marginRight: "23px" }} marginRight={15}
            id={"childAlertExpression" + i} dynamicHeight required={true}
            options={this.state.conditionListofExpressionDropdown}
            error={!!listOfalertExpressionError[i]}
            errorMsg={listOfalertExpressionError[i]}
            noResultsText="No matching terms"
            hasOutline
            //  selectedItem={this.state.listofAlertExpressiondynamically[i] || ''}           
            selectedItem={evn.childAlertExpression}
            // value={evn.childAlertExpression[i] || ''}  
            //   valueKey={evn.childAlertExpression[i]}
            onChange={this.handleExpressionforDropdown.bind(this, i)}
          />

        </div>
        <div style={{ marginLeft: "5px", marginRight: "5px" }}>
          <TextInput
            //   text={evn.childLowerTvalue}
            id="TextInputID"
            placeholder={"Lowerthreshold value"}
            // label="Alert Name"
            name="childLowerTvalue"
            error={!!listOfLowerThresholdError[i]}
            errorMsg={listOfLowerThresholdError[i]}
            text={evn.childLowerTvalue || ''}
            value={evn.childLowerTvalue || ''}
            width={165}

            onChange={this.handleExpression.bind(this, i)}

          />
        </div>
        {evn.childAlertExpression.includes("BETWEEN") ? <div style={{ marginLeft: "5px", marginRight: "5px" }}>
          <TextInput

            id="TextInputID"
            placeholder={"Upperthreshold value"}
            // label="Alert Name"
            text={evn.childUpperTvalue || ''}
            value={evn.childUpperTvalue || ''}
            width={165}
            error={!!listOfUpperThresholdError[i]}
            errorMsg={listOfUpperThresholdError[i]}
            name="childUpperTvalue"
            onChange={this.handleExpression.bind(this, i)}

          />
        </div> : ''}

        <div style={{ marginLeft: "5px", marginRight: "5px" }}>
          <SelectItem
            // label={"Application Name"}
            width={150} style={{ marginRight: "15px" }} marginRight={15}
            id={"ChildSeverity" + i} dynamicHeight required={true}
            options={this.state.severityListDropdown}
            noResultsText="No matching terms"
            hasOutline
            placeholder={"Select Severity"}
            error={!!listOfSeverityError[i]}
            errorMsg={listOfSeverityError[i]}
            selectedItem={evn.ChildSeverity}
            name="ChildSeverity"
            //  value={evn.ChildSeverity }  
            onChange={this.handleExpressionforDropdown.bind(this, i)}
          // onChange={this.integrationTypeOnChange}      
          />

        </div>
        <div style={{ marginLeft: "15px", marginTop: "3px", cursor: "pointer" }} key={i} onClick={this.removeExpression.bind(this, i)}>{REMOVE_ICON}</div>

      </div>
    )
  }
  render() {
    return (
      <div style={{ height: "auto" }}>

        {this.state.errorServiceMessage !== '' ? <div style={{ textAlign: "center", color: 'red', fontSize: '16px', margin: "15px" }}> {this.state.errorServiceMessage}</div> : ''}
        <div style={{ margin: "15px", marginBottom: "0px", textAlign: "right", float: 'right' }}><Button id="New" text="Add Alert" onClick={this.onAddAlert} isCallToAction /> </div>

        <DataGrid
          gridOptions={this.gridOptionsSearchWChips}
          onGridReady={this.onGridReady}
          rowData={this.state.rowData}
          domLayout="autoHeight"
          multiActionMoreButtonToolTipLabel={true}
          unSortIcon={false}
          suppressScrollOnNewData={false}
          suppressTooltips={true}
          id="my-datagrid-id"
        >
          <StatefulSearchwChips placeHolder="Search.." onUpdate={this.onUpdate} />
        </DataGrid>

        {this.state.deleteConfirmDialog ?
          <AlertDialogConfirm id="alertDialogConfirmfordelete" title="Are you sure you want to delete the alert?" confirmationText1="Are you sure you want to delete the alert?"
            confirmationButtonLabel="DELETE" onClose={this.onCloseConfirmationDelete} onConfirm={this.onConfirmofdelete}
            trapFocus={false} focusDialog={false} detailsText="" /> : ''}


        {this.state.deleteYES ? <div>
          <AlertDialogInfo id="deletedPopup" title="Information" infoText={this.state.recordDeleteMessage}
            onClose={this.oncloseDeletePopup} trapFocus={false} focusDialog={false} />
        </div> : null}


        {this.state.enableOrDisableStatusConfirmDialog ?
          <AlertDialogConfirm id="alertDialogConfirm" title={this.state.enableDisableAlertMessage} confirmationText1={this.state.enableDisableAlertMessage}
            confirmationButtonLabel="YES" onClose={this.onCloseConfirmationEnableDisable} onConfirm={this.onConfirmofEnableDisable}
            trapFocus={false} focusDialog={false} detailsText="" /> : ''}


        {this.state.enableDisbaleYes ? <div>
          <AlertDialogInfo id="updatedPopup" title="Information" infoText={this.state.recordUpdatedMessage}
            onClose={this.oncloseofEnableDisableYes} trapFocus={false} focusDialog={false} />
        </div> : null}
        { this.state.showDialog && this.renderAlertPopup()}
        {this.state.AddAlertDialog && this.renderAddAlertPopup()}
      </div>

    );
  }
}


class StatefulSearchwChips extends React.Component { // eslint-disable-line react/no-multi-comp
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

export default AlertConfigurationView;