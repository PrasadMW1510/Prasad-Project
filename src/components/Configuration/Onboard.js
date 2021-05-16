import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from "axios";
import uniqueId from 'lodash/uniqueId';
import { Button, Card, Tabs, Tab,   ExpansionPanel, Label, AlertDialogInfo, Dialog, Snackbar, TextInput, SvgIcon, VerticalStepWizard, FileUploader, FormLayout, RadioButtonGroup, RadioButton } from '@nokia-csf-uxr/csfWidgets';
import '../../Styles/Onboard.css';
import XLSX from 'xlsx';
import PropTypes from "prop-types";
import { text } from '@storybook/addon-knobs';
import _ from 'react-props-noop';
import ic_remove_circle from '@nokia-csf-uxr/csfWidgets/images/ic_remove_circle.svg';
import ic_admin_down from '@nokia-csf-uxr/csfWidgets/images/ic_admin_down.svg';
import ic_admin_up from '@nokia-csf-uxr/csfWidgets/images/ic_admin_up.svg';
import CSFP_Template from '../../assets/CSFP_Template.xlsx';
import NonCSFP_Template from '../../assets/NonCSFP_Template.xlsx';
import http from '../service';
import configData from "../../Config.json";

var configuredApplications;
var showEdit=false;
var showDelete=false;
var portname;
const statusErrorList = ['error', 'rejected', 'rejectedtype', 'rejectedmax', 'rejectedmin'];// 'rejecteddup' is special
const ADD_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_add_circle" iconColor="#124191" />;
const REMOVE_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_remove_circle_outline" iconColor="red" />;
const EDIT_ICON = <SvgIcon key="icon_edit" icon="ic_edit" iconHeight="24px" iconWidth="24px" iconColor="#124191" />;
const DELETE_ICON = <SvgIcon key="icon-success" iconHeight="24px" iconWidth="24px" icon="ic_delete" iconColor="red" />;
const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const ERROR_ICON = <SvgIcon key="icon-warning" iconWidth="20" icon="ic_warning" iconColor="rgb(199, 47, 33)" />;
const ALARM_ICON = <SvgIcon key="ic_ne_alarms" iconWidth="18px" iconHeight="18px" icon="ic_ne_alarms" iconColor="#808080" />;

const defaultUserModel = {
    application: '',
    applicationType: '',
    uploadDataFile: '',
    CSFPnameText: '',
    CSFPapplicationNameSpace: '',
    NonCSFPnameText: '',
    NonCSFPapplicationNameSpace: '',
    CSFPmandtryPortalnodes: {  portalUserName: '',portalPassword: '', portalName: '', portalURL: '', hostName: '', privateIP: '', publicIP: '' },
    CSFPmandatoryEdgeNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    CSFPmandatoryDeployerNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    CSFPmandatoryWorkerNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    CSFPmandatoryControllerNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    CSFPmandatoryStorageNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    NonCSFPmandatoryPortalnodes: { portalUserName: '',portalPassword: '',portalName: '', portalURL: '', hostName: '', privateIP: '', publicIP: '' },
    NonCSFPmandatoryDatabaseNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    NonCSFPmandatoryProcessNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    NonCSFPmandatoryDeployerNodes: { nodeName: '', hostName: '', privateIP: '', publicIP: '' },
    listOfPortalNodes: [],
    listOfEdgeNodes: [],
    listOfControllerNodes: [],
    listOfDeployerNodes: [],
    listOfStorageNodes: [],
    listOfWorkerNodes: [],
    listOfNonCSFPDeployerNodes: [],
    listOfNonCSFPportalNodes: [],
    listofNonCSFPdatabasenodes: [],
    listOfNonCSFPprocessingNodes: [],
    edgeNodeUserName: '',
    edgeNodePassword: '',
    workerNodeUserName: '',
    workerNodePassword: '',
    controllerPassword: '',
    controllerUserName: '',
    storageNodeUserName: '',
    storageNodePassword: '',
    deployerNodeUserName: '',
    deployerNodePassword: '',
    NonCSFPDatabaseUserName: '',
    NonCSFPDatabasePassword: '',
    NonCSFPProcessingUserName: '',
    NonCSFPProcessingPassword: '',
    NonCSFPDeployerUserName: '',
    NonCSFPDeployerPassword: '',
    validationflagcolor: false,
    editflagofform3: false,
    form1Complete: false,
    form2Complete: false,
    form3Complete: true
};
let appName = "CXM";
let editUserModel = defaultUserModel;
let formErrors = {};


class OnboardForm1 extends React.Component {
    static propTypes = {
        onValidate: PropTypes.func,
        onBack: PropTypes.func,
        handler: PropTypes.func
    };

    static defaultProps = {
        onValidate: _.noop,
        onBack: _.noop,
        handler: _.noop
    };

    state = {
        apptype: editUserModel.applicationType,
        defaultApplicationType: '',
        selectedAppTypeFlag: false
    };

    componentDidMount() {
        if (this.props.onValidate) {
            this.props.onValidate(this.validate);
        }

        if (this.props.onBack) {
            this.props.onBack(this.back);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.onValidate) {
            nextProps.onValidate(this.validate);
        }
    }

    back = () => {
        // Back button was pressed
    };

    validate = () => {
        const validation = {
            errors: [],
            warnings: []
        };

        editUserModel.applicationType = (this.state.apptype) ? this.state.apptype.trim() : '';
        formErrors.appTypeError = '';

        console.log("appName", appName)
        if (!editUserModel.applicationType) {
            formErrors.appTypeError = 'application Type is required';
            validation.errors.push(formErrors.appTypeError);
        }

        this.forceUpdate();

        return validation;
    };

    render() {
        const { appTypeError } = formErrors;
        let disableCSFP = false;
        let disableNonCSFP = false;
        if (editUserModel.editflagofform3) {
            if (editUserModel.applicationType === "CSFP") {
                disableCSFP = false;
                disableNonCSFP = true;
            }
            else {
                disableCSFP = true;
                disableNonCSFP = false;
            }
        }
        return (
            <div style={{ padding: "20px" }}>
                <RadioButtonGroup
                    id="csfkOrNoncsfk"
                    disabled={false}
                    selectedItem={this.state.apptype}
                    name="radiocolorgroup"
                    label={'Select application type'}
                    style={{ marginLeft: "-5px" }}
                    onChange={(data) => {
                        appName = editUserModel.application + "  " + "|" + "  " + data.value;
                        this.setState({ apptype: data.value, selectedAppTypeFlag: true });

                        editUserModel.form1Complete = data.value.length > 0;
                        console.log("form1", editUserModel.form1Complete)
                        this.props.handler(data.value);
                        console.log("appType", data.value)
                    }}
                    layout='vertical'
                    minWidth={this.props.minWidth}
                    maxWidth={this.props.maxWidth}
                    width={this.props.width}
                >
                    <RadioButton
                        label="CSFP"
                        name="CSFP"
                        value="CSFP"
                        id="CSFP"
                        disabled={disableCSFP}
                    />

                    <RadioButton
                        label="Non-CSFP"
                        name="Non-CSFP"
                        value="Non-CSFP"
                        id="Non-CSFP"
                        disabled={disableNonCSFP}
                    />
                </RadioButtonGroup>
            </div>
        );
    }
}

class OnboardForm2 extends React.Component {
    static propTypes = {
        onValidate: PropTypes.func,
        onBack: PropTypes.func,
        handler: PropTypes.func,
        initialData: PropTypes.bool,

    };

    static defaultProps = {
        onValidate: _.noop,
        onBack: _.noop,
        handler: _.noop,
        initialData: true,
    };


    //   data = (this.props.initialData ? [
    //     { filename: 'file3.txt', status: 'complete', uploadDate: new Date('6/18/2014 15:00 UTC') }
    //   ] : []);

    data = [];
    constructor(props) {
        super(props);
        //   appName=appName+" "+"|"+" "+editUserModel.applicationType;
        this.state = {
            //  uploadTemplate: editUserModel.uploadDataFile,
            dataofFile: editUserModel.uploadDataFile,
            fileuploadedorNot: [],
            fileUploadProps: {
                // heightMax: number('heightMax', Infinity),
                // denyMultipleFileDrop: boolean('Deny Multiple File Drop', false),
                // fileTypes: 'image/*, text/*',
                // maxFileSizeAllowed: 500000,
                // minFileSizeAllowed: 1000,
                //
                // okResponse: this.okCallBackAction,
                // okDisabled: false,
                // cancelResponse: this.cancelCallBackAction,
                // cancelDisabled: false,

                onFileSelect: (event) => {
                    this.onFileSelectCallback(event.value);
                },
                fileDeleteResponse: (event) => {
                    this.onFileDeleteCallback(event.value);
                },
                fileDeleteErrorResponse: (eventObj) => {
                    this.onFileDeleteErrorCallback(eventObj.value.filename, eventObj.value.status);
                },
                fileCancelResponse: (event) => {
                    this.onFileCancelCallback(event.value);
                },
                fileRetryResponse: (event) => {
                    this.onFileRetryCallback(event.value);
                },
                fileAbortResponse: (event) => {
                    this.onFileAbortCallback(event.value);
                },
                onErrorRetry: true,
                // dropZoneHintText: text('dropZoneHintText', 'This is some instructional hint text'),

            }

        }
        console.log("editUserModel", editUserModel)
    };
    onFileAbortCallback = (filename) => {
        const indexToAbort = this.data.findIndex(item => item.filename === filename);
        if ((indexToAbort > -1) && this.data[indexToAbort].status === 'uploading') {
            this.data[indexToAbort].status = 'pending';
        }
        this.setState({ dataofFile: this.data });
    };

    onFileRetryCallback = (filename) => {
        const indexToRetry = this.data.findIndex(item => item.filename === filename);
        if ((indexToRetry > -1) && (this.data[indexToRetry].status === 'error')) {
            this.data[indexToRetry].status = 'pending';
            this.setState({ dataofFile: this.data });
            this.simulateUploading();
        } else {
            console.error(`${filename} may not be retried at this time`);
        }
    };

    onFileCancelCallback = (filename) => {
        let indexToCancel = this.data.findIndex(item => item.filename === filename);
        if ((indexToCancel > -1) && (this.data[indexToCancel].status !== 'uploading')) {
            this.data.splice(indexToCancel, 1);
        }
        // remove any other filename with a different status (such as rejectDup)
        indexToCancel = this.data.findIndex(item => item.filename === filename);
        if ((indexToCancel > -1) && (this.data[indexToCancel].status !== 'uploading')) {
            this.data.splice(indexToCancel, 1);
        }
        this.setState({ dataofFile: this.data });
    };

    onFileDeleteCallback = (filename) => {
        console.log("deleting file name", filename)

        let indexToDelete = this.data.findIndex(item => item.filename === filename);
        this.data.splice(indexToDelete, 1);
        // is there another entry with this filename hangingaround (status='rejectedDup')
        indexToDelete = this.data.findIndex(item => item.filename === filename);
        if (indexToDelete > -1) {
            this.data.splice(indexToDelete, 1);
        }
        this.setState({ dataofFile: this.data });
        console.log("deleted file", this.state.dataofFile)
        editUserModel.form2Complete = this.state.dataofFile.length !== 0;
        console.log("dofile", editUserModel.form2Complete)

    };

    onFileDeleteErrorCallback = (filename, status) => {
        const indexToDelete = this.data.findIndex(item => item.filename === filename && item.status.toLowerCase() === status.toLowerCase());
        if (indexToDelete > -1) {
            this.data.splice(indexToDelete, 1);
        }
        this.setState({ dataofFile: this.data });
    };

    onFileSelectCallback = (filesSelected) => {
        console.log("fileselected", filesSelected)
        // this.setState({ uploadTemplate: filesSelected[0].file, dataofFile: filesSelected[0].filename });
        this.setState({ dataofFile: filesSelected[0].file });
        this.props.handler(filesSelected.value);
        filesSelected.forEach((line) => {
            if (this.data.findIndex(item => item.filename === line.filename) === -1) {
                this.data.push({ filename: line.filename, status: line.status, uploadDate: line.uploadDate, file: line.file });
                // uploadedFiles.push({ name: line.file.name, size: line.file.size });
                // this would be sent to a server - for the demo, throw it away
            } else {
                // found the filename, check the status, keep rejectedDup
                let foundOne = false;
                let foundError = false;
                let whereFound = -1;
                for (let i = 0; i < this.data.length; i += 1) {
                    if (this.data[i].filename === line.filename && this.data[i].status === line.status) {
                        foundOne = true;
                    }
                    if (this.data[i].filename === line.filename && statusErrorList.indexOf(this.data[i].status.toLowerCase()) > -1) {
                        foundError = true;
                        whereFound = i;
                    }
                }
                if (!foundOne) {
                    // remove if the exiting entry has an error != rejectedDup
                    if (foundError) {
                        this.data.splice(whereFound, 1);
                    }
                    this.data.push({ filename: line.filename, status: line.status, uploadDate: line.uploadDate, file: line.file });
                }
            }
        });

        this.setState({ dataofFile: this.data });
        // updateEnteredFilesOnDisplay();

        // kickstart the process to begin uploading files if there are any pending
        this.simulateUploading();
    };

    simulateUploading = () => {
        this.data.forEach((line, index) => {
            if (line.status === 'pending') {
                this.data[index].status = 'uploading';
                this.data[index].uploadedPercent = 0;
                this.setState({ dataofFile: this.data });
                setTimeout(() => { this.progress(index); }, Math.floor(Math.random() * 2000));
            }
        });
    };

    progress = (index) => {
        let p = 0;
        let t = 0;
        for (p = 0, t = 0; p < 100; p += Math.floor(Math.random() * 3), t += 50) {
            const percent = p;

            setTimeout(() => {
                if (this.data[index] != null && this.data[index].status === 'uploading') {
                    this.data[index].uploadedPercent = percent;
                    this.setState({ dataofFile: this.data });
                }
            }, t);
        }

        setTimeout(() => {
            if (this.data[index] != null && this.data[index].status === 'uploading') {
                if (index % 3 === 1) {
                    this.data[index].status = 'error';
                    this.data[index].uploadDate = new Date();
                    this.data[index].errorMsg = 'Upload failure. The reason is unknown.';
                } else {
                    this.data[index].status = 'complete';
                    // data[index].uploadDate = "Today: " + new Date();
                    // data[index].uploadDate = "Today";
                    this.data[index].uploadDate = new Date();
                    console.log("this.data.status", this.data[index].status)
                }
                this.setState({ dataofFile: this.data });
                editUserModel.form2Complete = this.data[0].status === 'complete';
                console.log("data is", this.state.dataofFile);
                this.props.handler(this.state.dataofFile);
                console.log("editUserModel.form2Complete", editUserModel.form2Complete);


                this.validate();

            }
        }, t);
    };


    okCallBackAction = () => {
        console.log('OK Callback action');
    };
    cancelCallBackAction = () => {
        console.log('CANCEL Callback action');
    };

    componentDidMount() {
        // appName=appName+" "+"|"+" "+editUserModel.applicationType;
        if (this.props.onValidate) {
            this.props.onValidate(this.validate);
        }

        if (this.props.onBack) {
            this.props.onBack(this.back);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.onValidate) {
            nextProps.onValidate(this.validate);
        }
    }

    back = () => {
        // Back button was pressed
    };
    processExcel(data) {
        const workbook = XLSX.read(data, { type: 'binary' });
        console.log("data is", workbook.SheetNames.length);
        let firstSheet;
        let excelRows;
        const a = [];
        // const firstSheet = workbook.SheetNames[0];
        // const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
        //const excelColumns=XLSX.utils.workbook.read
        const secondSheet = workbook.SheetNames[1];
        const SecondexcelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[secondSheet]);
        const thirdSheet = workbook.SheetNames[2];
        const ThirdexcelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[thirdSheet]);
        for (let i = 0; i < workbook.SheetNames.length; i++) {
            firstSheet = workbook.SheetNames[i];
            XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
            a.push(XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]))
        }
        // const workbook1 = XLSX.readFile(data)
        console.log(excelRows);
        console.log(SecondexcelRows);
        console.log("trial", ThirdexcelRows);

        // a.push({excelRows})
        // a.push({SecondexcelRows})
        // a.push({ThirdexcelRows})
        console.log("A", a)
        console.log("a.0", a[0])
        editUserModel.CSFPnameText = a[0][0].Name;
        editUserModel.CSFPapplicationNameSpace = a[0][0].Application_Name_space;
        editUserModel.PortalUserName = a[0][0].PortalNode_Username;
        editUserModel.PortalPassword = a[0][0].PortalNode_Password;
        editUserModel.edgeNodeUserName = a[0][0].EdgeNode_Username;
        editUserModel.edgeNodeUserName = a[0][0].EdgeNode_Password;
        editUserModel.deployerNodeUserName = a[0][0].DeployerNode_Username;
        editUserModel.deployerNodePassword = a[0][0].DeployerNode_Password;
        editUserModel.controllerUserName = a[0][0].ControllerNode_Username;
        editUserModel.controllerPassword = a[0][0].ControllerName_Password;
        editUserModel.storageNodeUserName = a[0][0].StorageNode_Username;
        editUserModel.storageNodePassword = a[0][0].StorageNode_Password;

        console.log(editUserModel);

        // console.log("trial1",workbook1)
    }
    //     var sheet_name_list = workbook.SheetNames;
    //     sheet_name_list.forEach(function(y) {
    //         var worksheet = workbook.Sheets[y];
    //         var headers = {};
    //         var data = [];
    //         var z=0;
    //         for(z in worksheet) {
    //             if(z[0] === '!') continue;
    //             //parse out the column, row, and value
    //             var tt = 0;
    //             for (var i = 0; i < z.length; i++) {
    //                 if (!isNaN(z[i])) {
    //                     tt = i;
    //                     break;
    //                 }
    //             };
    //             var col = z.substring(0,tt);
    //             var row = parseInt(z.substring(tt));
    //             var value = worksheet[z].v;

    //             //store header names
    //             if(row == 1 && value) {
    //                 headers[col] = value;
    //                 continue;
    //             }

    //             if(!data[row]) data[row]={};
    //             data[row][headers[col]] = value;
    //         }
    //         //drop those first two rows which are empty
    //         data.shift();
    //         data.shift();
    //         console.log(data);
    //     });
    // }



    validate = () => {
        const validation = {
            errors: [],
            warnings: []
        };
        console.log("validate", this.state.data);
        formErrors.uploadTempError = '';
        //this.setState({uploadTemplate:this.data})
        editUserModel.uploadDataFile = (this.state.dataofFile.length > 0) ? this.state.dataofFile : '';
        console.log("validate filename", editUserModel.uploadDataFile)
        formErrors.uploadTempError = '';
       // let fileName = editUserModel.uploadDataFile[0].file.name;
        // if(!(fileName==="CSFP_Template.xlsx"|| "NonCSFP_Template.xlsx")){
        //     formErrors.uploadTempError = "File name should be CSFP_Templates.xlsx for CSFP and NonCSFP_Template.xlsx for NonCSFP"    
        // }
        if (!editUserModel.uploadDataFile) {
            formErrors.uploadTempError = 'please upload file to proceed';
            validation.errors.push(formErrors.uploadTempError);
        }
    
       // if(editUserModel.uploadDataFile){
   if((editUserModel.uploadDataFile) && (editUserModel.applicationType==="CSFP") && (editUserModel.uploadDataFile[0].filename!=="CSFP_Template.xlsx")){
            formErrors.uploadTempError = "Please upload correct file, expected file is CSFP_Template.xlsx for CSFP";  
            validation.errors.push(formErrors.uploadTempError);
        }
else
 if((editUserModel.uploadDataFile) &&  (editUserModel.applicationType==="Non-CSFP") && (editUserModel.uploadDataFile[0].filename!=="NonCSFP_Template.xlsx")){
    formErrors.uploadTempError = "Please upload correct file, expected file is NonCSFP_Template.xlsx for NonCSFP";   
    validation.errors.push(formErrors.uploadTempError);
}
        
    //}
     if(editUserModel.uploadDataFile && ((editUserModel.uploadDataFile[0].filename==="CSFP_Template.xlsx")||(editUserModel.uploadDataFile[0].filename==="NonCSFP_Template.xlsx"))){
        if (typeof (FileReader) !== 'undefined') {
            const reader = new FileReader();
            if (reader.readAsBinaryString) {
                reader.onload = (e) => {
                    // this.processExcel(reader.result);
                    const data = reader.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    console.log("data is", workbook.SheetNames.length);
                    let firstSheet;
                    let excelRows;
                    const a = [];
                    // const firstSheet = workbook.SheetNames[0];
                    // const excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
                    //const excelColumns=XLSX.utils.workbook.read
                    //    const secondSheet = workbook.SheetNames[1];
                    //    const SecondexcelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[secondSheet]);
                    //    const thirdSheet = workbook.SheetNames[2];
                    //    const ThirdexcelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[thirdSheet]);
                    for (let i = 0; i < workbook.SheetNames.length; i++) {
                        firstSheet = workbook.SheetNames[i];
                        XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
                        a.push(XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]))
                    }



                    console.log("A", a)
                    console.log("a.0", a[1][0].Name)
                    try {
                        if (editUserModel.applicationType === "CSFP") {
                            if (a[0]) {
                                editUserModel.CSFPnameText = a[1][0].Name;
                                editUserModel.CSFPapplicationNameSpace = a[1][0].Application_Name_Space;
                                // editUserModel.PortalUserName = a[2][0].PortalNode_Username;
                                // editUserModel.PortalPassword = a[2][0].PortalNode_Password;
                                editUserModel.edgeNodeUserName = a[3][0].EdgeNode_Username;
                                editUserModel.edgeNodePassword = a[3][0].EdgeNode_Password;
                                editUserModel.deployerNodeUserName = a[6][0].DeployerNode_Username;
                                editUserModel.deployerNodePassword = a[6][0].DeployerNode_Password;
                                editUserModel.workerNodeUserName = a[4][0].WorkerNode_UserName;
                                editUserModel.workerNodePassword = a[4][0].WorkerNode_Password;
                                editUserModel.controllerUserName = a[5][0].ControllerNode_Username;
                                editUserModel.controllerPassword = a[5][0].ControllerNode_Password;
                                editUserModel.storageNodeUserName = a[7][0].StorageNode_Username;
                                editUserModel.storageNodePassword = a[7][0].StorageNode_Password;
                            }
                            if (a[2] && a[2][0]) {editUserModel.CSFPmandtryPortalnodes.portalUserName = a[2][0].PortalNode_Username; editUserModel.CSFPmandtryPortalnodes.portalPassword = a[2][0].PortalNode_Password; editUserModel.CSFPmandtryPortalnodes.portalName = a[2][0].PortalName; editUserModel.CSFPmandtryPortalnodes.portalURL = a[2][0].PortalURL; editUserModel.CSFPmandtryPortalnodes.hostName = a[2][0].Hostname; editUserModel.CSFPmandtryPortalnodes.privateIP = a[2][0].PrivateIP; editUserModel.CSFPmandtryPortalnodes.publicIP = a[2][0].PublicIP; }
                            if (a[3] && a[3][0]) { editUserModel.CSFPmandatoryEdgeNodes.nodeName = a[3][0].Nodename; editUserModel.CSFPmandatoryEdgeNodes.hostName = a[3][0].Hostname; editUserModel.CSFPmandatoryEdgeNodes.privateIP = a[3][0].PrivateIP; editUserModel.CSFPmandatoryEdgeNodes.publicIP = a[3][0].PublicIP; }
                            if (a[4] && a[4][0]) { editUserModel.CSFPmandatoryWorkerNodes.nodeName = a[4][0].Nodename; editUserModel.CSFPmandatoryWorkerNodes.hostName = a[4][0].Hostname; editUserModel.CSFPmandatoryWorkerNodes.privateIP = a[4][0].PrivateIP; editUserModel.CSFPmandatoryWorkerNodes.publicIP = a[4][0].PublicIP; }
                            if (a[5] && a[5][0]) { editUserModel.CSFPmandatoryControllerNodes.nodeName = a[5][0].Nodename; editUserModel.CSFPmandatoryControllerNodes.hostName = a[5][0].Hostname; editUserModel.CSFPmandatoryControllerNodes.privateIP = a[5][0].PrivateIP; editUserModel.CSFPmandatoryControllerNodes.publicIP = a[5][0].PublicIP; }
                            if (a[6] && a[6][0]) { editUserModel.CSFPmandatoryDeployerNodes.nodeName = a[6][0].Nodename; editUserModel.CSFPmandatoryDeployerNodes.hostName = a[6][0].Hostname; editUserModel.CSFPmandatoryDeployerNodes.privateIP = a[6][0].PrivateIP; editUserModel.CSFPmandatoryDeployerNodes.publicIP = a[6][0].PublicIP; }
                            if (a[7][0]) {
                                editUserModel.CSFPmandatoryStorageNodes.nodeName = a[7][0].Nodename; editUserModel.CSFPmandatoryStorageNodes.hostName = a[7][0].Hostname; editUserModel.CSFPmandatoryStorageNodes.privateIP = a[6][0].PrivateIP; editUserModel.CSFPmandatoryStorageNodes.publicIP = a[6][0].PublicIP;
                            }

                            if (a[2].length > 1) {
                                for (let i = 1; i < a[2].length; i++) {
                                    editUserModel.listOfPortalNodes[i - 1] = { portalUsername:"",portalPassword:"",portalName: "", portalURL: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfPortalNodes[i - 1].portalUsername= a[2][i].PortalNode_Username;
                                    editUserModel.listOfPortalNodes[i - 1].portalPassword = a[2][i].PortalNode_Password;
                                    editUserModel.listOfPortalNodes[i - 1].portalName = a[2][i].PortalName;
                                    editUserModel.listOfPortalNodes[i - 1].portalURL = a[2][i].PortalURL;
                                    editUserModel.listOfPortalNodes[i - 1].hostName = a[2][i].Hostname;
                                    editUserModel.listOfPortalNodes[i - 1].privateIP = a[2][i].PrivateIP;
                                    editUserModel.listOfPortalNodes[i - 1].publicIP = a[2][i].PublicIP;
                                }
                                console.log("list of portal nodes",editUserModel.listOfPortalNodes)
                            }
                            if (a[3].length > 1) {
                                for (let i = 1; i < a[3].length; i++) {
                                    editUserModel.listOfEdgeNodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfEdgeNodes[i - 1].nodeName = a[3][i].Nodename;
                                    editUserModel.listOfEdgeNodes[i - 1].hostName = a[3][i].Hostname;
                                    editUserModel.listOfEdgeNodes[i - 1].privateIP = a[3][i].PrivateIP;
                                    editUserModel.listOfEdgeNodes[i - 1].publicIP = a[3][i].PublicIP;
                                }
                                console.log("list of listOfEdgeNodes nodes",editUserModel.listOfEdgeNodes)
                            }
                            if (a[4].length > 1) {
                                for (let i = 1; i < a[4].length; i++) {
                                    editUserModel.listOfWorkerNodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfWorkerNodes[i - 1].nodeName = a[4][i].Nodename;
                                    editUserModel.listOfWorkerNodes[i - 1].hostName = a[4][i].Hostname;
                                    editUserModel.listOfWorkerNodes[i - 1].privateIP = a[4][i].PrivateIP;
                                    editUserModel.listOfWorkerNodes[i - 1].publicIP = a[4][i].PublicIP;
                                }
                            }
                            if (a[5].length > 1) {
                                for (let i = 1; i < a[5].length; i++) {
                                    editUserModel.listOfControllerNodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfControllerNodes[i - 1].nodeName = a[5][i].Nodename;
                                    editUserModel.listOfControllerNodes[i - 1].hostName = a[5][i].Hostname;
                                    editUserModel.listOfControllerNodes[i - 1].privateIP = a[5][i].PrivateIP;
                                    editUserModel.listOfControllerNodes[i - 1].publicIP = a[5][i].PublicIP;
                                }
                            }
                            if (a[6].length > 1) {
                                for (let i = 1; i < a[6].length; i++) {
                                    editUserModel.listOfDeployerNodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfDeployerNodes[i - 1].nodeName = a[6][i].Nodename;
                                    editUserModel.listOfDeployerNodes[i - 1].hostName = a[6][i].Hostname;
                                    editUserModel.listOfDeployerNodes[i - 1].privateIP = a[6][i].PrivateIP;
                                    editUserModel.listOfDeployerNodes[i - 1].publicIP = a[6][i].PublicIP;
                                }
                            }
                            if (a[7].length > 1) {
                                for (let i = 1; i < a[7].length; i++) {
                                    editUserModel.listOfStorageNodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfStorageNodes[i - 1].nodeName = a[7][i].Nodename;
                                    editUserModel.listOfStorageNodes[i - 1].hostName = a[7][i].Hostname;
                                    editUserModel.listOfStorageNodes[i - 1].privateIP = a[7][i].PrivateIP;
                                    editUserModel.listOfStorageNodes[i - 1].publicIP = a[7][i].PublicIP;
                                }
                            }
                        }
                        else {
                            editUserModel.NonCSFPnameText = a[1][0].Application_Name;
                            editUserModel.NonCSFPapplicationNameSpace = a[1][0].Application_Name_Space;
                            // editUserModel.NonCSFPPortalUserName = a[2][0].PortalNode_Username;
                            // editUserModel.NonCSFPPortalPassword = a[2][0].PortalNode_Password;
                            editUserModel.NonCSFPDatabaseUserName = a[3][0].DatabaseNode_Username;
                            editUserModel.NonCSFPDatabasePassword = a[3][0].DatabaseNode_Password;
                            editUserModel.NonCSFPDeployerUserName = a[5][0].DeployerNode_Username;
                            editUserModel.NonCSFPDeployerPassword = a[5][0].DeployerNode_Password;
                            editUserModel.NonCSFPProcessingUserName = a[4][0].ProcessingNode_UserName;
                            editUserModel.NonCSFPProcessingPassword = a[4][0].ProcessingNode_Password;

                           editUserModel.NonCSFPmandatoryPortalnodes.portalUserName = a[2][0].PortalNode_Username; editUserModel.NonCSFPmandatoryPortalnodes.portalPassword = a[2][0].PortalNode_Password; editUserModel.NonCSFPmandatoryPortalnodes.portalName = a[2][0].PortalName; editUserModel.NonCSFPmandatoryPortalnodes.portalURL = a[2][0].PortalURL; editUserModel.NonCSFPmandatoryPortalnodes.hostName = a[2][0].Hostname; editUserModel.NonCSFPmandatoryPortalnodes.privateIP = a[2][0].PrivateIP; editUserModel.NonCSFPmandatoryPortalnodes.publicIP = a[2][0].PublicIP;
                            editUserModel.NonCSFPmandatoryDatabaseNodes.nodeName = a[3][0].Nodename; editUserModel.NonCSFPmandatoryDatabaseNodes.hostName = a[3][0].Hostname; editUserModel.NonCSFPmandatoryDatabaseNodes.privateIP = a[3][0].PrivateIP; editUserModel.NonCSFPmandatoryDatabaseNodes.publicIP = a[3][0].PublicIP;
                            editUserModel.NonCSFPmandatoryProcessNodes.nodeName = a[4][0].Nodename; editUserModel.NonCSFPmandatoryProcessNodes.hostName = a[4][0].Hostname; editUserModel.NonCSFPmandatoryProcessNodes.privateIP = a[4][0].PrivateIP; editUserModel.NonCSFPmandatoryProcessNodes.publicIP = a[4][0].PublicIP;
                            editUserModel.NonCSFPmandatoryDeployerNodes.nodeName = a[5][0].Nodename; editUserModel.NonCSFPmandatoryDeployerNodes.hostName = a[5][0].Hostname; editUserModel.NonCSFPmandatoryDeployerNodes.privateIP = a[5][0].PrivateIP; editUserModel.NonCSFPmandatoryDeployerNodes.publicIP = a[5][0].PublicIP;

                            if (a[2].length > 1) {
                                for (let i = 1; i < a[2].length; i++) {
                                    editUserModel.listOfNonCSFPportalNodes[i - 1] = { portalUsername:"",portalPassword:"",portalName: "", portalURL: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfNonCSFPportalNodes[i - 1].portalUsername = a[2][i].PortalNode_Username;
                                    editUserModel.listOfNonCSFPportalNodes[i - 1].portalPassword = a[2][i].PortalNode_Password;
                                    editUserModel.listOfNonCSFPportalNodes[i - 1].portalName = a[2][i].PortalName;
                                    editUserModel.listOfNonCSFPportalNodes[i - 1].portalURL = a[2][i].PortalURL;
                                    editUserModel.listOfNonCSFPportalNodes[i - 1].hostName = a[2][i].Hostname;
                                    editUserModel.listOfNonCSFPportalNodes[i - 1].privateIP = a[2][i].PrivateIP;
                                    editUserModel.listOfNonCSFPportalNodes[i - 1].publicIP = a[2][i].PublicIP;
                                }
                            }
                            if (a[3].length > 1) {
                                for (let i = 1; i < a[3].length; i++) {
                                    editUserModel.listofNonCSFPdatabasenodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listofNonCSFPdatabasenodes[i - 1].nodeName = a[3][i].Nodename;
                                    editUserModel.listofNonCSFPdatabasenodes[i - 1].hostName = a[3][i].Hostname;
                                    editUserModel.listofNonCSFPdatabasenodes[i - 1].privateIP = a[3][i].PrivateIP;
                                    editUserModel.listofNonCSFPdatabasenodes[i - 1].publicIP = a[3][i].PublicIP;
                                }
                            }
                            if (a[4].length > 1) {
                                for (let i = 1; i < a[4].length; i++) {
                                    editUserModel.listOfNonCSFPprocessingNodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfNonCSFPprocessingNodes[i - 1].nodeName = a[4][i].Nodename;
                                    editUserModel.listOfNonCSFPprocessingNodes[i - 1].hostName = a[4][i].Hostname;
                                    editUserModel.listOfNonCSFPprocessingNodes[i - 1].privateIP = a[4][i].PrivateIP;
                                    editUserModel.listOfNonCSFPprocessingNodes[i - 1].publicIP = a[4][i].PublicIP;
                                }
                            }
                            if (a[5].length > 1) {
                                for (let i = 1; i < a[5].length; i++) {
                                    editUserModel.listOfNonCSFPDeployerNodes[i - 1] = { nodeName: "", hostName: "", privateIP: "", publicIP: "" };
                                    editUserModel.listOfNonCSFPDeployerNodes[i - 1].nodeName = a[5][i].Nodename;
                                    editUserModel.listOfNonCSFPDeployerNodes[i - 1].hostName = a[5][i].Hostname;
                                    editUserModel.listOfNonCSFPDeployerNodes[i - 1].privateIP = a[5][i].PrivateIP;
                                    editUserModel.listOfNonCSFPDeployerNodes[i - 1].publicIP = a[5][i].PublicIP;
                                }
                            }

                        }
                    }
                    catch (e) {
                        // formErrors.uploadTempError = 'please upload correct file';
                        // validation.errors.push(formErrors.uploadTempError);
                        // formErrors.uploadTempError = "Please upload correct file, CSFP_Template.xlsx for CSFP and NonCSFP_Template.xlsx for NonCSFP"    
                        // validation.errors.push(formErrors.uploadTempError);
            //             formErrors.uploadTempError = "Please upload correct file, CSFP_Template.xlsx for CSFP and NonCSFP_Template.xlsx for NonCSFP"    
            // validation.errors.push(formErrors.uploadTempError);
                    }
                    console.log(editUserModel);

                    // console.log("trial1",workbook1)
                    // }
                    //        }


                };
                reader.readAsBinaryString(editUserModel.uploadDataFile[0].file);
            }
        }}
      
        this.forceUpdate();

        return validation;
    };

    okResponse(e) {
        console.log("e", e)
    }
    onDownloadTemplate() {
        //     axios.get('/getdownload', { responseType: 'arraybuffer' })
        // .then((response) => {
        //   var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //   fileSaver.saveAs(blob, 'sample.xlsx');
        // });


        // axios('http://127.0.0.1:8081/getdownload',{
        //     method: 'post',
        //     responseType: 'arraybuffer'
        // }).then(response => {
        //     var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //   fileSaver.saveAs(blob, 'sample.xlsx');
        //    // this.setState({ applicationNames: response.data })
        // }),

        // axios('http://127.0.0.1:8081/getdownload',{
        //         method: 'get',
        //         responseType: 'arraybuffer'
        //     }).then(response => {
        //         var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //       fileSaver.saveAs(blob, 'sample.xlsx');
        //        // this.setState({ applicationNames: response.data })
        //     })

        //   axios.get('http://127.0.0.1:8081/getdownload',{
        //   headers: {'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
        //    responseType: "arraybuffer"}         
        //   )
        //     .then((response) => {
        //       var blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        //       fileSaver.saveAs(blob, 'sap.xlsx');
        //     const url = window.URL.createObjectURL(new Blob([response.data]));
        //    const link = document.createElement('a');
        //    link.href = url;
        //    link.setAttribute('download', 'sample.xlsx'); //or any other extension
        //    document.body.appendChild(link);
        //    link.click();
        //   });




        // axios('http://127.0.0.1:8081/getdownload', {
        //     method: 'get',
        //     headers: { 'Content-Type': 'application/vnd.ms-excel', 'Content-Disposition': "attachment;filename=sap.xls",
        //     responseType: 'arraybuffer'}
        //    // responseType: 'arraybuffer',

        // }).then(response => {
        //     fileDownload(response.data,'sap.xlsx' )
        // })
        //   let  filename='sample.xlsx';
        //     axios.get('http://127.0.0.1:8081/getdownload', {
        //         responseType: 'blob',
        //       }).then(res => {
        //         fileDownload(res.data, filename);
        //       });


    }
    render() {
        const { uploadTempError } = formErrors;
        let onefile = true;

        return (
            <div style={{ padding: "20px" }}>
                <div>
                    <div style={{ marginBottom: "30px", position: "absolute" }}>
                        <p style={{ fontSize: "14px", fontWeight: "light", color: 'grey' }}>Download Template
                                        </p>

                        <p style={{ fontSize: "12px", color: 'grey', display: "flex", flex: "1" }}> <span style={{ marginRight: "8px" }}>{ALARM_ICON}</span> If you have already downloaded template, after uploading .xlsx file click on continue</p>

                        <div style={{ border: "1px solid grey", width: "520px", padding: "15px", margin: "15px" }}>
                            {/* <Button id="downloadtemplate" text="DW" disableRipple={"true"} icon={ic_admin_down} iconColor="#124191" onClick={this.onDownloadTemplate} style={{ borderRadius: "55px", width: "0px", height: "25px", fontSize: "0px" }} /> */}
                            {editUserModel.applicationType === "CSFP" ? <a href={CSFP_Template} icon={ic_admin_down} download="CSFP_Template">
                                <Button id="downloadtemplate" text="DW" disableRipple={"true"} icon={ic_admin_down} iconColor="#124191" onClick={this.onDownloadTemplate} style={{ borderRadius: "55px", width: "0px", height: "25px", fontSize: "0px" }} />
                            </a> :
                                <a href={NonCSFP_Template} icon={ic_admin_down} download="NonCSFP_Template">
                                    <Button id="downloadtemplate" text="DW" disableRipple={"true"} icon={ic_admin_down} iconColor="#124191" onClick={this.onDownloadTemplate} style={{ borderRadius: "55px", width: "0px", height: "25px", fontSize: "0px" }} />
                                </a>

                            }
                            <span style={{ color: 'grey', position: 'absolute', marginLeft: "10px", fontSize: "small", marginTop: "3px" }}>Step1: Download Template</span>
                        </div>


                        <div style={{ border: "1px solid grey", width: "520px", height: "200px", padding: "15px", margin: "15px" }}>
                            <Button id="uploadtemplate" text="UP" disableRipple={"true"} icon={ic_admin_up} iconColor="#124191" onClick={this.uploadTemplate} style={{ borderRadius: "55px", width: "0px", height: "25px", fontSize: "0px" }} />
                            <span style={{ color: 'grey', position: 'absolute', marginLeft: "10px", marginBottom: "30px", fontSize: "small", marginTop: "3px" }}>Step2: Upload Complete Template</span>
                            <div style={{ paddingLeft: "20px", paddingRight: "20px" }}>

                                <FileUploader
                                    data={this.state.dataofFile}
                                    //   {...this.state.fileUploadProps}

                                    denyMultipleFileDrop={onefile}
                                    dropZoneNameColumnHeader=""
                                    dropZoneDateColumnHeader=""
                                    onFileSelect={(data) => {
                                        // this.setState({fileuploadedorNot:data.value[0].filename})
                                        this.onFileSelectCallback(data.value);
                                        console.log("file data", data);

                                    }}
                                  
                                    fileDeleteResponse={(event) => {
                                        this.onFileDeleteCallback(event.value);
                                    }}
                                    fileDeleteErrorResponse={(eventObj) => {
                                        this.onFileDeleteErrorCallback(eventObj.value.filename, eventObj.value.status);
                                    }}
                                    fileCancelResponse={(event) => {
                                        this.onFileCancelCallback(event.value);
                                    }}
                                    fileRetryResponse={(event) => {
                                        this.onFileRetryCallback(event.value);
                                    }}
                                    fileAbortResponse={(event) => {
                                        this.onFileAbortCallback(event.value);
                                    }}
                                    fileTypes='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
                                    allowOnlyOneFileInUploader={onefile}
                                    sortOrder={{
                                        alphabetical: 'Alphabetical',
                                        uploadDate: 'UploadDate',

                                    }}
                                    onErrorRetry={true}
                                />
                          {uploadTempError? <div style={{color:"red",fontSize:"10px",fontWeight:"bold",marginRight:"36px",textAlign:"center"}}>{uploadTempError}</div>:null}

                            </div>
                        </div>



                    </div>
                </div>

            </div>
        );
    }
}

class OnboardForm3 extends React.Component {
    static propTypes = {
        onValidate: PropTypes.func,
        onBack: PropTypes.func,
        handler: PropTypes.func
    };

    static defaultProps = {
        onValidate: _.noop,
        onBack: _.noop,
        handler: _.noop
    };
    constructor(props) {
        super(props);
        //   appName=appName+" "+"|"+" "+editUserModel.applicationType;
        this.removePortalNodeClick = this.removePortalNodeClick.bind(this);
        this.removeEdgeNodeClick = this.removeEdgeNodeClick.bind(this);
        this.removeDeployerNodeClick = this.removeDeployerNodeClick.bind(this);
        this.removeWorkerNodeClick = this.removeWorkerNodeClick.bind(this);
        this.removeControllerNodeClick = this.removeControllerNodeClick.bind(this);
        this.removeNonCSFPportalNodeClick = this.removeNonCSFPportalNodeClick.bind(this);
        this.removeNonCSFPDatabaseNodeClick = this.removeNonCSFPDatabaseNodeClick.bind(this);
        this.removeNonCSFPProcessingNodeClick = this.removeNonCSFPProcessingNodeClick.bind(this);
        this.removeNonCSFPDeployerNodeClick = this.removeNonCSFPDeployerNodeClick.bind(this);
        this.state = {
            //  text3Box: editUserModel.text3,
            CSFPname: editUserModel.CSFPnameText,
            CSFPapplicationNameSpace: editUserModel.CSFPapplicationNameSpace,
            NonCSFPname: editUserModel.NonCSFPnameText,
            NonCSFPapplicationNameSpace: editUserModel.NonCSFPapplicationNameSpace,
            showStorageNode: false,
            listOfPortalNodes: editUserModel.listOfPortalNodes,
            listOfEdgeNodes: editUserModel.listOfEdgeNodes,
            listOfWorkerNodes: editUserModel.listOfWorkerNodes,
            listOfDeployerNodes: editUserModel.listOfDeployerNodes,
            listOfControllerNodes: editUserModel.listOfControllerNodes,
            listOfStorageNodes: editUserModel.listOfStorageNodes,
            listOfNonCSFPportalNodes: editUserModel.listOfNonCSFPportalNodes,
            listofNonCSFPdatabasenodes: editUserModel.listofNonCSFPdatabasenodes,
            listOfNonCSFPprocessingNodes: editUserModel.listOfNonCSFPprocessingNodes,
            listOfNonCSFPDeployerNodes: editUserModel.listOfNonCSFPDeployerNodes,
            edgeNodeUserName: editUserModel.edgeNodeUserName,
            workerNodeUserName: editUserModel.workerNodeUserName,
            edgeNodePassword: editUserModel.edgeNodePassword,
            workerNodePassword: editUserModel.workerNodePassword,
            controllerUserName: editUserModel.controllerUserName,
            controllerPassword: editUserModel.controllerPassword,
            deployerNodeUserName: editUserModel.deployerNodeUserName,
            deployerNodePassword: editUserModel.deployerNodePassword,
            storageNodeUserName: editUserModel.storageNodeUserName,
            storageNodePassword: editUserModel.storageNodePassword,
            // NonCSFPPortalUserName: editUserModel.NonCSFPPortalUserName,
            // NonCSFPPortalPassword: editUserModel.NonCSFPPortalPassword,
            NonCSFPDatabaseUserName: editUserModel.NonCSFPDatabaseUserName,
            NonCSFPDatabasePassword: editUserModel.NonCSFPDatabasePassword,
            NonCSFPProcessingUserName: editUserModel.NonCSFPProcessingUserName,
            NonCSFPProcessingPassword: editUserModel.NonCSFPProcessingPassword,
            NonCSFPDeployerUserName: editUserModel.NonCSFPDeployerUserName,
            NonCSFPDeployerPassword: editUserModel.NonCSFPDeployerPassword,
            mandatoryPortaldetails: editUserModel.CSFPmandtryPortalnodes,
            mandatoryEdgeNodedetails: editUserModel.CSFPmandatoryEdgeNodes,
            mandatoryDeployerNodedetails: editUserModel.CSFPmandatoryDeployerNodes,
            mandatoryWorkerNodedetails: editUserModel.CSFPmandatoryWorkerNodes,
            mandatoryControllerNodedetails: editUserModel.CSFPmandatoryControllerNodes,
            mandatoryStorageNodedetails: editUserModel.CSFPmandatoryStorageNodes,
            mandatoryNonCSFPPortaldetails: editUserModel.NonCSFPmandatoryPortalnodes,
            mandatoryNonCSFPdatabaseNodedetails: editUserModel.NonCSFPmandatoryDatabaseNodes,
            mandatoryNonCSFPprocessingNodedetails: editUserModel.NonCSFPmandatoryProcessNodes,
            mandatoryNonCSFPDeployerNodedetails: editUserModel.NonCSFPmandatoryDeployerNodes,
            validateflag: editUserModel.validationflagcolor




        };
        console.log("state", this.state);
        console.log("state of storage tab", this.state.showStorageNode)
    }


    componentDidMount() {
        console.log("onload", editUserModel);
        if (this.props.onValidate) {
            this.props.onValidate(this.validate);
        }

        if (this.props.onBack) {
            this.props.onBack(this.back);
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.onValidate) {
            nextProps.onValidate(this.validate);
        }
    }

    back = () => {
        // Back button was pressed
    };

    // validate=()=>{
    //     this.validateallfields();
    // }    

    validate = () => {
        const validation = {
            errors: [],
            warnings: []
        };
        if (editUserModel.applicationType === "CSFP") {
            editUserModel.CSFPnameText = (this.state.CSFPname) ? this.state.CSFPname.trim() : '';

            formErrors.CSFPnameError = '';
            formErrors.CSFPapplicationNameSpaceError = '';

            formErrors.CSFPPortalUserNameError = '';
            formErrors.CSFPPortalPasswordError = '';
            formErrors.CSFPmandatoryPortalNameError = '';
            formErrors.CSFPmandatoryPortalNodePortalURLError = '';
            formErrors.CSFPmandatoryPortalNodeHostNameError = '';
            formErrors.CSFPmandatoryPortalNodePrivateIPError = '';
            formErrors.CSFPmandatoryPortalNodePublicIPError = '';

            formErrors.EdgeNodeNodeNameError = '';
            formErrors.EdgeNodeHostnameError = '';
            formErrors.EdgeNodePrivateIPError = '';
            formErrors.EdgeNodePublicIPError = '';
            formErrors.EdgeNodeUserNameError = '';
            formErrors.EdgeNodePasswordError = '';

            formErrors.WorkerNodeNodeNameError = '';
            formErrors.WorkerNodeHostnameError = '';
            formErrors.WorkerNodePrivateIPError = '';
            formErrors.WorkerNodePublicIPError = '';
            formErrors.WorkerNodeUserNameError = '';
            formErrors.WorkerNodePasswordError = '';

            formErrors.ControllerNodeNodeNameError = '';
            formErrors.ControllerNodeHostnameError = '';
            formErrors.ControllerNodePrivateIPError = '';
            formErrors.ControllerNodePublicIPError = '';
            formErrors.ControllerNodeUserNameError = '';
            formErrors.ControllerNodePasswordError = '';

            formErrors.StorageNodeNodeNameError = '';
            formErrors.StorageNodeHostnameError = '';
            formErrors.StorageNodePrivateIPError = '';
            formErrors.StorageNodePublicIPError = '';
            formErrors.StorageNodeUserNameError = '';
            formErrors.StorageNodePasswordError = '';

            formErrors.DeployerNodeNodeNameError = '';
            formErrors.DeployerNodeHostnameError = '';
            formErrors.DeployerNodePrivateIPError = '';
            formErrors.DeployerNodePublicIPError = '';
            formErrors.DeployerNodeUserNameError = '';
            formErrors.DeployerNodePasswordError = '';

            formErrors.listOfPortalNodesPortalUserNameError = [];
            formErrors.listOfPortalNodesPortalPasswordError = [];
            formErrors.listOfPortalNodesPortalNameError = [];
            formErrors.listOfPortalNodesPortalURLError = [];
            // formErrors.listOfPortalNodesHostNameError='';
            formErrors.listOfPortalNodesPrivateIPError = [];
            formErrors.listOfPortalNodesPublicIPError = [];

            formErrors.listOfWorkerNodesPrivateIPError = [];
            formErrors.listOfWorkerNodesPublicIPError = [];

            formErrors.listOfControllerNodesPrivateIPError = [];
            formErrors.listOfControllerNodesPublicIPError = [];

            formErrors.listOfStorageNodesPrivateIPError = [];
            formErrors.listOfStorageNodesPublicIPError = [];

            formErrors.listOfDeployerNodesPrivateIPError = [];
            formErrors.listOfDeployerNodesPublicIPError = [];

            formErrors.listOfEdgeNodesPrivateIPError = [];
            formErrors.listOfEdgeNodesPublicIPError = [];




            editUserModel.CSFPapplicationNameSpace = (this.state.CSFPapplicationNameSpace) ? this.state.CSFPapplicationNameSpace.trim() : '';

            // editUserModel.PortalUserName = (this.state.PortalUserName) ? this.state.PortalUserName.trim() : '';
            // editUserModel.PortalPassword = (this.state.PortalPassword) ? this.state.PortalPassword : '';
            editUserModel.CSFPmandtryPortalnodes.portalUserName = (this.state.mandatoryPortaldetails.portalUserName) ? this.state.mandatoryPortaldetails.portalUserName.trim() : '';
            editUserModel.CSFPmandtryPortalnodes.portalPassword = (this.state.mandatoryPortaldetails.portalPassword) ? this.state.mandatoryPortaldetails.portalPassword : '';
            editUserModel.CSFPmandtryPortalnodes.portalName = (this.state.mandatoryPortaldetails.portalName) ? this.state.mandatoryPortaldetails.portalName.trim() : '';
            editUserModel.CSFPmandtryPortalnodes.portalURL = (this.state.mandatoryPortaldetails.portalURL) ? this.state.mandatoryPortaldetails.portalURL.trim() : "";
            editUserModel.CSFPmandtryPortalnodes.hostName = (this.state.mandatoryPortaldetails.hostName) ? this.state.mandatoryPortaldetails.hostName.trim() : '';
            editUserModel.CSFPmandtryPortalnodes.publicIP = (this.state.mandatoryPortaldetails.publicIP) ? this.state.mandatoryPortaldetails.publicIP.trim() : '';
            editUserModel.CSFPmandtryPortalnodes.privateIP = (this.state.mandatoryPortaldetails.privateIP) ? this.state.mandatoryPortaldetails.privateIP.trim() : '';

            editUserModel.edgeNodeUserName = (this.state.edgeNodeUserName) ? this.state.edgeNodeUserName.trim() : '';
            editUserModel.edgeNodePassword = (this.state.edgeNodePassword) ? this.state.edgeNodePassword : '';

            editUserModel.CSFPmandatoryEdgeNodes.nodeName = (this.state.mandatoryEdgeNodedetails.nodeName) ? this.state.mandatoryEdgeNodedetails.nodeName.trim() : '';
            editUserModel.CSFPmandatoryEdgeNodes.hostName = (this.state.mandatoryEdgeNodedetails.hostName) ? this.state.mandatoryEdgeNodedetails.hostName.trim() : '';
            editUserModel.CSFPmandatoryEdgeNodes.privateIP = (this.state.mandatoryEdgeNodedetails.privateIP) ? this.state.mandatoryEdgeNodedetails.privateIP.trim() : '';
            editUserModel.CSFPmandatoryEdgeNodes.publicIP = (this.state.mandatoryEdgeNodedetails.publicIP) ? this.state.mandatoryEdgeNodedetails.publicIP : '';

            editUserModel.CSFPmandatoryDeployerNodes.nodeName = (this.state.mandatoryDeployerNodedetails.nodeName) ? this.state.mandatoryDeployerNodedetails.nodeName.trim() : '';
            editUserModel.CSFPmandatoryDeployerNodes.hostName = (this.state.mandatoryDeployerNodedetails.hostName) ? this.state.mandatoryDeployerNodedetails.hostName.trim() : '';
            editUserModel.CSFPmandatoryDeployerNodes.privateIP = (this.state.mandatoryDeployerNodedetails.privateIP) ? this.state.mandatoryDeployerNodedetails.privateIP.trim() : '';
            editUserModel.CSFPmandatoryDeployerNodes.publicIP = (this.state.mandatoryDeployerNodedetails.publicIP) ? this.state.mandatoryDeployerNodedetails.publicIP.trim() : '';
            editUserModel.deployerNodeUserName = (this.state.deployerNodeUserName) ? this.state.deployerNodeUserName.trim() : '';
            editUserModel.deployerNodePassword = (this.state.deployerNodePassword) ? this.state.deployerNodePassword : '';

            editUserModel.controllerUserName = (this.state.controllerUserName) ? this.state.controllerUserName.trim() : '';
            editUserModel.controllerPassword = (this.state.controllerPassword) ? this.state.controllerPassword.trim() : '';
            editUserModel.CSFPmandatoryControllerNodes.nodeName = (this.state.mandatoryControllerNodedetails.nodeName) ? this.state.mandatoryControllerNodedetails.nodeName.trim() : '';
            editUserModel.CSFPmandatoryControllerNodes.hostName = (this.state.mandatoryControllerNodedetails.hostName) ? this.state.mandatoryControllerNodedetails.hostName.trim() : '';
            editUserModel.CSFPmandatoryControllerNodes.privateIP = (this.state.mandatoryControllerNodedetails.privateIP) ? this.state.mandatoryControllerNodedetails.privateIP.trim() : '';
            editUserModel.CSFPmandatoryControllerNodes.publicIP = (this.state.mandatoryControllerNodedetails.publicIP) ? this.state.mandatoryControllerNodedetails.publicIP.trim() : '';


            editUserModel.workerNodeUserName = (this.state.workerNodeUserName) ? this.state.workerNodeUserName.trim() : '';
            editUserModel.workerNodePassword = (this.state.workerNodePassword) ? this.state.workerNodePassword : '';
            editUserModel.CSFPmandatoryWorkerNodes.nodeName = (this.state.mandatoryWorkerNodedetails.nodeName) ? this.state.mandatoryWorkerNodedetails.nodeName.trim() : '';
            editUserModel.CSFPmandatoryWorkerNodes.hostName = (this.state.mandatoryWorkerNodedetails.hostName) ? this.state.mandatoryWorkerNodedetails.hostName.trim() : '';
            editUserModel.CSFPmandatoryWorkerNodes.privateIP = (this.state.mandatoryWorkerNodedetails.privateIP) ? this.state.mandatoryWorkerNodedetails.privateIP.trim() : '';
            editUserModel.CSFPmandatoryWorkerNodes.publicIP = (this.state.mandatoryWorkerNodedetails.publicIP) ? this.state.mandatoryWorkerNodedetails.publicIP.trim() : '';


            editUserModel.storageNodeUserName = (this.state.storageNodeUserName) ? this.state.storageNodeUserName.trim() : '';
            editUserModel.storageNodePassword = (this.state.storageNodePassword) ? this.state.storageNodePassword : '';
            editUserModel.CSFPmandatoryStorageNodes.nodeName = (this.state.mandatoryStorageNodedetails.nodeName) ? this.state.mandatoryStorageNodedetails.nodeName.trim() : '';
            editUserModel.CSFPmandatoryStorageNodes.hostName = (this.state.mandatoryStorageNodedetails.hostName) ? this.state.mandatoryStorageNodedetails.hostName.trim() : '';
            editUserModel.CSFPmandatoryStorageNodes.privateIP = (this.state.mandatoryStorageNodedetails.privateIP) ? this.state.mandatoryStorageNodedetails.privateIP.trim() : '';
            editUserModel.CSFPmandatoryStorageNodes.publicIP = (this.state.mandatoryStorageNodedetails.publicIP) ? this.state.mandatoryStorageNodedetails.publicIP.trim() : '';

            console.log("edituserModel.CSPmndtrydetails", editUserModel.CSFPmandtryPortalnodes)
            // editUserModel.listOfPortalNodes=this.state.listOfPortalNodes?this.state.listOfPortalNodes:'';
            editUserModel.listOfPortalNodes = this.state.listOfPortalNodes;


            editUserModel.listOfStorageNodes = this.state.listOfStorageNodes ? this.state.listOfStorageNodes : '';
            //  editUserModel.listOfStorageNodes.hostName= (this.state.listOfStorageNodes.hostName)?this.state.listOfStorageNodes.hostName.trim():'';
            //  editUserModel.listOfStorageNodes.publicIP= (this.state.listOfStorageNodes.publicIP)?this.state.listOfStorageNodes.publicIP.trim():'';
            //  editUserModel.listOfStorageNodes.privateIP= (this.state.listOfStorageNodes.privateIP)? this.state.listOfStorageNodes.privateIP.trim():'';

            editUserModel.listOfWorkerNodes = this.state.listOfWorkerNodes ? this.state.listOfWorkerNodes : '';
            //  editUserModel.listOfWorkerNodes.hostName= (this.state.listOfWorkerNodes.hostName)?this.state.listOfWorkerNodes.hostName.trim():'';
            //  editUserModel.listOfWorkerNodes.publicIP= (this.state.listOfWorkerNodes.publicIP)?this.state.listOfWorkerNodes.publicIP.trim():'';
            //  editUserModel.listOfWorkerNodes.privateIP= (this.state.listOfWorkerNodes.privateIP)? this.state.listOfWorkerNodes.privateIP.trim():'';

            editUserModel.listOfControllerNodes = this.state.listOfControllerNodes ? this.state.listOfControllerNodes : '';
            //  editUserModel.listOfControllerNodes.hostName= (this.state.listOfControllerNodes.hostName)?this.state.listOfControllerNodes.hostName.trim():'';
            //  editUserModel.listOfControllerNodes.publicIP= (this.state.listOfControllerNodes.publicIP)?this.state.listOfControllerNodes.publicIP.trim():'';
            //  editUserModel.listOfControllerNodes.privateIP= (this.state.listOfControllerNodes.privateIP)? this.state.listOfControllerNodes.privateIP.trim():'';

            editUserModel.listOfDeployerNodes = this.state.listOfDeployerNodes ? this.state.listOfDeployerNodes : '';
            //  editUserModel.listOfDeployerNodes.hostName= (this.state.listOfDeployerNodes.hostName)?this.state.listOfDeployerNodes.hostName.trim():'';
            //  editUserModel.listOfDeployerNodes.publicIP= (this.state.listOfDeployerNodes.publicIP)?this.state.listOfDeployerNodes.publicIP.trim():'';
            //  editUserModel.listOfDeployerNodes.privateIP= (this.state.listOfDeployerNodes.privateIP)? this.state.listOfDeployerNodes.privateIP.trim():'';

            editUserModel.listOfEdgeNodes = this.state.listOfEdgeNodes ? this.state.listOfEdgeNodes : '';
            //  editUserModel.listOfEdgeNodes.hostName= (this.state.listOfEdgeNodes.hostName)?this.state.listOfEdgeNodes.hostName.trim():'';
            //  editUserModel.listOfEdgeNodes.publicIP= (this.state.listOfEdgeNodes.publicIP)?this.state.listOfEdgeNodes.publicIP.trim():'';
            //  editUserModel.listOfEdgeNodes.privateIP= (this.state.listOfEdgeNodes.privateIP)? this.state.listOfEdgeNodes.privateIP.trim():'';



            if (!editUserModel.CSFPnameText) {
                formErrors.CSFPnameError = 'Name is required';
                validation.errors.push(formErrors.CSFPnameError);
            }
            else if (editUserModel.CSFPnameText && !((editUserModel.CSFPnameText).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.CSFPnameError = 'Name should be alphanumeric';
                validation.errors.push(formErrors.CSFPnameError);
            }


            if (!editUserModel.CSFPapplicationNameSpace) {
                formErrors.CSFPapplicationNameSpaceError = 'Application name space is required';
                validation.errors.push(formErrors.CSFPapplicationNameSpaceError);
            }
            else if (editUserModel.CSFPapplicationNameSpace && !((editUserModel.CSFPapplicationNameSpace).toString().match(/^[- a-zA-Z0-9]+$/))) {
                formErrors.CSFPapplicationNameSpaceError = 'Application name space can have only alphanumeric and - special character';
                validation.errors.push(formErrors.CSFPapplicationNameSpaceError);
            }


            
            // if (!editUserModel.PortalPassword) {
            //     formErrors.CSFPPortalPasswordError = 'Password is required';
            //     validation.errors.push(formErrors.CSFPPortalPasswordError);
            // }
            // else if (editUserModel.PortalPassword.length < 6) {
            //     formErrors.CSFPPortalPasswordError = 'password must contain atleast 6 characters';
            //     validation.errors.push(formErrors.CSFPPortalPasswordError);
            // }
            // else if (editUserModel.PortalPassword.length > 15) {
            //     formErrors.CSFPPortalPasswordError = 'password can not be more than 15 characters';
            //     validation.errors.push(formErrors.CSFPPortalPasswordError);
            // }
            // else if(editUserModel.PortalPassword && !((editUserModel.PortalPassword).match(/^[ $&+,:;=?@#|'<>.^*()%!-a-zA-Z0-9]+$/))){
            //     formErrors.CSFPPortalPasswordError = 'Password should be alphanumeric';
            //     validation.errors.push(formErrors.CSFPPortalPasswordError);
            // }
            if (!editUserModel.CSFPmandtryPortalnodes.portalUserName) {
                formErrors.CSFPPortalUserNameError = 'UserName is required';
                validation.errors.push(formErrors.CSFPPortalUserNameError);
            }
            else if (editUserModel.CSFPmandtryPortalnodes.portalUserName && !((editUserModel.CSFPmandtryPortalnodes.portalUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.CSFPPortalUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.CSFPPortalUserNameError);
            }
            if (!editUserModel.CSFPmandtryPortalnodes.portalPassword) {
                formErrors.CSFPPortalPasswordError = 'Password is required';
                validation.errors.push(formErrors.CSFPPortalPasswordError);
            }
            else if (editUserModel.CSFPmandtryPortalnodes.portalPassword.length < 6) {
                formErrors.CSFPPortalPasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.CSFPPortalPasswordError);
            }
            else if (editUserModel.CSFPmandtryPortalnodes.portalPassword.length > 15) {
                formErrors.CSFPPortalPasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.CSFPPortalPasswordError);
            }
            if (!editUserModel.CSFPmandtryPortalnodes.portalName) {
                formErrors.CSFPmandatoryPortalNameError = 'Portal name is required';
                validation.errors.push(formErrors.CSFPmandatoryPortalNameError);
            }
            else if (editUserModel.CSFPmandtryPortalnodes.portalName && !((editUserModel.CSFPmandtryPortalnodes.portalName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.CSFPmandatoryPortalNameError = 'Portal name should be alphanumeric';
                validation.errors.push(formErrors.CSFPmandatoryPortalNameError);
            }

            if (!editUserModel.CSFPmandtryPortalnodes.portalURL) {
                formErrors.CSFPmandatoryPortalNodePortalURLError = 'Portal URL  is required';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodePortalURLError);
            }
            else if (editUserModel.CSFPmandtryPortalnodes.portalURL && !((editUserModel.CSFPmandtryPortalnodes.portalURL).toString().match(/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/))) {
                formErrors.CSFPmandatoryPortalNodePortalURLError = 'Portal URL is invalid';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodePortalURLError);
            }
            if (!editUserModel.CSFPmandtryPortalnodes.hostName) {
                formErrors.CSFPmandatoryPortalNodeHostNameError = 'Host name  is required';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodeHostNameError);
            }
            // else if(editUserModel.CSFPmandtryPortalnodes.hostName  && !((editUserModel.CSFPmandtryPortalnodes.hostName ).match(/^[ $&+,:;=?@#|'<>.^*()%!-a-zA-Z0-9]+$/))){
            //     formErrors.CSFPmandatoryPortalNodeHostNameError = 'Host name should be alphanumeric';
            //     validation.errors.push(formErrors.CSFPmandatoryPortalNodeHostNameError);
            // }
            if (!editUserModel.CSFPmandtryPortalnodes.privateIP) {
                formErrors.CSFPmandatoryPortalNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodePrivateIPError);
            }
            else if (editUserModel.CSFPmandtryPortalnodes.privateIP && !((editUserModel.CSFPmandtryPortalnodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.CSFPmandatoryPortalNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodePrivateIPError);
            }
            if (!editUserModel.CSFPmandtryPortalnodes.publicIP) {
                formErrors.CSFPmandatoryPortalNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodePublicIPError);
            }
            else if (editUserModel.CSFPmandtryPortalnodes.publicIP && !((editUserModel.CSFPmandtryPortalnodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.CSFPmandatoryPortalNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodePublicIPError);
            }
            //Edge Node Errormessages

            if (!editUserModel.edgeNodeUserName) {
                formErrors.EdgeNodeUserNameError = 'UserName is required';
                validation.errors.push(formErrors.EdgeNodeUserNameError);
            }
            else if (editUserModel.edgeNodeUserName && !((editUserModel.edgeNodeUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.EdgeNodeUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.EdgeNodeUserNameError);
            }
            if (!editUserModel.edgeNodePassword) {
                formErrors.EdgeNodePasswordError = 'Password is required';
                validation.errors.push(formErrors.EdgeNodePasswordError);
            }
            else if (editUserModel.edgeNodePassword.length < 6) {
                formErrors.EdgeNodePasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.EdgeNodePasswordError);
            }
            else if (editUserModel.edgeNodePassword.length > 15) {
                formErrors.EdgeNodePasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.EdgeNodePasswordError);
            }
            if (!editUserModel.CSFPmandatoryEdgeNodes.nodeName) {
                formErrors.EdgeNodeNodeNameError = 'Node name  is required';
                validation.errors.push(formErrors.EdgeNodeNodeNameError);
            }
            if (!editUserModel.CSFPmandatoryEdgeNodes.hostName) {
                formErrors.EdgeNodeHostnameError = 'Host name  is required';
                validation.errors.push(formErrors.EdgeNodeHostnameError);
            }
            if (!editUserModel.CSFPmandatoryEdgeNodes.privateIP) {
                formErrors.EdgeNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.EdgeNodePrivateIPError);
            }
            else if (editUserModel.CSFPmandatoryEdgeNodes.privateIP && !((editUserModel.CSFPmandatoryEdgeNodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.EdgeNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.EdgeNodePrivateIPError);
            }
            if (!editUserModel.CSFPmandatoryEdgeNodes.publicIP) {
                formErrors.EdgeNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.EdgeNodePublicIPError);
            }
            else if (editUserModel.CSFPmandatoryEdgeNodes.publicIP && !((editUserModel.CSFPmandatoryEdgeNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.EdgeNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.EdgeNodePublicIPError);
            }
            // deployer node

            if (!editUserModel.CSFPmandatoryDeployerNodes.nodeName) {
                formErrors.DeployerNodeNodeNameError = 'Node name is required';
                validation.errors.push(formErrors.DeployerNodeNodeNameError);
            }
            if (!editUserModel.CSFPmandatoryDeployerNodes.hostName) {
                formErrors.DeployerNodeHostnameError = 'Host name is required';
                validation.errors.push(formErrors.DeployerNodeHostnameError);
            }
            if (!editUserModel.CSFPmandatoryDeployerNodes.privateIP) {
                formErrors.DeployerNodePrivateIPError = 'Private IP is required';
                validation.errors.push(formErrors.DeployerNodePrivateIPError);
            }
            else if (editUserModel.CSFPmandatoryDeployerNodes.privateIP && !((editUserModel.CSFPmandatoryDeployerNodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.DeployerNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.DeployerNodePrivateIPError);
            }

            if (!editUserModel.CSFPmandatoryDeployerNodes.publicIP) {
                formErrors.DeployerNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.DeployerNodePublicIPError);
            }
            else if (editUserModel.CSFPmandatoryDeployerNodes.publicIP && !((editUserModel.CSFPmandatoryDeployerNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.DeployerNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.DeployerNodePublicIPError);
            }


            if (!editUserModel.deployerNodeUserName) {
                formErrors.DeployerNodeUserNameError = 'User name  is required';
                validation.errors.push(formErrors.DeployerNodeUserNameError);
            }
            else if (editUserModel.deployerNodeUserName && !((editUserModel.deployerNodeUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.DeployerNodeUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.DeployerNodeUserNameError);
            }
            if (!editUserModel.deployerNodePassword) {
                formErrors.DeployerNodePasswordError = 'Password is required';
                validation.errors.push(formErrors.DeployerNodePasswordError);
            }
            else if (editUserModel.deployerNodePassword.length < 6) {
                formErrors.DeployerNodePasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.DeployerNodePasswordError);
            }
            else if (editUserModel.deployerNodePassword.length > 15) {
                formErrors.DeployerNodePasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.DeployerNodePasswordError);
            }
            // worker node

            if (!editUserModel.workerNodeUserName) {
                formErrors.WorkerNodeUserNameError = 'UserName is required';
                validation.errors.push(formErrors.WorkerNodeUserNameError);
            }
            else if (editUserModel.workerNodeUserName && !((editUserModel.workerNodeUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.WorkerNodeUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.WorkerNodeUserNameError);
            }
            if (!editUserModel.workerNodePassword) {
                formErrors.WorkerNodePasswordError = 'Password is required';
                validation.errors.push(formErrors.WorkerNodePasswordError);
            }
            else if (editUserModel.workerNodePassword.length < 6) {
                formErrors.WorkerNodePasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.WorkerNodePasswordError);
            }
            else if (editUserModel.workerNodePassword.length > 15) {
                formErrors.WorkerNodePasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.WorkerNodePasswordError);
            }
            if (!editUserModel.CSFPmandatoryWorkerNodes.nodeName) {
                formErrors.WorkerNodeNodeNameError = 'Node name  is required';
                validation.errors.push(formErrors.WorkerNodeNodeNameError);
            }

            if (!editUserModel.CSFPmandatoryWorkerNodes.hostName) {
                formErrors.WorkerNodeHostnameError = 'Host name  is required';
                validation.errors.push(formErrors.WorkerNodeHostnameError);
            }
            if (!editUserModel.CSFPmandatoryWorkerNodes.privateIP) {
                formErrors.WorkerNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.WorkerNodePrivateIPError);
            }
            else if (editUserModel.CSFPmandatoryWorkerNodes.privateIP && !((editUserModel.CSFPmandatoryWorkerNodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.WorkerNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.WorkerNodePrivateIPError);
            }
            if (!editUserModel.CSFPmandatoryWorkerNodes.publicIP) {
                formErrors.WorkerNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.WorkerNodePublicIPError);
            }
            else if (editUserModel.CSFPmandatoryWorkerNodes.publicIP && !((editUserModel.CSFPmandatoryWorkerNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.WorkerNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.WorkerNodePublicIPError);
            }


            // Controller node

            if (!editUserModel.controllerUserName) {
                formErrors.ControllerNodeUserNameError = 'UserName is required';
                validation.errors.push(formErrors.ControllerNodeUserNameError);
            }
            else if (editUserModel.controllerUserName && !((editUserModel.controllerUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.ControllerNodeUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.ControllerNodeUserNameError);
            }
            if (!editUserModel.controllerPassword) {
                formErrors.ControllerNodePasswordError = 'Password is required';
                validation.errors.push(formErrors.ControllerNodePasswordError);
            }
            else if (editUserModel.controllerPassword.length < 6) {
                formErrors.ControllerNodePasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.ControllerNodePasswordError);
            }
            else if (editUserModel.controllerPassword.length > 15) {
                formErrors.ControllerNodePasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.ControllerNodePasswordError);
            }
            if (!editUserModel.CSFPmandatoryControllerNodes.nodeName) {
                formErrors.ControllerNodeNodeNameError = 'Node name  is required';
                validation.errors.push(formErrors.ControllerNodeNodeNameError);
            }
            if (!editUserModel.CSFPmandatoryControllerNodes.hostName) {
                formErrors.ControllerNodeHostnameError = 'Host name  is required';
                validation.errors.push(formErrors.ControllerNodeHostnameError);
            }

            if (!editUserModel.CSFPmandatoryControllerNodes.privateIP) {
                formErrors.ControllerNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.ControllerNodePrivateIPError);
            }
            else if (editUserModel.CSFPmandatoryControllerNodes.privateIP && !((editUserModel.CSFPmandatoryControllerNodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.ControllerNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.ControllerNodePrivateIPError);
            }
            if (!editUserModel.CSFPmandatoryControllerNodes.publicIP) {
                formErrors.ControllerNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.ControllerNodePublicIPError);
            }
            else if (editUserModel.CSFPmandatoryControllerNodes.publicIP && !((editUserModel.CSFPmandatoryControllerNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.ControllerNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.ControllerNodePublicIPError);
            }

            // Storage node
            //3 combinations


            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP)
                && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {

                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }

            // if((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName)  && 
            //  !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName)&& 
            //  !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&   !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP)&&
            //  !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) 
            //  && ((!editUserModel.CSFPmandatoryStorageNodes.hostName)&&(!editUserModel.CSFPmandatoryStorageNodes.privateIP)&&(!editUserModel.CSFPmandatoryStorageNodes.publicIP))){

            //         formErrors.StorageNodeHostnameError="Hostname is required";
            //         formErrors.StorageNodePrivateIPError="PrivateIP is required";
            //         formErrors.StorageNodePublicIPError = 'Public IP  is required';
            //         validation.errors.push( formErrors.StorageNodeHostnameError,
            //             formErrors.StorageNodePrivateIPError,formErrors.StorageNodePublicIPError);
            // }

            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }


            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName)
                && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePublicIPError);
            }
            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError);
            }



            //    if(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&  !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
            //    !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName)&& !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
            //    !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&   !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP)&&
            //    !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&  !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName)  && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName)&&(!editUserModel.CSFPmandatoryStorageNodes.hostName)&&(!editUserModel.CSFPmandatoryStorageNodes.privateIP)&&(!editUserModel.CSFPmandatoryStorageNodes.publicIP))){
            //           formErrors.StorageNodeNodeNameError = 'Nodename  is required';
            //           formErrors.StorageNodeHostnameError="Hostname is required";
            //           formErrors.StorageNodePrivateIPError="PrivateIP is required";
            //           formErrors.StorageNodePublicIPError = 'Public IP  is required';
            //           validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
            //               formErrors.StorageNodePrivateIPError,formErrors.StorageNodePublicIPError);
            //   }
            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }

            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {

                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodeUserNameError = "Username is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePublicIPError);
            }


            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";

                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError);
            }
            if ((editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.storageNodeUserName) && (!editUserModel.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodePublicIPError);
            }


            if ((editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.storageNodePassword) && (!editUserModel.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodePrivateIPError);
            }
            if ((editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.storageNodeUserName) && (!editUserModel.storageNodePassword))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeUserNameError,
                    formErrors.StorageNodePasswordError);
            }


            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.storageNodeUserName))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodeUserNameError);
            }
            if ((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.storageNodePassword))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePasswordError = "Password is required";
                validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePasswordError);
            }
            if ((editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.storageNodeUserName))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePasswordError = "Password is required";
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePasswordError);
            }
            // 4 combinations


            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }
            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePublicIPError = "PublicIP is required";
                validation.errors.push(formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePublicIPError);
            }
            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                validation.errors.push(formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError);
            }

            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodePublicIPError);
            }
            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                validation.errors.push(formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodePrivateIPError);
            }


            if ((editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.storageNodeUserName) && (!editUserModel.storageNodePassword))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                validation.errors.push(formErrors.StorageNodeUserNameError,
                    formErrors.StorageNodePasswordError);
            }


            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError);
            }


            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePublicIPError);
            }

            // 2 combinations



            if ((editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }
            if ((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodePasswordError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }

            if ((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }

            if ((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && ((!editUserModel.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodeHostnameError, formErrors.StorageNodePublicIPError);
            }

            if ((editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.storageNodePassword) || (!editUserModel.CSFPmandatoryStorageNodes.nodeName) || (!editUserModel.CSFPmandatoryStorageNodes.hostName) || (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodeHostnameError, formErrors.StorageNodePrivateIPError);
            }

            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }


            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }


            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodeHostnameError, formErrors.StorageNodePublicIPError);
            }


            if ((editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodeHostnameError, formErrors.StorageNodePrivateIPError);
            }

            if ((editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodePrivateIPError = 'Private IP  is required';
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }


            if ((editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodeHostnameError = 'Hostname  is required';
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodeHostnameError, formErrors.StorageNodePublicIPError);
            }
            if ((editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.hostName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodeHostnameError = 'Hostname  is required';
                formErrors.StorageNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodeHostnameError, formErrors.StorageNodePrivateIPError);
            }
            if ((editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodeNodeNameError, formErrors.StorageNodePublicIPError);
            }
            if ((editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.privateIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodeNodeNameError, formErrors.StorageNodePrivateIPError);
            }

            if ((editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.CSFPmandatoryStorageNodes.storageNodeUserName) && (!editUserModel.CSFPmandatoryStorageNodes.storageNodePassword) && (!editUserModel.CSFPmandatoryStorageNodes.nodeName) && (!editUserModel.CSFPmandatoryStorageNodes.hostName))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = "Password is required";
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = 'Hostname  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError,
                    formErrors.StorageNodeNodeNameError, formErrors.StorageNodePrivateIPError);
            }



            //======================

            // 1 combination


            if (editUserModel.storageNodeUserName && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) &&
                !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName)
                && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.storageNodePassword) || (!editUserModel.CSFPmandatoryStorageNodes.nodeName) || (!editUserModel.CSFPmandatoryStorageNodes.hostName) || (!editUserModel.CSFPmandatoryStorageNodes.privateIP) || (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {

                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }




            if (editUserModel.storageNodePassword && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName)
                && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && ((!editUserModel.storageNodeUserName) || (!editUserModel.CSFPmandatoryStorageNodes.nodeName) || (!editUserModel.CSFPmandatoryStorageNodes.hostName) || (!editUserModel.CSFPmandatoryStorageNodes.privateIP) || (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {

                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodeNodeNameError = 'Nodename  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodeNodeNameError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }
            if (editUserModel.CSFPmandatoryStorageNodes.nodeName && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && ((!editUserModel.storageNodeUserName) || (!editUserModel.storageNodePassword) || (!editUserModel.CSFPmandatoryStorageNodes.hostName) || (!editUserModel.CSFPmandatoryStorageNodes.privateIP) || (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {

                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError, formErrors.StorageNodeHostnameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }
            if (editUserModel.CSFPmandatoryStorageNodes.hostName && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && ((!editUserModel.storageNodeUserName) || (!editUserModel.storageNodePassword) || (!editUserModel.CSFPmandatoryStorageNodes.nodeName) || (!editUserModel.CSFPmandatoryStorageNodes.privateIP) || (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodePublicIPError);
            }

            if (editUserModel.CSFPmandatoryStorageNodes.publicIP && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && ((!editUserModel.storageNodeUserName) || (!editUserModel.storageNodePassword) || (!editUserModel.CSFPmandatoryStorageNodes.nodeName) || (!editUserModel.CSFPmandatoryStorageNodes.privateIP) || (!editUserModel.CSFPmandatoryStorageNodes.hostName))) {

                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodePrivateIPError = "PrivateIP is required";
                formErrors.StorageNodeHostnameError = 'Hostname  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodePrivateIPError, formErrors.StorageNodeHostnameError);
            }
            if (editUserModel.CSFPmandatoryStorageNodes.privateIP && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.nodeName) &&
                !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.publicIP) &&
                !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodeUserName && editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.CSFPmandatoryStorageNodes.privateIP && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.CSFPmandatoryStorageNodes.hostName && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.CSFPmandatoryStorageNodes.nodeName && editUserModel.CSFPmandatoryStorageNodes.hostName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.nodeName) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.publicIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.privateIP) && !(editUserModel.storageNodePassword && editUserModel.CSFPmandatoryStorageNodes.hostName) && ((!editUserModel.storageNodeUserName) || (!editUserModel.storageNodePassword) || (!editUserModel.CSFPmandatoryStorageNodes.nodeName) || (!editUserModel.CSFPmandatoryStorageNodes.hostName) || (!editUserModel.CSFPmandatoryStorageNodes.publicIP))) {
                formErrors.StorageNodeUserNameError = 'Username  is required';
                formErrors.StorageNodePasswordError = 'Password  is required';
                formErrors.StorageNodeNodeNameError = "Nodename is required";
                formErrors.StorageNodeHostnameError = "Hostname is required";
                formErrors.StorageNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.StorageNodeUserNameError, formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError,
                    formErrors.StorageNodeHostnameError, formErrors.StorageNodePublicIPError);
            }


            // if(editUserModel.CSFPmandatoryStorageNodes.publicIP && ((!editUserModel.storageNodeUserName)||(!editUserModel.storageNodePassword)||(!editUserModel.CSFPmandatoryStorageNodes.nodeName)||(!editUserModel.CSFPmandatoryStorageNodes.hostName)||(!editUserModel.CSFPmandatoryStorageNodes.privateIP))){
            //     formErrors.StorageNodeUserNameError = 'Username  is required';
            //     formErrors.StorageNodePasswordError = 'Password  is required';
            //     formErrors.StorageNodeNodeNameError="Nodename is required";
            //     formErrors.StorageNodeHostnameError="Hostname is required";
            //     formErrors.StorageNodePrivateIPError = 'Private IP  is required';
            //     validation.errors.push(formErrors.StorageNodeUserNameError,formErrors.StorageNodePasswordError, formErrors.StorageNodeNodeNameError,
            //         formErrors.StorageNodeHostnameError,formErrors.StorageNodePrivateIPError);
            // }


            if (editUserModel.storageNodeUserName && !((editUserModel.storageNodeUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.StorageNodeUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.StorageNodeUserNameError);
            }
            // if (!editUserModel.storageNodePassword) {
            //     formErrors.StorageNodePasswordError = 'Password is required';
            //     validation.errors.push(formErrors.StorageNodePasswordError);
            // }

            if (editUserModel.storageNodePassword.length < 6) {
                formErrors.StorageNodePasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.StorageNodePasswordError);
            }
            else if (editUserModel.storageNodePassword.length > 15) {
                formErrors.StorageNodePasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.StorageNodePasswordError);
            }

            // if(!editUserModel.CSFPmandatoryStorageNodes.hostName){
            //     formErrors.ControllerNodeHostnameError = 'Host name  is required';
            //     validation.errors.push(formErrors.ControllerNodeHostnameError);
            // }
            // if(!editUserModel.CSFPmandatoryStorageNodes.privateIP){
            //     formErrors.ControllerNodePrivateIPError = 'Private IP  is required';
            //     validation.errors.push(formErrors.ControllerNodePrivateIPError);
            // }
            if (editUserModel.CSFPmandatoryStorageNodes.privateIP && !((editUserModel.CSFPmandatoryStorageNodes.privateIP).toString().toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.StorageNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.StorageNodePrivateIPError);
            }
            // if(!editUserModel.CSFPmandatoryStorageNodes.publicIP){
            //     formErrors.StorageNodePublicIPError = 'Public IP  is required';
            //     validation.errors.push(formErrors.StorageNodePublicIPError);
            // }
            if (editUserModel.CSFPmandatoryStorageNodes.publicIP && !((editUserModel.CSFPmandatoryStorageNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.StorageNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.StorageNodePublicIPError);
            }

            if (editUserModel.listOfPortalNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfPortalNodes.length; i++) {
                    
                    if (editUserModel.listOfPortalNodes[i].portalUserName && !((editUserModel.listOfPortalNodes[i].portalUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                        formErrors.listOfPortalNodesPortalUserNameError[i] = 'UserName should be alphanumeric';
                        validation.errors.push(formErrors.listOfPortalNodesPortalUserNameError[i]);
                    }
                    if (editUserModel.listOfPortalNodes[i].portalPassword && editUserModel.listOfPortalNodes[i].portalPassword.length < 6) {
                        formErrors.listOfPortalNodesPortalPasswordError[i] = 'password must contain atleast 6 characters';
                        validation.errors.push(formErrors.listOfPortalNodesPortalPasswordError[i]);
                    }
                    else if (editUserModel.listOfPortalNodes[i].portalPassword && editUserModel.listOfPortalNodes[i].portalPassword.length > 15) {
                        formErrors.listOfPortalNodesPortalPasswordError[i] = 'password can not be more than 15 characters';
                        validation.errors.push(formErrors.listOfPortalNodesPortalPasswordErrori);
                    }
                    if (editUserModel.listOfPortalNodes[i].portalName && !((editUserModel.listOfPortalNodes[i].portalName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                        formErrors.listOfPortalNodesPortalNameError[i] = 'Portal name should be alphanumeric';
                        validation.errors.push(formErrors.listOfPortalNodesPortalNameError[i]);
                    }
                    if (editUserModel.listOfPortalNodes[i].portalURL && !((editUserModel.listOfPortalNodes[i].portalURL).toString().match(/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/))) {
                        formErrors.listOfPortalNodesPortalURLError[i] = 'Portal URL is invalid';
                        validation.errors.push(formErrors.listOfPortalNodesPortalURLError[i]);
                    }

                    if (editUserModel.listOfPortalNodes[i].privateIP && !((editUserModel.listOfPortalNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfPortalNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfPortalNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfPortalNodes[i].publicIP && !((editUserModel.listOfPortalNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfPortalNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfPortalNodesPublicIPError[i]);
                    }
                }
            }
            if (editUserModel.listOfEdgeNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfEdgeNodes.length; i++) {

                    if (editUserModel.listOfEdgeNodes[i].privateIP && !((editUserModel.listOfEdgeNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfEdgeNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfEdgeNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfEdgeNodes[i].publicIP && !((editUserModel.listOfEdgeNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfEdgeNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfEdgeNodesPublicIPError[i]);
                    }
                }
            }
            if (editUserModel.listOfStorageNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfStorageNodes.length; i++) {

                    if (editUserModel.listOfStorageNodes[i].privateIP && !((editUserModel.listOfStorageNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfStorageNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfStorageNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfStorageNodes[i].publicIP && !((editUserModel.listOfStorageNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfStorageNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfStorageNodesPublicIPError[i]);
                    }
                }
            }
            if (editUserModel.listOfWorkerNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfWorkerNodes.length; i++) {
                    if (editUserModel.listOfWorkerNodes[i].privateIP && !((editUserModel.listOfWorkerNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfWorkerNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfWorkerNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfWorkerNodes[i].publicIP && !((editUserModel.listOfWorkerNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfWorkerNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfWorkerNodesPublicIPError[i]);
                    }
                }
            }
            if (editUserModel.listOfControllerNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfControllerNodes.length; i++) {
                    if (editUserModel.listOfControllerNodes[i].privateIP && !((editUserModel.listOfControllerNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfControllerNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfControllerNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfControllerNodes[i].publicIP && !((editUserModel.listOfControllerNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfControllerNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfControllerNodesPublicIPError[i]);
                    }
                }
            }
            if (editUserModel.listOfDeployerNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfDeployerNodes.length; i++) {
                    if (editUserModel.listOfDeployerNodes[i].privateIP && !((editUserModel.listOfDeployerNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfDeployerNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfDeployerNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfDeployerNodes[i].publicIP && !((editUserModel.listOfDeployerNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfDeployerNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfDeployerNodesPublicIPError[i]);
                    }
                }
            }


        }
        else {
            editUserModel.NonCSFPnameText = (this.state.NonCSFPname) ? this.state.NonCSFPname.trim() : '';
            editUserModel.NonCSFPapplicationNameSpace = (this.state.NonCSFPapplicationNameSpace) ? this.state.NonCSFPapplicationNameSpace.trim() : '';

            formErrors.NonCSFPnameError = '';
            formErrors.NonCSFPapplicationNameSpaceError = '';


            formErrors.NonCSFPPortalUserNameError = '';
            formErrors.NonCSFPPortalPasswordError = '';
            formErrors.NonCSFPmandatoryPortalNameError = '';
            formErrors.NonCSFPmandatoryPortalNodePortalURLError = '';
            formErrors.NonCSFPmandatoryPortalNodeHostNameError = '';
            formErrors.NonCSFPmandatoryPortalNodePrivateIPError = '';
            formErrors.NonCSFPmandatoryPortalNodePublicIPError = '';

            formErrors.NonCSFPDatabaseUserNameError = '';
            formErrors.NonCSFPDatabasePasswordError = '';
            formErrors.NonCSFPmandatoryDatabaseNodeNodeNameError = '';
            formErrors.NonCSFPmandatoryDatabaseNodeHostNameError = '';
            formErrors.NonCSFPmandatoryDatabaseNodePrivateIPError = '';
            formErrors.NonCSFPmandatoryDatabaseNodePublicIPError = '';


            formErrors.NonCSFPProcessingUserNameError = '';
            formErrors.NonCSFPProcessingPasswordError = '';
            formErrors.NonCSFPmandatoryProcessingNodeNodeNameError = '';
            formErrors.NonCSFPmandatoryProcessingNodeHostNameError = '';
            formErrors.NonCSFPmandatoryProcessingNodePrivateIPError = '';
            formErrors.NonCSFPmandatoryProcessingNodePublicIPError = '';

            formErrors.NonCSFPDeployerNodeNodeNameError = '';
            formErrors.NonCSFPDeployerNodeHostnameError = '';
            formErrors.NonCSFPDeployerNodePrivateIPError = '';
            formErrors.NonCSFPDeployerNodePublicIPError = '';
            formErrors.NonCSFPDeployerNodeUserNameError = '';
            formErrors.NonCSFPDeployerNodePasswordError = '';
            formErrors.listOfNonCSFPPortalNodesPortalUserNameError = [];
            formErrors.listOfNonCSFPPortalNodesPortalPasswordError = [];
            formErrors.listOfNonCSFPPortalNodesPortalNameError = [];
            formErrors.listOfNonCSFPPortalNodesPortalURLError = [];
            // formErrors.listOfPortalNodesHostNameError='';
            formErrors.listOfNonCSFPPortalNodesPrivateIPError = [];
            formErrors.listOfNonCSFPPortalNodesPublicIPError = [];


            formErrors.listOfNonCSFPDeployerNodesPrivateIPError = [];
            formErrors.listOfNonCSFPDeployerNodesPublicIPError = [];

            formErrors.listOfNonCSFPDatabaseNodesPrivateIPError = [];
            formErrors.listOfNonCSFPDatabaseNodesPublicIPError = [];
            formErrors.listOfNonCSFPProcessingNodesPrivateIPError = [];
            formErrors.listOfNonCSFPProcessingNodesPublicIPError = [];

            editUserModel.listOfNonCSFPportalNodes = this.state.listOfNonCSFPportalNodes;
            editUserModel.listOfNonCSFPprocessingNodes = this.state.listOfNonCSFPprocessingNodes;
            editUserModel.listofNonCSFPdatabasenodes = this.state.listofNonCSFPdatabasenodes;
            editUserModel.listOfNonCSFPDeployerNodes = this.state.listOfNonCSFPDeployerNodes;
            // editUserModel.NonCSFPPortalUserName = (this.state.NonCSFPPortalUserName) ? this.state.NonCSFPPortalUserName.trim() : '';
            // editUserModel.NonCSFPPortalPassword = (this.state.NonCSFPPortalPassword) ? this.state.NonCSFPPortalPassword : '';
            editUserModel.NonCSFPmandatoryPortalnodes.portalUserName = (this.state.mandatoryNonCSFPPortaldetails.portalUserName) ? this.state.mandatoryNonCSFPPortaldetails.portalUserName.trim() : '';
            editUserModel.NonCSFPmandatoryPortalnodes.portalPassword = (this.state.mandatoryNonCSFPPortaldetails.portalPassword) ? this.state.mandatoryNonCSFPPortaldetails.portalPassword : '';
            editUserModel.NonCSFPmandatoryPortalnodes.portalName = (this.state.mandatoryNonCSFPPortaldetails.portalName) ? this.state.mandatoryNonCSFPPortaldetails.portalName.trim() : '';
            editUserModel.NonCSFPmandatoryPortalnodes.portalURL = (this.state.mandatoryNonCSFPPortaldetails.portalURL) ? this.state.mandatoryNonCSFPPortaldetails.portalURL.trim() : "";
            editUserModel.NonCSFPmandatoryPortalnodes.hostName = (this.state.mandatoryNonCSFPPortaldetails.hostName) ? this.state.mandatoryNonCSFPPortaldetails.hostName.trim() : '';
            editUserModel.NonCSFPmandatoryPortalnodes.publicIP = (this.state.mandatoryNonCSFPPortaldetails.publicIP) ? this.state.mandatoryNonCSFPPortaldetails.publicIP.trim() : '';
            editUserModel.NonCSFPmandatoryPortalnodes.privateIP = (this.state.mandatoryNonCSFPPortaldetails.privateIP) ? this.state.mandatoryNonCSFPPortaldetails.privateIP.trim() : '';


            editUserModel.NonCSFPDatabaseUserName = (this.state.NonCSFPDatabaseUserName) ? this.state.NonCSFPDatabaseUserName.trim() : '';
            editUserModel.NonCSFPDatabasePassword = (this.state.NonCSFPDatabasePassword) ? this.state.NonCSFPDatabasePassword : '';
            editUserModel.NonCSFPmandatoryDatabaseNodes.nodeName = (this.state.mandatoryNonCSFPdatabaseNodedetails.nodeName) ? this.state.mandatoryNonCSFPdatabaseNodedetails.nodeName.trim() : '';
            editUserModel.NonCSFPmandatoryDatabaseNodes.hostName = (this.state.mandatoryNonCSFPdatabaseNodedetails.hostName) ? this.state.mandatoryNonCSFPdatabaseNodedetails.hostName.trim() : '';
            editUserModel.NonCSFPmandatoryDatabaseNodes.publicIP = (this.state.mandatoryNonCSFPdatabaseNodedetails.publicIP) ? this.state.mandatoryNonCSFPdatabaseNodedetails.publicIP.trim() : '';
            editUserModel.NonCSFPmandatoryDatabaseNodes.privateIP = (this.state.mandatoryNonCSFPdatabaseNodedetails.privateIP) ? this.state.mandatoryNonCSFPdatabaseNodedetails.privateIP.trim() : '';

            editUserModel.NonCSFPProcessingUserName = (this.state.NonCSFPProcessingUserName) ? this.state.NonCSFPProcessingUserName.trim() : '';
            editUserModel.NonCSFPProcessingPassword = (this.state.NonCSFPProcessingPassword) ? this.state.NonCSFPProcessingPassword : '';
            editUserModel.NonCSFPmandatoryProcessNodes.nodeName = (this.state.mandatoryNonCSFPprocessingNodedetails.nodeName) ? this.state.mandatoryNonCSFPprocessingNodedetails.nodeName.trim() : '';
            editUserModel.NonCSFPmandatoryProcessNodes.hostName = (this.state.mandatoryNonCSFPprocessingNodedetails.hostName) ? this.state.mandatoryNonCSFPprocessingNodedetails.hostName.trim() : '';
            editUserModel.NonCSFPmandatoryProcessNodes.publicIP = (this.state.mandatoryNonCSFPprocessingNodedetails.publicIP) ? this.state.mandatoryNonCSFPprocessingNodedetails.publicIP.trim() : '';
            editUserModel.NonCSFPmandatoryProcessNodes.privateIP = (this.state.mandatoryNonCSFPprocessingNodedetails.privateIP) ? this.state.mandatoryNonCSFPprocessingNodedetails.privateIP.trim() : '';


            editUserModel.NonCSFPDeployerUserName = (this.state.NonCSFPDeployerUserName) ? this.state.NonCSFPDeployerUserName.trim() : '';
            editUserModel.NonCSFPDeployerPassword = (this.state.NonCSFPDeployerPassword) ? this.state.NonCSFPDeployerPassword : '';
            editUserModel.NonCSFPmandatoryDeployerNodes.nodeName = (this.state.mandatoryNonCSFPDeployerNodedetails.nodeName) ? this.state.mandatoryNonCSFPDeployerNodedetails.nodeName.trim() : '';
            editUserModel.NonCSFPmandatoryDeployerNodes.hostName = (this.state.mandatoryNonCSFPDeployerNodedetails.hostName) ? this.state.mandatoryNonCSFPDeployerNodedetails.hostName.trim() : '';
            editUserModel.NonCSFPmandatoryDeployerNodes.publicIP = (this.state.mandatoryNonCSFPDeployerNodedetails.publicIP) ? this.state.mandatoryNonCSFPDeployerNodedetails.publicIP.trim() : '';
            editUserModel.NonCSFPmandatoryDeployerNodes.privateIP = (this.state.mandatoryNonCSFPDeployerNodedetails.privateIP) ? this.state.mandatoryNonCSFPDeployerNodedetails.privateIP.trim() : '';


            if (!editUserModel.NonCSFPnameText) {
                formErrors.NonCSFPnameError = 'Name is required';
                validation.errors.push(formErrors.NonCSFPnameError);
            }
            else if (editUserModel.NonCSFPnameText && !((editUserModel.NonCSFPnameText).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.NonCSFPnameError = 'Name should be alphanumeric';
                validation.errors.push(formErrors.NonCSFPnameError);
            }
            if (!editUserModel.NonCSFPapplicationNameSpace) {
                formErrors.NonCSFPapplicationNameSpaceError = 'Application name space is required';
                validation.errors.push(formErrors.NonCSFPapplicationNameSpaceError);
            }
            if (editUserModel.NonCSFPapplicationNameSpace && !((editUserModel.NonCSFPapplicationNameSpace).toString().match(/^[- a-zA-Z0-9]+$/))) {
                formErrors.NonCSFPapplicationNameSpaceError = 'Application name space can contain only alphanumeric and ' - '';
                validation.errors.push(formErrors.NonCSFPapplicationNameSpaceError);
            }

            if (!editUserModel.NonCSFPmandatoryPortalnodes.portalName) {
                formErrors.NonCSFPmandatoryPortalNameError = 'Portal name is required';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNameError);
            }
            else if (editUserModel.NonCSFPmandatoryPortalnodes.portalName && !((editUserModel.NonCSFPmandatoryPortalnodes.portalName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.NonCSFPmandatoryPortalNameError = 'Portal name should be alphanumeric';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNameError);
            }
            if (!editUserModel.NonCSFPmandatoryPortalnodes.portalURL) {
                formErrors.NonCSFPmandatoryPortalNodePortalURLError = 'Portal URL  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNodePortalURLError);
            }
            else if (editUserModel.NonCSFPmandatoryPortalnodes.portalURL && !((editUserModel.NonCSFPmandatoryPortalnodes.portalURL).toString().match(/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/))) {
                formErrors.NonCSFPmandatoryPortalNodePortalURLError = 'Portal URL is invalid';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNodePortalURLError);
            }
            if (!editUserModel.NonCSFPmandatoryPortalnodes.hostName) {
                formErrors.NonCSFPmandatoryPortalNodeHostNameError = 'Host name  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNodeHostNameError);
            }
            if (!editUserModel.NonCSFPmandatoryPortalnodes.privateIP) {
                formErrors.NonCSFPmandatoryPortalNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNodePrivateIPError);
            }
            else if (editUserModel.NonCSFPmandatoryPortalnodes.privateIP && !((editUserModel.NonCSFPmandatoryPortalnodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPmandatoryPortalNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNodePrivateIPError);
            }
            if (!editUserModel.NonCSFPmandatoryPortalnodes.publicIP) {
                formErrors.NonCSFPmandatoryPortalNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.CSFPmandatoryPortalNodePublicIPError);
            }
            else if (editUserModel.NonCSFPmandatoryPortalnodes.publicIP && !((editUserModel.NonCSFPmandatoryPortalnodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPmandatoryPortalNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.NonCSFPmandatoryPortalNodePublicIPError);
            }
            if (!editUserModel.NonCSFPmandatoryPortalnodes.portalUserName) {
                formErrors.NonCSFPPortalUserNameError = 'Username  is required';
                validation.errors.push(formErrors.NonCSFPPortalUserNameError);
            }
            else if (editUserModel.NonCSFPmandatoryPortalnodes.portalUserName && !((editUserModel.NonCSFPmandatoryPortalnodes.portalUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.NonCSFPPortalUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.NonCSFPPortalUserNameError);
            }
            if (!editUserModel.NonCSFPmandatoryPortalnodes.portalPassword) {
                formErrors.NonCSFPPortalPasswordError = 'Password  is required';
                validation.errors.push(formErrors.NonCSFPPortalPasswordError);
            }
            else if (editUserModel.NonCSFPmandatoryPortalnodes.portalPassword.length < 6) {
                formErrors.NonCSFPPortalPasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.NonCSFPPortalPasswordError);
            }
            else if (editUserModel.NonCSFPmandatoryPortalnodes.portalPassword.length > 15) {
                formErrors.NonCSFPPortalPasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.NonCSFPPortalPasswordError);
            }


            // Database node

            if (!editUserModel.NonCSFPDatabaseUserName) {
                formErrors.NonCSFPDatabaseUserNameError = 'UserName is required';
                validation.errors.push(formErrors.NonCSFPDatabaseUserNameError);
            }
            else if (editUserModel.NonCSFPDatabaseUserName && !((editUserModel.NonCSFPDatabaseUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.NonCSFPDatabaseUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.NonCSFPDatabaseUserNameError);
            }
            if (!editUserModel.NonCSFPDatabasePassword) {
                formErrors.NonCSFPDatabasePasswordError = 'Password is required';
                validation.errors.push(formErrors.NonCSFPDatabasePasswordError);
            }
            else if (editUserModel.NonCSFPDatabasePassword.length < 6) {
                formErrors.NonCSFPDatabasePasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.NonCSFPDatabasePasswordError);
            }
            else if (editUserModel.NonCSFPDatabasePassword.length > 15) {
                formErrors.NonCSFPDatabasePasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.NonCSFPDatabasePasswordError);
            }

            if (!editUserModel.NonCSFPmandatoryDatabaseNodes.nodeName) {
                formErrors.NonCSFPmandatoryDatabaseNodeNodeNameError = 'Node name  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryDatabaseNodeNodeNameError);
            }

            if (!editUserModel.NonCSFPmandatoryDatabaseNodes.hostName) {
                formErrors.NonCSFPmandatoryDatabaseNodeHostNameError = 'Host name  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryDatabaseNodeHostNameError);
            }
            if (!editUserModel.NonCSFPmandatoryDatabaseNodes.privateIP) {
                formErrors.NonCSFPmandatoryDatabaseNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryDatabaseNodePrivateIPError);
            }
            else if (editUserModel.NonCSFPmandatoryDatabaseNodes.privateIP && !((editUserModel.NonCSFPmandatoryDatabaseNodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPmandatoryDatabaseNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.NonCSFPmandatoryDatabaseNodePrivateIPError);
            }
            if (!editUserModel.NonCSFPmandatoryDatabaseNodes.publicIP) {
                formErrors.NonCSFPmandatoryDatabaseNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryDatabaseNodePublicIPError);
            }
            else if (editUserModel.NonCSFPmandatoryDatabaseNodes.publicIP && !((editUserModel.NonCSFPmandatoryDatabaseNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPmandatoryDatabaseNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.NonCSFPmandatoryDatabaseNodePublicIPError);
            }


            // Procesing node

            if (!editUserModel.NonCSFPProcessingUserName) {
                formErrors.NonCSFPProcessingUserNameError = 'UserName is required';
                validation.errors.push(formErrors.NonCSFPProcessingUserNameError);
            }
            else if (editUserModel.NonCSFPProcessingUserName && !((editUserModel.NonCSFPProcessingUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.NonCSFPProcessingUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.NonCSFPProcessingUserNameError);
            }
            if (!editUserModel.NonCSFPProcessingPassword) {
                formErrors.NonCSFPProcessingPasswordError = 'Password is required';
                validation.errors.push(formErrors.NonCSFPProcessingPasswordError);
            }
            else if (editUserModel.NonCSFPProcessingPassword.length < 6) {
                formErrors.NonCSFPProcessingPasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.NonCSFPProcessingPasswordError);
            }
            else if (editUserModel.NonCSFPProcessingPassword.length > 15) {
                formErrors.NonCSFPProcessingPasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.NonCSFPProcessingPasswordError);
            }
            if (!editUserModel.NonCSFPmandatoryProcessNodes.nodeName) {
                formErrors.NonCSFPmandatoryProcessingNodeNodeNameError = 'Node name  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryProcessingNodeNodeNameError);
            }
            if (!editUserModel.NonCSFPmandatoryProcessNodes.hostName) {
                formErrors.NonCSFPmandatoryProcessingNodeHostNameError = 'Host name  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryProcessingNodeHostNameError);
            }
            if (!editUserModel.NonCSFPmandatoryProcessNodes.privateIP) {
                formErrors.NonCSFPmandatoryProcessingNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryProcessingNodePrivateIPError);
            }
            else if (editUserModel.NonCSFPmandatoryProcessNodes.privateIP && !((editUserModel.NonCSFPmandatoryProcessNodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPmandatoryProcessingNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.NonCSFPmandatoryProcessingNodePrivateIPError);
            }
            if (!editUserModel.NonCSFPmandatoryProcessNodes.publicIP) {
                formErrors.NonCSFPmandatoryProcessingNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.NonCSFPmandatoryProcessingNodePublicIPError);
            }
            else if (editUserModel.NonCSFPmandatoryProcessNodes.publicIP && !((editUserModel.NonCSFPmandatoryProcessNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPmandatoryProcessingNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.NonCSFPmandatoryProcessingNodePublicIPError);
            }

            // NonCSFP Deployer nodes



            if (!editUserModel.NonCSFPDeployerUserName) {
                formErrors.NonCSFPDeployerNodeUserNameError = 'UserName is required';
                validation.errors.push(formErrors.NonCSFPDeployerNodeUserNameError);
            }
            else if (editUserModel.NonCSFPDeployerUserName && !((editUserModel.NonCSFPDeployerUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                formErrors.NonCSFPDeployerNodeUserNameError = 'UserName should be alphanumeric';
                validation.errors.push(formErrors.NonCSFPDeployerNodeUserNameError);
            }
            if (!editUserModel.NonCSFPDeployerPassword) {
                formErrors.NonCSFPDeployerNodePasswordError = 'Password is required';
                validation.errors.push(formErrors.NonCSFPDeployerNodePasswordError);
            }
            else if (editUserModel.NonCSFPDeployerPassword.length < 6) {
                formErrors.NonCSFPDeployerNodePasswordError = 'password must contain atleast 6 characters';
                validation.errors.push(formErrors.NonCSFPDeployerNodePasswordError);
            }
            else if (editUserModel.NonCSFPDeployerPassword.length > 15) {
                formErrors.NonCSFPDeployerNodePasswordError = 'password can not be more than 15 characters';
                validation.errors.push(formErrors.NonCSFPDeployerNodePasswordError);
            }
            if (!editUserModel.NonCSFPmandatoryDeployerNodes.nodeName) {
                formErrors.NonCSFPDeployerNodeNodeNameError = 'Node name  is required';
                validation.errors.push(formErrors.NonCSFPDeployerNodeNodeNameError);
            }

            if (!editUserModel.NonCSFPmandatoryDeployerNodes.hostName) {
                formErrors.NonCSFPDeployerNodeHostnameError = 'Host name  is required';
                validation.errors.push(formErrors.NonCSFPDeployerNodeHostnameError);
            }
            if (!editUserModel.NonCSFPmandatoryDeployerNodes.privateIP) {
                formErrors.NonCSFPDeployerNodePrivateIPError = 'Private IP  is required';
                validation.errors.push(formErrors.NonCSFPDeployerNodePrivateIPError);
            }
            else if (editUserModel.NonCSFPmandatoryDeployerNodes.privateIP && !((editUserModel.NonCSFPmandatoryDeployerNodes.privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPDeployerNodePrivateIPError = 'Private IP  is invalid';
                validation.errors.push(formErrors.NonCSFPDeployerNodePrivateIPError);
            }
            if (!editUserModel.NonCSFPmandatoryDeployerNodes.publicIP) {
                formErrors.NonCSFPDeployerNodePublicIPError = 'Public IP  is required';
                validation.errors.push(formErrors.NonCSFPDeployerNodePublicIPError);
            }
            else if (editUserModel.NonCSFPmandatoryDeployerNodes.publicIP && !((editUserModel.NonCSFPmandatoryDeployerNodes.publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                formErrors.NonCSFPDeployerNodePublicIPError = 'Public IP  is invalid';
                validation.errors.push(formErrors.NonCSFPDeployerNodePublicIPError);
            }

            //list of differnt nodes i.e. dynamic fields of noncsfp
            if (editUserModel.listOfNonCSFPportalNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfNonCSFPportalNodes.length; i++) {

                    if (editUserModel.listOfNonCSFPportalNodes[i].portalUserName && !((editUserModel.listOfNonCSFPportalNodes[i].portalUserName).toString().match(/^[ a-zA-Z0-9]+$/))) {
                        formErrors.listOfNonCSFPPortalNodesPortalUserNameError[i] = 'UserName should be alphanumeric';
                        validation.errors.push(formErrors.listOfNonCSFPPortalNodesPortalUserNameError[i]);
                    }
                    if (editUserModel.listOfNonCSFPportalNodes[i].portalPassword && editUserModel.listOfNonCSFPportalNodes[i].portalPassword.length < 6) {
                        formErrors.listOfNonCSFPPortalNodesPortalPasswordError[i] = 'password must contain atleast 6 characters';
                        validation.errors.push(formErrors.listOfNonCSFPPortalNodesPortalPasswordError[i]);
                    }
                    else if (editUserModel.listOfNonCSFPportalNodes[i].portalPassword && editUserModel.listOfNonCSFPportalNodes[i].portalPassword.length > 15) {
                        formErrors.listOfNonCSFPPortalNodesPortalPasswordError[i] = 'password can not be more than 15 characters';
                        validation.errors.push(formErrors.listOfNonCSFPPortalNodesPortalPasswordError[i]);
                    }

                    if (editUserModel.listOfNonCSFPportalNodes[i].privateIP && !((editUserModel.listOfNonCSFPportalNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPPortalNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPPortalNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfNonCSFPportalNodes[i].publicIP && !((editUserModel.listOfNonCSFPportalNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPPortalNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPPortalNodesPublicIPError[i]);
                    }
                }
            }

            if (editUserModel.listofNonCSFPdatabasenodes.length > 0) {
                for (let i = 0; i < editUserModel.listofNonCSFPdatabasenodes.length; i++) {

                    if (editUserModel.listofNonCSFPdatabasenodes[i].privateIP && !((editUserModel.listofNonCSFPdatabasenodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPDatabaseNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPDatabaseNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listofNonCSFPdatabasenodes[i].publicIP && !((editUserModel.listofNonCSFPdatabasenodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPDatabaseNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPDatabaseNodesPublicIPError[i]);
                    }
                }
            }
            if (editUserModel.listOfNonCSFPprocessingNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfNonCSFPprocessingNodes.length; i++) {

                    if (editUserModel.listOfNonCSFPprocessingNodes[i].privateIP && !((editUserModel.listOfNonCSFPprocessingNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPProcessingNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPProcessingNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfNonCSFPprocessingNodes[i].publicIP && !((editUserModel.listOfNonCSFPprocessingNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPProcessingNodesPublicIPError[i] = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPProcessingNodesPublicIPError[i]);
                    }
                }
            }
            if (editUserModel.listOfNonCSFPDeployerNodes.length > 0) {
                for (let i = 0; i < editUserModel.listOfNonCSFPDeployerNodes.length; i++) {

                    if (editUserModel.listOfNonCSFPDeployerNodes[i].privateIP && !((editUserModel.listOfNonCSFPDeployerNodes[i].privateIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPDeployerNodesPrivateIPError[i] = 'Private IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPDeployerNodesPrivateIPError[i]);
                    }
                    if (editUserModel.listOfNonCSFPDeployerNodes[i].publicIP && !((editUserModel.listOfNonCSFPDeployerNodes[i].publicIP).toString().match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/))) {
                        formErrors.listOfNonCSFPDeployerNodesPublicIPError = 'Public IP  is invalid';
                        validation.errors.push(formErrors.listOfNonCSFPDeployerNodesPublicIPError[i]);
                    }

                }
            }








        }
        this.forceUpdate();

        return validation;
    };


    onClickOfAddNodesTab = (e) => {

        this.setState({ showStorageNode: true })
    }
    addPortalNodes = (e) => {
        console.log("event of portal nodes", e);
        this.setState(prevState => ({ listOfPortalNodes: [...prevState.listOfPortalNodes, {portalUsername:'',portalPassword:'', portalName: '', portalURL: '', hostName: '', privateIP: '', publicIP: '' }] }))
        //  this.setState(prevState => ({ values: [...prevState.values, '']}))
    }
    addEdgeNodes = (e) => {
        this.setState(prevState => ({ listOfEdgeNodes: [...prevState.listOfEdgeNodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }
    addDeployerNodes = (e) => {
        this.setState(prevState => ({ listOfDeployerNodes: [...prevState.listOfDeployerNodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }
    addWorkerNodes = (e) => {
        this.setState(prevState => ({ listOfWorkerNodes: [...prevState.listOfWorkerNodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }
    addControllerNodes = (e) => {
        this.setState(prevState => ({ listOfControllerNodes: [...prevState.listOfControllerNodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }
    addStorageNodes = (e) => {
        this.setState(prevState => ({ listOfStorageNodes: [...prevState.listOfStorageNodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }
    // NonCSFP add dynamic fields methods are below
    addNonCSFPportalNodes = (e) => {
        this.setState(prevState => ({ listOfNonCSFPportalNodes: [...prevState.listOfNonCSFPportalNodes, {portalUsername:"",portalPassword:'', portalName: '', portalURL: '', hostName: '', privateIP: '', publicIP: '' }] }))
    }
    addNonCSFPDatabaseNodes = (e) => {
        this.setState(prevState => ({ listofNonCSFPdatabasenodes: [...prevState.listofNonCSFPdatabasenodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }
    addNonCSFPProcessingNodes = (e) => {
        this.setState(prevState => ({ listOfNonCSFPprocessingNodes: [...prevState.listOfNonCSFPprocessingNodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }
    addNonCSFPDeployerNodes = (e) => {
        this.setState(prevState => ({ listOfNonCSFPDeployerNodes: [...prevState.listOfNonCSFPDeployerNodes, { hostName: '', privateIP: '', publicIP: '' }] }))
    }

    handlePortalNodes = (i, event) => {
        console.log("portalnodes", this.state.listOfPortalNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfPortalNodes = [...this.state.listOfPortalNodes];
        listOfPortalNodes[i] = { ...listOfPortalNodes[i], [name]: value };
        this.setState({ listOfPortalNodes });
        console.log("portalnodes", this.state.listOfPortalNodes)
    }
    handleEdgeNodes = (i, event) => {
        console.log("listOfEdgeNodes", this.state.listOfEdgeNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfEdgeNodes = [...this.state.listOfEdgeNodes];
        listOfEdgeNodes[i] = { ...listOfEdgeNodes[i], [name]: value };
        this.setState({ listOfEdgeNodes });
        console.log("listOfEdgeNodes", this.state.listOfEdgeNodes)
    }
    handleDeployerNodes = (i, event) => {
        console.log("listOfDeployerNodes", this.state.listOfDeployerNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfDeployerNodes = [...this.state.listOfDeployerNodes];
        listOfDeployerNodes[i] = { ...listOfDeployerNodes[i], [name]: value };
        this.setState({ listOfDeployerNodes });
        console.log("listOfDeployerNodes", this.state.listOfDeployerNodes)
    }
    handleWorkerNodes = (i, event) => {
        console.log("listOfWorkerNodes", this.state.listOfWorkerNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfWorkerNodes = [...this.state.listOfWorkerNodes];
        listOfWorkerNodes[i] = { ...listOfWorkerNodes[i], [name]: value };
        this.setState({ listOfWorkerNodes });
        console.log("listOfWorkerNodes", this.state.listOfWorkerNodes)
    }
    handleControllersNodes = (i, event) => {
        console.log("listOfControllerNodes", this.state.listOfControllerNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfControllerNodes = [...this.state.listOfControllerNodes];
        listOfControllerNodes[i] = { ...listOfControllerNodes[i], [name]: value };
        this.setState({ listOfControllerNodes });
        console.log("listOfControllerNodes", this.state.listOfControllerNodes)
    }
    handleStorageNodes = (i, event) => {
        console.log("listOfStorageNodes", this.state.listOfStorageNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfStorageNodes = [...this.state.listOfStorageNodes];
        listOfStorageNodes[i] = { ...listOfStorageNodes[i], [name]: value };
        this.setState({ listOfStorageNodes });
        console.log("listOfStorageNodes", this.state.listOfStorageNodes)
    }


    // handle methods for NonCSFP
    handleNonCSFPportalNodes = (i, event) => {
        console.log("listOfNonSFPportalNodes", this.state.listOfNonCSFPportalNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfNonCSFPportalNodes = [...this.state.listOfNonCSFPportalNodes];
        listOfNonCSFPportalNodes[i] = { ...listOfNonCSFPportalNodes[i], [name]: value };
        this.setState({ listOfNonCSFPportalNodes });
        console.log("listOfNonSFPportalNodes", this.state.listOfNonCSFPportalNodes)
    }
    handleDatabaseNodes = (i, event) => {
        console.log("listOfDBNodes", this.state.listofNonCSFPdatabasenodes)
        const { name, value } = event.nativeEvent.target;
        let listofNonCSFPdatabasenodes = [...this.state.listofNonCSFPdatabasenodes];
        listofNonCSFPdatabasenodes[i] = { ...listofNonCSFPdatabasenodes[i], [name]: value };
        this.setState({ listofNonCSFPdatabasenodes });
        console.log("listOfDBNodes", this.state.listofNonCSFPdatabasenodes)
    }
    handleProcessingNodes = (i, event) => {
        console.log("listOfProcessingNodes", this.state.listOfNonCSFPprocessingNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfNonCSFPprocessingNodes = [...this.state.listOfNonCSFPprocessingNodes];
        listOfNonCSFPprocessingNodes[i] = { ...listOfNonCSFPprocessingNodes[i], [name]: value };
        this.setState({ listOfNonCSFPprocessingNodes });
        console.log("listOfProcessingNodes", this.state.listOfNonCSFPprocessingNodes)
    }

    handleNonCSFPDeployerNodes = (i, event) => {
        console.log("listOfNonCSFPDeployerNodes", this.state.listOfNonCSFPDeployerNodes)
        const { name, value } = event.nativeEvent.target;
        let listOfNonCSFPDeployerNodes = [...this.state.listOfNonCSFPDeployerNodes];
        listOfNonCSFPDeployerNodes[i] = { ...listOfNonCSFPDeployerNodes[i], [name]: value };
        this.setState({ listOfNonCSFPDeployerNodes });
        console.log("listOfNonCSFPDeployerNodes", this.state.listOfNonCSFPDeployerNodes)
    }



    removePortalNodeClick(i) {
        let listOfPortalNodes = [...this.state.listOfPortalNodes];
        listOfPortalNodes.splice(i, 1);
        this.setState({ listOfPortalNodes });
        console.log("remove portalnodes", this.state.listOfPortalNodes)
    }
    removeEdgeNodeClick(i) {
        let listOfEdgeNodes = [...this.state.listOfEdgeNodes];
        listOfEdgeNodes.splice(i, 1);
        this.setState({ listOfEdgeNodes });
        console.log("remove portalnodes", this.state.listOfEdgeNodes)
    }
    removeDeployerNodeClick(i) {
        let listOfDeployerNodes = [...this.state.listOfDeployerNodes];
        listOfDeployerNodes.splice(i, 1);
        this.setState({ listOfDeployerNodes });
        console.log("remove portalnodes", this.state.listOfDeployerNodes)
    }
    removeWorkerNodeClick(i) {
        let listOfWorkerNodes = [...this.state.listOfWorkerNodes];
        listOfWorkerNodes.splice(i, 1);
        this.setState({ listOfWorkerNodes });
        console.log("remove portalnodes", this.state.listOfWorkerNodes)
    }
    removeControllerNodeClick(i) {
        let listOfControllerNodes = [...this.state.listOfControllerNodes];
        listOfControllerNodes.splice(i, 1);
        this.setState({ listOfControllerNodes });
        console.log("remove portalnodes", this.state.listOfControllerNodes)
    }

    // remove methods for NonCSFP
    removeNonCSFPportalNodeClick(i) {
        let listOfNonCSFPportalNodes = [...this.state.listOfNonCSFPportalNodes];
        listOfNonCSFPportalNodes.splice(i, 1);
        this.setState({ listOfNonCSFPportalNodes });
        console.log("remove listOfNonCSFPportalNodes", this.state.listOfNonCSFPportalNodes)
    }
    removeNonCSFPDatabaseNodeClick(i) {
        let listofNonCSFPdatabasenodes = [...this.state.listofNonCSFPdatabasenodes];
        listofNonCSFPdatabasenodes.splice(i, 1);
        this.setState({ listofNonCSFPdatabasenodes });
        console.log("remove listofNonCSFPdatabasenodes", this.state.listofNonCSFPdatabasenodes)
    }
    removeNonCSFPProcessingNodeClick(i) {
        let listOfNonCSFPprocessingNodes = [...this.state.listOfNonCSFPprocessingNodes];
        listOfNonCSFPprocessingNodes.splice(i, 1);
        this.setState({ listOfNonCSFPprocessingNodes });
        console.log("remove listOfNonCSFPprocessingNodes", this.state.listOfNonCSFPprocessingNodes)
    }
    removeNonCSFPDeployerNodeClick(i) {
        let listOfNonCSFPDeployerNodes = [...this.state.listOfNonCSFPDeployerNodes];
        listOfNonCSFPDeployerNodes.splice(i, 1);
        this.setState({ listOfNonCSFPDeployerNodes });
        console.log("remove noncsfkdeployernodes", this.state.listOfNonCSFPDeployerNodes)
    }
    removeStorageNodeClick(i) {
        let listOfStorageNodes = [...this.state.listOfStorageNodes];
        listOfStorageNodes.splice(i, 1);
        this.setState({ listOfStorageNodes });
        console.log("remove portalnodes", this.state.listOfStorageNodes)
    }


    createPortalNodes() {

        const { listOfPortalNodesPortalPasswordError=[],listOfPortalNodesPortalUserNameError=[], listOfPortalNodesPortalNameError = [], listOfPortalNodesPortalURLError = [], listOfPortalNodesPrivateIPError = [],
            listOfPortalNodesPublicIPError = [] } = formErrors
        return this.state.listOfPortalNodes.map((evn, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px", display: "flex", flex: "1" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                    <TextInput
                            text={evn.portalUsername || ''}
                            id="TextInputID"
                            autocomplete="off"
                            value={evn.portalUsername || ''}
                            name="portalUsername"
                            error={!!listOfPortalNodesPortalUserNameError[i]}
                            errorMsg={listOfPortalNodesPortalUserNameError[i]}
                            placeholder="placeholder"
                            label="Username"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            onChange={this.handlePortalNodes.bind(this, i)}
                        />
                         <TextInput
                            text={evn.portalPassword || ''}
                            id="TextInputID"
                            autocomplete="off"
                            label="Password"
                            value={evn.portalPassword || ''}
                            name="portalPassword"
                            password={true}
                            error={!!listOfPortalNodesPortalPasswordError[i]}
                            errorMsg={listOfPortalNodesPortalPasswordError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            onChange={this.handlePortalNodes.bind(this, i)}
                        />
                        </div>
                        <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.portalName || ''}
                            id="TextInputID"
                            autocomplete="off"
                            label="Portal name"
                            value={evn.portalName || ''}
                            name="portalName"
                            error={!!listOfPortalNodesPortalNameError[i]}
                            errorMsg={listOfPortalNodesPortalNameError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            onChange={this.handlePortalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.portalURL || ''}
                            id="TextInputID"
                            autocomplete="off"
                            placeholder="placeholder"
                            label="Portal URL"
                            value={evn.portalURL || ''}
                            error={!!listOfPortalNodesPortalURLError[i]}
                            errorMsg={listOfPortalNodesPortalURLError[i]}
                            name="portalURL"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            onChange={this.handlePortalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            autocomplete="off"
                            name="hostName"
                            label="Hostname"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            onChange={this.handlePortalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            autocomplete="off"
                            label="Private IP"
                            name="privateIP"
                            error={!!listOfPortalNodesPrivateIPError[i]}
                            errorMsg={listOfPortalNodesPrivateIPError[i]}
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            onChange={this.handlePortalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            label="Public IP"
                            error={!!listOfPortalNodesPublicIPError[i]}
                            errorMsg={listOfPortalNodesPublicIPError[i]}
                            autocomplete="off"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            onChange={this.handlePortalNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", cursor: "pointer",marginLeft: "10px" }} key={i} onClick={this.removePortalNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }


    createEdgeNodes() {
        const { listOfEdgeNodesPrivateIPError = [], listOfEdgeNodesPublicIPError = [] } = formErrors
        return this.state.listOfEdgeNodes.map((evn, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px", display: "flex", flex: "1" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", width: "900px", width: "900px", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleEdgeNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleEdgeNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            error={!!listOfEdgeNodesPrivateIPError[i]}
                            errorMsg={listOfEdgeNodesPrivateIPError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleEdgeNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            error={!!listOfEdgeNodesPublicIPError[i]}
                            errorMsg={listOfEdgeNodesPublicIPError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleEdgeNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", position: "absolute", right: "0px", marginRight: "30px", cursor: "pointer" }} key={i} onClick={this.removeEdgeNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }




    edgenodeUI() {

        const { EdgeNodeHostnameError, EdgeNodePasswordError, EdgeNodeNodeNameError, EdgeNodeUserNameError, EdgeNodePrivateIPError, EdgeNodePublicIPError } = formErrors;
        return (
            <div>
                <div style={{ display: "flex", flex: "1", marginLeft: "0px", marginRight: "0px", marginTop: "15px", marginBottom: "0px" }}>
                    <TextInput
                        text={this.state.edgeNodeUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="User name"
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        required={true}
                        error={!!EdgeNodeUserNameError}
                        errorMsg={EdgeNodeUserNameError}
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ edgeNodeUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.edgeNodePassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        required={true}
                        error={!!EdgeNodePasswordError}
                        errorMsg={EdgeNodePasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ edgeNodePassword: e.value })
                            this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>

                        <TextInput
                            text={this.state.mandatoryEdgeNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!EdgeNodeNodeNameError}
                            errorMsg={EdgeNodeNodeNameError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryEdgeNodedetails = Object.assign({}, prevState.mandatoryEdgeNodedetails);  // creating copy of state variable jasper
                                    mandatoryEdgeNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryEdgeNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryEdgeNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!EdgeNodeHostnameError}
                            errorMsg={EdgeNodeHostnameError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryEdgeNodedetails = Object.assign({}, prevState.mandatoryEdgeNodedetails);  // creating copy of state variable jasper
                                    mandatoryEdgeNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryEdgeNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryEdgeNodedetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!EdgeNodePrivateIPError}
                            errorMsg={EdgeNodePrivateIPError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryEdgeNodedetails = Object.assign({}, prevState.mandatoryEdgeNodedetails);  // creating copy of state variable jasper
                                    mandatoryEdgeNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryEdgeNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryEdgeNodedetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!EdgeNodePublicIPError}
                            errorMsg={EdgeNodePublicIPError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryEdgeNodedetails = Object.assign({}, prevState.mandatoryEdgeNodedetails);  // creating copy of state variable jasper
                                    mandatoryEdgeNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryEdgeNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.createEdgeNodes()}
                </div>

                <div style={{ display: "flex", flex: "1", marginTop: '10px', marginLeft: "-5px", width: "100px", cursor: "pointer" }} onClick={this.addEdgeNodes.bind(this)}> {ADD_ICON}Add node</div>


            </div>

        )
    }



    createWorkerNodeUI() {
        const { listOfWorkerNodesPrivateIPError = [], listOfWorkerNodesPublicIPError = [] } = formErrors
        return this.state.listOfWorkerNodes.map((evn, i) =>
            <div key={i} style={{ display: "flex", flex: "1", marginLeft: "0px", marginTop: "10px" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleWorkerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleWorkerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            error={!!listOfWorkerNodesPrivateIPError[i]}
                            errorMsg={listOfWorkerNodesPrivateIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleWorkerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            placeholder="placeholder"
                            error={!!listOfWorkerNodesPublicIPError[i]}
                            errorMsg={listOfWorkerNodesPublicIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleWorkerNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", position: "absolute", right: "0px", marginRight: "30px", cursor: "pointer" }} key={i} onClick={this.removeWorkerNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }




    workerNodeUI() {
        const { WorkerNodeHostnameError, WorkerNodePasswordError,
            WorkerNodePrivateIPError, WorkerNodePublicIPError, WorkerNodeUserNameError, WorkerNodeNodeNameError } = formErrors;


        return (
            <div>
                <div style={{ margin: "0px", display: "flex", flex: "1", marginTop: "15px" }}>
                    <TextInput
                        text={this.state.workerNodeUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="User name"
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        required={true}
                        error={!!WorkerNodeUserNameError}
                        errorMsg={WorkerNodeUserNameError}
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ workerNodeUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.workerNodePassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        required={true}
                        error={!!WorkerNodePasswordError}
                        errorMsg={WorkerNodePasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ workerNodePassword: e.value })
                            // this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={this.state.mandatoryWorkerNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            required={true}
                            error={!!WorkerNodeNodeNameError}
                            errorMsg={WorkerNodeNodeNameError}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryWorkerNodedetails = Object.assign({}, prevState.mandatoryWorkerNodedetails);  // creating copy of state variable jasper
                                    mandatoryWorkerNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryWorkerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryWorkerNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            required={true}
                            error={!!WorkerNodeHostnameError}
                            errorMsg={WorkerNodeHostnameError}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryWorkerNodedetails = Object.assign({}, prevState.mandatoryWorkerNodedetails);  // creating copy of state variable jasper
                                    mandatoryWorkerNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryWorkerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryWorkerNodedetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!WorkerNodePrivateIPError}
                            errorMsg={WorkerNodePrivateIPError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryWorkerNodedetails = Object.assign({}, prevState.mandatoryWorkerNodedetails);  // creating copy of state variable jasper
                                    mandatoryWorkerNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryWorkerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryWorkerNodedetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!WorkerNodePublicIPError}
                            errorMsg={WorkerNodePublicIPError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryWorkerNodedetails = Object.assign({}, prevState.mandatoryWorkerNodedetails);  // creating copy of state variable jasper
                                    mandatoryWorkerNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryWorkerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.createWorkerNodeUI()}
                </div>

                <div style={{ display: "flex", flex: "1", marginTop: '10px', marginLeft: "-5px", width: "100px", cursor: "pointer" }} onClick={this.addWorkerNodes.bind(this)}> {ADD_ICON}Add node</div>


            </div>

        )
    }

    createDeployerNodeUI() {
        const { listOfDeployerNodesPrivateIPError = [], listOfDeployerNodesPublicIPError = [] } = formErrors


        return this.state.listOfDeployerNodes.map((evn, i) =>
            <div key={i} style={{ display: "flex", flex: "1", marginLeft: "0px", marginTop: "10px" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDeployerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDeployerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            error={!!listOfDeployerNodesPrivateIPError[i]}
                            errorMsg={listOfDeployerNodesPrivateIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDeployerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            placeholder="placeholder"
                            error={!!listOfDeployerNodesPublicIPError[i]}
                            errorMsg={listOfDeployerNodesPublicIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDeployerNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", position: "absolute", right: "0px", marginRight: "30px", cursor: "pointer" }} key={i} onClick={this.removeDeployerNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }




    deployerNodeUI() {
        const { DeployerNodeHostnameError, DeployerNodePasswordError,
            DeployerNodePublicIPError, DeployerNodePrivateIPError,
            DeployerNodeUserNameError, DeployerNodeNodeNameError } = formErrors;

        return (
            <div>
                <div style={{ display: "flex", flex: "1", margin: "0px", marginTop: "15px" }}>
                    <TextInput
                        text={this.state.deployerNodeUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="User name"
                        required={true}
                        error={!!DeployerNodeUserNameError}
                        errorMsg={DeployerNodeUserNameError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ deployerNodeUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.deployerNodePassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        required={true}
                        error={!!DeployerNodePasswordError}
                        errorMsg={DeployerNodePasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ deployerNodePassword: e.value })
                            this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ display: "flex", flex: "1", margin: "0px" }}>
                        <TextInput
                            text={this.state.mandatoryDeployerNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!DeployerNodeNodeNameError}
                            errorMsg={DeployerNodeNodeNameError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryDeployerNodedetails = Object.assign({}, prevState.mandatoryDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryDeployerNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryDeployerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryDeployerNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!DeployerNodeHostnameError}
                            errorMsg={DeployerNodeHostnameError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryDeployerNodedetails = Object.assign({}, prevState.mandatoryDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryDeployerNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryDeployerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryDeployerNodedetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!DeployerNodePrivateIPError}
                            errorMsg={DeployerNodePrivateIPError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryDeployerNodedetails = Object.assign({}, prevState.mandatoryDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryDeployerNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryDeployerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryDeployerNodedetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!DeployerNodePublicIPError}
                            errorMsg={DeployerNodePublicIPError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryDeployerNodedetails = Object.assign({}, prevState.mandatoryDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryDeployerNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryDeployerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.createDeployerNodeUI()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} onClick={this.addDeployerNodes.bind(this)}> {ADD_ICON}Add node</div>


            </div>

        )
    }



    createControllerNodeUI() {
        const { listOfControllerNodesPrivateIPError = [], listOfControllerNodesPublicIPError = [] } = formErrors

        return this.state.listOfControllerNodes.map((evn, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px", display: "flex", flex: "1" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleControllersNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleControllersNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            error={!!listOfControllerNodesPrivateIPError[i]}
                            errorMsg={listOfControllerNodesPrivateIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleControllersNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            placeholder="placeholder"
                            error={!!listOfControllerNodesPublicIPError[i]}
                            errorMsg={listOfControllerNodesPublicIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleControllersNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", position: "absolute", right: "0px", marginRight: "30px", cursor: "pointer" }} key={i} onClick={this.removeControllerNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }




    ControllerNodeUI() {

        const { ControllerNodeHostnameError, ControllerNodePasswordError,
            ControllerNodePrivateIPError, ControllerNodePublicIPError, ControllerNodeUserNameError, ControllerNodeNodeNameError } = formErrors;
        return (
            <div>
                <div style={{ margin: "0px", marginTop: "15px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.controllerUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="User name"
                        required={true}
                        error={!!ControllerNodeUserNameError}
                        errorMsg={ControllerNodeUserNameError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ controllerUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.controllerPassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        required={true}
                        error={!!ControllerNodePasswordError}
                        errorMsg={ControllerNodePasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ controllerPassword: e.value })
                            this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={this.state.mandatoryControllerNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!ControllerNodeNodeNameError}
                            errorMsg={ControllerNodeNodeNameError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryControllerNodedetails = Object.assign({}, prevState.mandatoryControllerNodedetails);  // creating copy of state variable jasper
                                    mandatoryControllerNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryControllerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryControllerNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!ControllerNodeHostnameError}
                            errorMsg={ControllerNodeHostnameError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryControllerNodedetails = Object.assign({}, prevState.mandatoryControllerNodedetails);  // creating copy of state variable jasper
                                    mandatoryControllerNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryControllerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryControllerNodedetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!ControllerNodePrivateIPError}
                            errorMsg={ControllerNodePrivateIPError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryControllerNodedetails = Object.assign({}, prevState.mandatoryControllerNodedetails);  // creating copy of state variable jasper
                                    mandatoryControllerNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryControllerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryControllerNodedetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!ControllerNodePublicIPError}
                            errorMsg={ControllerNodePublicIPError}
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryControllerNodedetails = Object.assign({}, prevState.mandatoryControllerNodedetails);  // creating copy of state variable jasper
                                    mandatoryControllerNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryControllerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.createControllerNodeUI()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} onClick={this.addControllerNodes.bind(this)}> {ADD_ICON}Add node</div>


            </div>

        )
    }

    portalNodeUI() {
        const { CSFPmandatoryPortalNameError, CSFPmandatoryPortalNodePublicIPError,
            CSFPmandatoryPortalNodePrivateIPError, CSFPmandatoryPortalNodePortalURLError,
            CSFPmandatoryPortalNodeHostNameError, CSFPPortalUserNameError, CSFPPortalPasswordError } = formErrors;
        return (
            <div>
                <div style={{ margin: "0px", marginTop: "15px", display: "flex", flex: "1" }}>

                    {/* {formErrors.CSFPmandarorydetailsError?<div> {formErrors.CSFPmandarorydetailsError}</div>:null} */}
                    {/* <TextInput
                        text={this.state.PortalUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="User name"
                        required={true}
                        error={!!CSFPPortalUserNameError}
                        errorMsg={CSFPPortalUserNameError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            //editUserModel.form3Complete=e.value.length > 0 && this.st;
                            this.setState({ PortalUserName: e.value })

                        }}
                    /> */}
                    {/* <TextInput
                        text={this.state.PortalPassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        required={true}
                        error={!!CSFPPortalPasswordError}
                        errorMsg={CSFPPortalPasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ PortalPassword: e.value })
                            this.props.handler(e.value);
                        }}
                    /> */}
                </div>


                {/* <div >
                    <div style={{ margin: "0px", padding: "0px", display: "flex", flex: "1" }}>
                        Portal Name <span style={{ marginRight: "30px", marginLeft: "111px" }}>Portal URL</span>
                        <span style={{ marginRight: "30px", marginLeft: "75px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "76px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>
                    </div>
                </div> */}



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.mandatoryPortaldetails.portalUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Username"
                        required={true}
                        error={!!CSFPPortalUserNameError}
                        errorMsg={CSFPPortalUserNameError}
                        style={{ width: "240px", marginRight: "8px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            //  editUserModel.form3Complete=e.value.length > 0;
                            this.setState(prevState => {
                                let mandatoryPortaldetails = Object.assign({}, prevState.mandatoryPortaldetails);  // creating copy of state variable jasper
                                mandatoryPortaldetails.portalUserName = e.value;
                                // update the name property, assign a new value                 
                                return { mandatoryPortaldetails };                                 // return new object jasper object
                            }, () => {
                                // editUserModel.form3Complete=e.value.length > 0 && this.state.CSFPname.length>0;      
                                this.props.handler(e.value);
                            })}}
                    />
                      <TextInput
                        text={this.state.mandatoryPortaldetails.portalPassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        required={true}
                        error={!!CSFPPortalPasswordError}
                        errorMsg={CSFPPortalPasswordError}
                        style={{ width: "240px", marginRight: "8px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            //  editUserModel.form3Complete=e.value.length > 0;
                            this.setState(prevState => {
                                let mandatoryPortaldetails = Object.assign({}, prevState.mandatoryPortaldetails);  // creating copy of state variable jasper
                                mandatoryPortaldetails.portalPassword = e.value;
                                // update the name property, assign a new value                 
                                return { mandatoryPortaldetails };                                 // return new object jasper object
                            }, () => {
                                // editUserModel.form3Complete=e.value.length > 0 && this.state.CSFPname.length>0;      
                                this.props.handler(e.value);
                            })}}


                    />
                       </div>
                       <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={this.state.mandatoryPortaldetails.portalName}
                            id="TextInputID"
                            placeholder="placeholder"
                            required={true}
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            label="Portalname"
                            error={!!CSFPmandatoryPortalNameError}
                            errorMsg={CSFPmandatoryPortalNameError}
                            onChange={(e) => {
                                console.log("event", e)
                                //  editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryPortaldetails = Object.assign({}, prevState.mandatoryPortaldetails);  // creating copy of state variable jasper
                                    mandatoryPortaldetails.portalName = e.value;
                                    // update the name property, assign a new value                 
                                    return { mandatoryPortaldetails };                                 // return new object jasper object
                                }, () => {
                                    // editUserModel.form3Complete=e.value.length > 0 && this.state.CSFPname.length>0;      
                                    this.props.handler(e.value);
                                })


                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryPortaldetails.portalURL}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            required={true}
                            label="Portal URL"
                            error={!!CSFPmandatoryPortalNodePortalURLError}
                            errorMsg={CSFPmandatoryPortalNodePortalURLError}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryPortaldetails = Object.assign({}, prevState.mandatoryPortaldetails);  // creating copy of state variable jasper
                                    mandatoryPortaldetails.portalURL = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryPortaldetails };                                 // return new object jasper object
                                })
                                //  this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryPortaldetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!CSFPmandatoryPortalNodeHostNameError}
                            errorMsg={CSFPmandatoryPortalNodeHostNameError}
                            required={true}
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            label="Hostname"
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryPortaldetails = Object.assign({}, prevState.mandatoryPortaldetails);  // creating copy of state variable jasper
                                    mandatoryPortaldetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryPortaldetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryPortaldetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!CSFPmandatoryPortalNodePrivateIPError}
                            required={true}
                            errorMsg={CSFPmandatoryPortalNodePrivateIPError}
                            style={{ width: "253px", marginRight: "8px" }}
                            focus
                            label="Private IP"
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryPortaldetails = Object.assign({}, prevState.mandatoryPortaldetails);  // creating copy of state variable jasper
                                    mandatoryPortaldetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryPortaldetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryPortaldetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            required={true}
                            style={{ width: "253px" }}
                            focus
                            label="Public IP"
                            error={!!CSFPmandatoryPortalNodePublicIPError}
                            errorMsg={CSFPmandatoryPortalNodePublicIPError}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryPortaldetails = Object.assign({}, prevState.mandatoryPortaldetails);  // creating copy of state variable jasper
                                    mandatoryPortaldetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryPortaldetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.createPortalNodes()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} id="portalnodeAddBtn" onClick={this.addPortalNodes.bind(this)}> {ADD_ICON}Add node</div>
            </div>
        )
    }



    CSFPcommonFields() {
        const { CSFPnameError, CSFPapplicationNameSpaceError } = formErrors;

        return (
            <div>
                <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.CSFPname}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Name"
                        required={true}
                        error={!!CSFPnameError}
                        errorMsg={CSFPnameError}
                        width="300px"
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            this.setState({ CSFPname: e.value })
                            // editUserModel.form3Complete = e.value.length > 0 && this.state.mandatoryPortaldetails.portalName.length>0;

                            this.props.handler(e.value);
                        }}
                    />

                    <TextInput
                        text={this.state.CSFPapplicationNameSpace}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Application Name Space"
                        required={true}
                        error={!!CSFPapplicationNameSpaceError}
                        errorMsg={CSFPapplicationNameSpaceError}
                        style={{ width: "250px", marginRight: "15px" }}
                        width="300px"
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ CSFPapplicationNameSpace: e.value })

                        }}
                    />




                </div>

            </div>
        )
    }


    NonCSFPCommonfields() {
        const { NonCSFPnameError, NonCSFPapplicationNameSpaceError } = formErrors;

        return (
            <div>
                <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.NonCSFPname}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Name"
                        error={!!NonCSFPnameError}
                        errorMsg={NonCSFPnameError}
                        required={true}
                        style={{ width: "250px", marginRight: "15px" }}
                        width="300px"
                        focus
                        onChange={(e) => {
                            this.setState({ NonCSFPname: e.value })
                            // editUserModel.form3Complete = e.value.length > 0;

                            this.props.handler(e.value);
                        }}
                    />

                    <TextInput
                        text={this.state.NonCSFPapplicationNameSpace}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Application Name Space"
                        error={!!NonCSFPapplicationNameSpaceError}
                        errorMsg={NonCSFPapplicationNameSpaceError}
                        style={{ width: "250px", marginRight: "15px" }}
                        width="300px"
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPapplicationNameSpace: e.value })

                        }}
                    />



                </div>

            </div>)
    }

    StorageNodeUI() {
        const { StorageNodeUserNameError, StorageNodeNodeNameError, StorageNodePasswordError, StorageNodeHostnameError, StorageNodePrivateIPError, StorageNodePublicIPError } = formErrors
        return (
            <div>
                <div style={{ margin: "0px", marginTop: "20px", marginBottom: "20px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.storageNodeUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="User name"
                        error={!!StorageNodeUserNameError}
                        errorMsg={StorageNodeUserNameError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ storageNodeUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.storageNodePassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        error={!!StorageNodePasswordError}
                        errorMsg={StorageNodePasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ storageNodePassword: e.value })
                            this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={this.state.mandatoryStorageNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!StorageNodeNodeNameError}
                            errorMsg={StorageNodeNodeNameError}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryStorageNodedetails = Object.assign({}, prevState.mandatoryStorageNodedetails);  // creating copy of state variable jasper
                                    mandatoryStorageNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryStorageNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryStorageNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!StorageNodeHostnameError}
                            errorMsg={StorageNodeHostnameError}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryStorageNodedetails = Object.assign({}, prevState.mandatoryStorageNodedetails);  // creating copy of state variable jasper
                                    mandatoryStorageNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryStorageNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryStorageNodedetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!StorageNodePrivateIPError}
                            errorMsg={StorageNodePrivateIPError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryStorageNodedetails = Object.assign({}, prevState.mandatoryStorageNodedetails);  // creating copy of state variable jasper
                                    mandatoryStorageNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryStorageNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryStorageNodedetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!StorageNodePublicIPError}
                            errorMsg={StorageNodePublicIPError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryStorageNodedetails = Object.assign({}, prevState.mandatoryStorageNodedetails);  // creating copy of state variable jasper
                                    mandatoryStorageNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryStorageNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.DynamicStorageNodesUI()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} id="portalnodeAddBtn" onClick={this.addStorageNodes.bind(this)}> {ADD_ICON}Add node</div>
            </div>
        )

    }
    DynamicStorageNodesUI() {
        const { listOfStorageNodesPrivateIPError = [], listOfStorageNodesPublicIPError = [] } = formErrors
        return this.state.listOfStorageNodes.map((evn, i) =>
            <div key={i} style={{ display: "flex", flex: "1", marginLeft: "0px", marginTop: "10px" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "900px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleStorageNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleStorageNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            error={!!listOfStorageNodesPrivateIPError[i]}
                            errorMsg={listOfStorageNodesPrivateIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleStorageNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            error={!!listOfStorageNodesPublicIPError[i]}
                            errorMsg={listOfStorageNodesPublicIPError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleStorageNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", position: "absolute", right: "0px", marginRight: "30px", cursor: "pointer" }} key={i} onClick={this.removeStorageNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }







    NonCSFPportalNodeUI() {
        const { NonCSFPPortalUserNameError, NonCSFPPortalPasswordError, NonCSFPmandatoryPortalNameError,
            NonCSFPmandatoryPortalNodeHostNameError, NonCSFPmandatoryPortalNodePortalURLError, NonCSFPmandatoryPortalNodePrivateIPError,
            NonCSFPmandatoryPortalNodePublicIPError } = formErrors;
        return (
            <div>
                <div style={{ margin: "0px", marginTop: "20px", marginBottom: "20px", display: "flex", flex: "1" }}>
                    {/* <TextInput
                        text={this.state.NonCSFPPortalUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="User name"
                        error={!!NonCSFPPortalUserNameError}
                        errorMsg={NonCSFPPortalUserNameError}
                        required={true}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        required={true}
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPPortalUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.NonCSFPPortalPassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        required={true}
                        label="Password"
                        password={true}
                        error={!!NonCSFPPortalPasswordError}
                        errorMsg={NonCSFPPortalPasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPPortalPassword: e.value })
                            // this.props.handler(e.value);
                        }}
                    /> */}
                </div>


                {/* <div >
                    <div style={{ margin: "0px", padding: "0px", display: "flex", flex: "1" }}>
                        Portal Name <span style={{ marginRight: "30px", marginLeft: "111px" }}>Portal URL</span>
                        <span style={{ marginRight: "30px", marginLeft: "75px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "76px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>
                    </div>
                </div> */}



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.mandatoryNonCSFPPortaldetails.portalUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Username"
                        error={!!NonCSFPPortalUserNameError}
                        errorMsg={NonCSFPPortalUserNameError}
                        required={true}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        required={true}
                        onChange={(e) => {
                            console.log("event", e)
                            //  editUserModel.form3Complete=e.value.length > 0;
                            this.setState(prevState => {
                                let mandatoryNonCSFPPortaldetails = Object.assign({}, prevState.mandatoryNonCSFPPortaldetails);  // creating copy of state variable jasper
                                mandatoryNonCSFPPortaldetails.portalUserName = e.value;                     // update the name property, assign a new value                 
                                return { mandatoryNonCSFPPortaldetails };                                 // return new object jasper object
                            })
                            // this.props.handler(e.value);
                        }}
                    />
                    <TextInput
                        text={this.state.mandatoryNonCSFPPortaldetails.portalPassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        required={true}
                        label="Password"
                        password={true}
                        error={!!NonCSFPPortalPasswordError}
                        errorMsg={NonCSFPPortalPasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            //  editUserModel.form3Complete=e.value.length > 0;
                            this.setState(prevState => {
                                let mandatoryNonCSFPPortaldetails = Object.assign({}, prevState.mandatoryNonCSFPPortaldetails);  // creating copy of state variable jasper
                                mandatoryNonCSFPPortaldetails.portalPassword = e.value;                     // update the name property, assign a new value                 
                                return { mandatoryNonCSFPPortaldetails };                                 // return new object jasper object
                            })
                            // this.props.handler(e.value);
                        }}
                    />
                    </div>
                      <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={this.state.mandatoryNonCSFPPortaldetails.portalName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!NonCSFPmandatoryPortalNameError}
                            errorMsg={NonCSFPmandatoryPortalNameError}
                            required={true}
                            label="Portal name"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                //  editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPPortaldetails = Object.assign({}, prevState.mandatoryNonCSFPPortaldetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPPortaldetails.portalName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPPortaldetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPPortaldetails.portalURL}
                            id="TextInputID"
                            placeholder="placeholder"
                            required={true}
                            error={!!NonCSFPmandatoryPortalNodePortalURLError}
                            errorMsg={NonCSFPmandatoryPortalNodePortalURLError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            label="Portal URL"
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPPortaldetails = Object.assign({}, prevState.mandatoryNonCSFPPortaldetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPPortaldetails.portalURL = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPPortaldetails };                                 // return new object jasper object
                                })
                                //  this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPPortaldetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!NonCSFPmandatoryPortalNodeHostNameError}
                            errorMsg={NonCSFPmandatoryPortalNodeHostNameError}
                            required={true}
                            label="Hostname"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPPortaldetails = Object.assign({}, prevState.mandatoryNonCSFPPortaldetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPPortaldetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPPortaldetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPPortaldetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!NonCSFPmandatoryPortalNodePrivateIPError}
                            errorMsg={NonCSFPmandatoryPortalNodePrivateIPError}
                            required={true}
                            label="Private IP"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPPortaldetails = Object.assign({}, prevState.mandatoryNonCSFPPortaldetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPPortaldetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPPortaldetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPPortaldetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            required={true}
                            label="Public IP"
                            error={!!NonCSFPmandatoryPortalNodePublicIPError}
                            errorMsg={NonCSFPmandatoryPortalNodePublicIPError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPPortaldetails = Object.assign({}, prevState.mandatoryNonCSFPPortaldetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPPortaldetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPPortaldetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.DynamicNoncsfpPortalNodesUI()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} id="portalnodeAddBtn" onClick={this.addNonCSFPportalNodes.bind(this)}> {ADD_ICON}Add node</div>
            </div>
        )

    }
    DynamicNoncsfpPortalNodesUI() {
        const { listOfNonCSFPPortalNodesPortalUserNameError=[],listOfNonCSFPPortalNodesPortalPasswordError=[],listOfNonCSFPPortalNodesPortalNameError = [], listOfNonCSFPPortalNodesPortalURLError = [], listOfNonCSFPPortalNodesPrivateIPError = [],
            listOfNonCSFPPortalNodesPublicIPError = [] } = formErrors
        return this.state.listOfNonCSFPportalNodes.map((evn, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px", display: "flex", flex: "1" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                    <TextInput
                            text={evn.portalUsername || ''}
                            id="TextInputID"
                            value={evn.portalUsername || ''}
                            name="portalname"
                            placeholder="placeholder"
                            label="Username"
                            error={!!listOfNonCSFPPortalNodesPortalUserNameError[i]}
                            errorMsg={listOfNonCSFPPortalNodesPortalUserNameError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPportalNodes.bind(this, i)}
                        />
                         <TextInput
                            text={evn.portalPassword || ''}
                            id="TextInputID"
                            label="Password"
                            value={evn.portalPassword || ''}
                            name="portalPassword"
                            password={true}
                            placeholder="placeholder"
                            error={!!listOfNonCSFPPortalNodesPortalPasswordError[i]}
                            errorMsg={listOfNonCSFPPortalNodesPortalPasswordError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPportalNodes.bind(this, i)}
                        />
                      </div>
                      <div style={{ margin: "0px", display: "flex", flex: "1" }}> 
                        <TextInput
                            text={evn.portalName || ''}
                            id="TextInputID"
                            value={evn.portalName || ''}
                            name="portalName"
                            placeholder="placeholder"
                            label="Portal name"
                            error={!!listOfNonCSFPPortalNodesPortalNameError[i]}
                            errorMsg={listOfNonCSFPPortalNodesPortalNameError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPportalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.portalURL || ''}
                            id="TextInputID"
                            placeholder="placeholder"
                            value={evn.portalURL || ''}
                            name="portalURL"
                            label="Portal URL"
                            error={!!listOfNonCSFPPortalNodesPortalURLError[i]}
                            errorMsg={listOfNonCSFPPortalNodesPortalURLError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPportalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            label="Hostname"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPportalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            label="Private IP"
                            error={!!listOfNonCSFPPortalNodesPrivateIPError[i]}
                            errorMsg={listOfNonCSFPPortalNodesPrivateIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPportalNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            label="Public IP"
                            error={!!listOfNonCSFPPortalNodesPublicIPError[i]}
                            errorMsg={listOfNonCSFPPortalNodesPublicIPError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPportalNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", cursor: "pointer",marginLeft:"10px" }} key={i} onClick={this.removeNonCSFPportalNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }





    NonCSFPDatabasenodeUI() {
        const { NonCSFPmandatoryDatabaseNodePublicIPError, NonCSFPDatabaseUserNameError,
            NonCSFPmandatoryDatabaseNodePrivateIPError, NonCSFPDatabasePasswordError, NonCSFPmandatoryDatabaseNodeHostNameError,
            NonCSFPmandatoryDatabaseNodeNodeNameError } = formErrors
        return (
            <div>
                <div style={{ margin: "0px", marginTop: "15px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.NonCSFPDatabaseUserName}
                        id="TextInputID"
                        error={!!NonCSFPDatabaseUserNameError}
                        errorMsg={NonCSFPDatabaseUserNameError}
                        placeholder="placeholder"
                        label="User name"
                        required={true}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPDatabaseUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.NonCSFPDatabasePassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        required={true}
                        error={!!NonCSFPDatabasePasswordError}
                        errorMsg={NonCSFPDatabasePasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPDatabasePassword: e.value })
                            this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={this.state.mandatoryNonCSFPdatabaseNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPmandatoryDatabaseNodeNodeNameError}
                            errorMsg={NonCSFPmandatoryDatabaseNodeNodeNameError}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPdatabaseNodedetails = Object.assign({}, prevState.mandatoryNonCSFPdatabaseNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPdatabaseNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPdatabaseNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPdatabaseNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            required={true}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPmandatoryDatabaseNodeHostNameError}
                            errorMsg={NonCSFPmandatoryDatabaseNodeHostNameError}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPdatabaseNodedetails = Object.assign({}, prevState.mandatoryNonCSFPdatabaseNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPdatabaseNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPdatabaseNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPdatabaseNodedetails.privateIP}
                            id="TextInputID"
                            required={true}
                            placeholder="placeholder"
                            error={!!NonCSFPmandatoryDatabaseNodePrivateIPError}
                            errorMsg={NonCSFPmandatoryDatabaseNodePrivateIPError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPdatabaseNodedetails = Object.assign({}, prevState.mandatoryNonCSFPdatabaseNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPdatabaseNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPdatabaseNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPdatabaseNodedetails.publicIP}
                            id="TextInputID"
                            required={true}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            error={!!NonCSFPmandatoryDatabaseNodePublicIPError}
                            errorMsg={NonCSFPmandatoryDatabaseNodePublicIPError}
                            focus
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPdatabaseNodedetails = Object.assign({}, prevState.mandatoryNonCSFPdatabaseNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPdatabaseNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPdatabaseNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.DynamicNoncsfpDatabaseNodesUI()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} id="portalnodeAddBtn" onClick={this.addNonCSFPDatabaseNodes.bind(this)}> {ADD_ICON}Add node</div>
            </div>
        )

    }
    DynamicNoncsfpDatabaseNodesUI() {
        const { listOfNonCSFPDatabaseNodesPrivateIPError = [], listOfNonCSFPDatabaseNodesPublicIPError = [] } = formErrors

        return this.state.listofNonCSFPdatabasenodes.map((evn, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px", display: "flex", flex: "1" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "732px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>

                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDatabaseNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDatabaseNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            error={!!listOfNonCSFPDatabaseNodesPrivateIPError[i]}
                            errorMsg={listOfNonCSFPDatabaseNodesPrivateIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDatabaseNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            errror={!!listOfNonCSFPDatabaseNodesPublicIPError[i]}
                            errorMsg={listOfNonCSFPDatabaseNodesPublicIPError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleDatabaseNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", cursor: "pointer" }} key={i} onClick={this.removeNonCSFPDatabaseNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }



    NonCSFPprocessingnodeUI() {
        const { NonCSFPProcessingPasswordError, NonCSFPProcessingUserNameError, NonCSFPmandatoryProcessingNodeHostNameError,
            NonCSFPmandatoryProcessingNodePrivateIPError, NonCSFPmandatoryProcessingNodePublicIPError, NonCSFPmandatoryProcessingNodeNodeNameError } = formErrors
        return (
            <div>
                <div style={{ margin: "0px", marginTop: "15px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.NonCSFPProcessingUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        required={true}
                        label="User name"
                        error={!!NonCSFPProcessingUserNameError}
                        errorMsg={NonCSFPProcessingUserNameError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPProcessingUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.NonCSFPProcessingPassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        error={!!NonCSFPProcessingPasswordError}
                        errorMsg={NonCSFPProcessingPasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        required={true}
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPProcessingPassword: e.value })
                            this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={this.state.mandatoryNonCSFPprocessingNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPmandatoryProcessingNodeNodeNameError}
                            errorMsg={NonCSFPmandatoryProcessingNodeNodeNameError}
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPprocessingNodedetails = Object.assign({}, prevState.mandatoryNonCSFPprocessingNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPprocessingNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPprocessingNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPprocessingNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPmandatoryProcessingNodeHostNameError}
                            errorMsg={NonCSFPmandatoryProcessingNodeHostNameError}
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPprocessingNodedetails = Object.assign({}, prevState.mandatoryNonCSFPprocessingNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPprocessingNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPprocessingNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPprocessingNodedetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!NonCSFPmandatoryProcessingNodePrivateIPError}
                            errorMsg={NonCSFPmandatoryProcessingNodePrivateIPError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPprocessingNodedetails = Object.assign({}, prevState.mandatoryNonCSFPprocessingNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPprocessingNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPprocessingNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPprocessingNodedetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPmandatoryProcessingNodePublicIPError}
                            errorMsg={NonCSFPmandatoryProcessingNodePublicIPError}
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPprocessingNodedetails = Object.assign({}, prevState.mandatoryNonCSFPprocessingNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPprocessingNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPprocessingNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.DynamicNoncsfpProcesssingNodesUI()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} id="portalnodeAddBtn" onClick={this.addNonCSFPProcessingNodes.bind(this)}> {ADD_ICON}Add node</div>
            </div>
        )

    }
    DynamicNoncsfpProcesssingNodesUI() {
        const { listOfNonCSFPProcessingNodesPrivateIPError = [], listOfNonCSFPProcessingNodesPublicIPError = [] } = formErrors;
        return this.state.listOfNonCSFPprocessingNodes.map((evn, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px", display: "flex", flex: "1" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "732px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleProcessingNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleProcessingNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            error={!!listOfNonCSFPProcessingNodesPrivateIPError[i]}
                            errorMsg={listOfNonCSFPProcessingNodesPrivateIPError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleProcessingNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            error={!!listOfNonCSFPProcessingNodesPublicIPError[i]}
                            errorMsg={listOfNonCSFPProcessingNodesPublicIPError[i]}
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleProcessingNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", cursor: "pointer" }} key={i} onClick={this.removeNonCSFPProcessingNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }




    NonCSFPdeployerNodeUI() {
        const { NonCSFPDeployerNodeHostnameError, NonCSFPDeployerNodePasswordError, NonCSFPDeployerNodePrivateIPError,
            NonCSFPDeployerNodePublicIPError, NonCSFPDeployerNodeUserNameError, NonCSFPDeployerNodeNodeNameError } = formErrors
        return (
            <div>
                <div style={{ margin: "0px", marginTop: "15px", display: "flex", flex: "1" }}>
                    <TextInput
                        text={this.state.NonCSFPDeployerUserName}
                        id="TextInputID"
                        placeholder="placeholder"
                        required={true}
                        label="User name"
                        error={!!NonCSFPDeployerNodeUserNameError}
                        errorMsg={NonCSFPDeployerNodeUserNameError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPDeployerUserName: e.value })

                        }}
                    />
                    <TextInput
                        text={this.state.NonCSFPDeployerPassword}
                        id="TextInputID"
                        placeholder="placeholder"
                        label="Password"
                        password={true}
                        error={!!NonCSFPDeployerNodePasswordError}
                        errorMsg={NonCSFPDeployerNodePasswordError}
                        style={{ width: "250px", marginRight: "15px" }}
                        focus
                        required={true}
                        onChange={(e) => {
                            console.log("event", e)
                            // editUserModel.form3Complete=e.value.length > 0;
                            this.setState({ NonCSFPDeployerPassword: e.value })
                            this.props.handler(e.value);
                        }}
                    />
                </div>


                <div >
                    <div style={{ display: "flex", flex: "1", margin: "0px", padding: "0px" }}>
                        Node name <span style={{ marginRight: "30px", marginLeft: "120px" }}>Host name</span>
                        <span style={{ marginRight: "30px", marginLeft: "70px" }}>Private IP</span>
                        <span style={{ marginRight: "30px", marginLeft: "85px" }}>Public IP</span>

                    </div>
                </div>



                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke' }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>

                        <TextInput
                            text={this.state.mandatoryNonCSFPDeployerNodedetails.nodeName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPDeployerNodeNodeNameError}
                            errorMsg={NonCSFPDeployerNodeNodeNameError}
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPDeployerNodedetails = Object.assign({}, prevState.mandatoryNonCSFPDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPDeployerNodedetails.nodeName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPDeployerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPDeployerNodedetails.hostName}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPDeployerNodeHostnameError}
                            errorMsg={NonCSFPDeployerNodeHostnameError}
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPDeployerNodedetails = Object.assign({}, prevState.mandatoryNonCSFPDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPDeployerNodedetails.hostName = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPDeployerNodedetails };                                 // return new object jasper object
                                })
                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPDeployerNodedetails.privateIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            error={!!NonCSFPDeployerNodePrivateIPError}
                            errorMsg={NonCSFPDeployerNodePrivateIPError}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPDeployerNodedetails = Object.assign({}, prevState.mandatoryNonCSFPDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPDeployerNodedetails.privateIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPDeployerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                        <TextInput
                            text={this.state.mandatoryNonCSFPDeployerNodedetails.publicIP}
                            id="TextInputID"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            error={!!NonCSFPDeployerNodePublicIPError}
                            errorMsg={NonCSFPDeployerNodePublicIPError}
                            required={true}
                            onChange={(e) => {
                                console.log("event", e)
                                // editUserModel.form3Complete=e.value.length > 0;
                                this.setState(prevState => {
                                    let mandatoryNonCSFPDeployerNodedetails = Object.assign({}, prevState.mandatoryNonCSFPDeployerNodedetails);  // creating copy of state variable jasper
                                    mandatoryNonCSFPDeployerNodedetails.publicIP = e.value;                     // update the name property, assign a new value                 
                                    return { mandatoryNonCSFPDeployerNodedetails };                                 // return new object jasper object
                                })

                                // this.props.handler(e.value);
                            }}
                        />
                    </div>
                </div>
                <div>
                    {this.DynamicNoncsfpDeployerNodesUI()}
                </div>

                <div style={{ marginTop: '10px', marginLeft: "-5px", display: "flex", flex: "1", width: "100px", cursor: "pointer" }} id="portalnodeAddBtn" onClick={this.addNonCSFPDeployerNodes.bind(this)}> {ADD_ICON}Add node</div>
            </div>
        )

    }
    DynamicNoncsfpDeployerNodesUI() {
        const { listOfNonCSFPDeployerNodesPrivateIPError = [], listOfNonCSFPDeployerNodesPublicIPError = [] } = formErrors
        return this.state.listOfNonCSFPDeployerNodes.map((evn, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px", display: "flex", flex: "1" }}>
                <div style={{ margin: "0px", padding: "15px", border: "1px solid grey", backgroundColor: 'whitesmoke', width: "732px" }}>
                    <div style={{ margin: "0px", display: "flex", flex: "1" }}>
                        <TextInput
                            text={evn.nodeName || ''}
                            id="TextInputID"
                            value={evn.nodeName || ''}
                            name="nodeName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPDeployerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.hostName || ''}
                            id="TextInputID"
                            value={evn.hostName || ''}
                            name="hostName"
                            placeholder="placeholder"
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPDeployerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.privateIP || ''}
                            id="TextInputID"
                            name="privateIP"
                            value={evn.privateIP || ''}
                            placeholder="placeholder"
                            error={!!listOfNonCSFPDeployerNodesPrivateIPError[i]}
                            errorMsg={listOfNonCSFPDeployerNodesPrivateIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPDeployerNodes.bind(this, i)}
                        />
                        <TextInput
                            text={evn.publicIP || ''}
                            id="TextInputID"
                            vale={evn.publicIP || ''}
                            name="publicIP"
                            placeholder="placeholder"
                            error={!!listOfNonCSFPDeployerNodesPublicIPError[i]}
                            errorMsg={listOfNonCSFPDeployerNodesPublicIPError[i]}
                            style={{ width: "253px", marginRight: "15px" }}
                            focus
                            onChange={this.handleNonCSFPDeployerNodes.bind(this, i)}
                        />

                        <div style={{ marginTop: "18px", cursor: "pointer" }} key={i} onClick={this.removeNonCSFPDeployerNodeClick.bind(this, i)}>{REMOVE_ICON}</div>
                    </div> </div>
            </div>
        )
    }





    render() {

        // const { CSFPnameError,CSFPmandatoryPortalNameError } = formErrors;
        if (this.state.validateflag === false) {
            portname = " ";
        }
        else {
            portname = "images/ic_remove_circle.svg";
        }
        return (
            <FormLayout>

                {/* {!editUserModel.editflagofform3? <div style={{ display:"flex",flex:"1",fontSize: "25px", color: "grey",marginBottom:"26px",marginTop:"-10px"}}> Verify</div>
:null} */}
                {/* CSFP TEMPLATE FORM         */}


                {editUserModel.applicationType === 'CSFP' ?
                    <div>
                        <div style={{ display: "flex", flex: "1", fontSize: "25px", color: "grey", marginBottom: "26px", marginTop: "-21px" }}> Verify</div>

                        {this.CSFPcommonFields()}
                        <div style={{ marginTop: "20px" }}>

                            <Tabs alignment="left">
                                <Tab id="basicTab1" label="PORTAL NODES" className="tabWidth">
                                    <div>{this.portalNodeUI()}</div></Tab>

                                <Tab id="basicTab2" label="EDGE NODES"><div>{this.edgenodeUI()}</div></Tab>
                                <Tab id="basicTab3" label="DEPLOYER NODES"><div>{this.deployerNodeUI()}</div></Tab>
                                <Tab id="basicTab4" label="WORKER NODES"><div>{this.workerNodeUI()}</div></Tab>
                                <Tab id="basicTab5" label="CONTROLLER NODES"><div>{this.ControllerNodeUI()}</div></Tab>
                                {/* {this.state.showStorageNode?<Tab id="basicTab6" label="STORAGE NODES"><div>Hi Storage nodes</div></Tab>:null} */}

                                {/* {this.state.showStorageNode===false?<Button id="Somebtn" text="ADD" onClick={this.onClickOfAddNodesTab()}></Button>
                                :null} */}
                                {this.state.showStorageNode === true ? <Tab id="basicTab6" label="STORAGE NODES"><div>{this.StorageNodeUI()}</div></Tab>
                                    :
                                    <Button id="Somebtn" text="ADD" onClick={this.onClickOfAddNodesTab()}></Button>
                                }
                            </Tabs>
                        </div>
                        {/* {editUserModel.editflagofform3?<div className="row" style={{ marginTop: "-20px", bottom: "10px", position: 'fixed', right: "50px", float: "right" }}>

<Button id="cancel" style={{ height: "20px" }} text="Cancel" onClick={this.onCancel} />
<Button id="Save" text="Save" onClick={this.onSave} isCallToAction /></div>
:null} */}
                    </div>

                    :

                    //   NONCSFP TEMPLATE FORM UI

                    <div>
                        <div style={{ display: "flex", flex: "1", fontSize: "25px", color: "grey", marginBottom: "26px", marginTop: "-21px" }}> Verify</div>

                        {this.NonCSFPCommonfields()}
                        <div>
                            <Tabs alignment="left">
                                <Tab id="basicTab1" label="PORTAL NODES">
                                    <div>{this.NonCSFPportalNodeUI()}</div></Tab>
                                <Tab id="basicTab2" label="DATABASE NODES"><div>{this.NonCSFPDatabasenodeUI()}</div></Tab>
                                <Tab id="basicTab3" label="PROCESSING NODES"><div>{this.NonCSFPprocessingnodeUI()}</div></Tab>
                                <Tab id="basicTab4" label="DEPLOYER NODES"><div>{this.NonCSFPdeployerNodeUI()}</div></Tab>

                            </Tabs>
                        </div>
                    </div>}
            </FormLayout>
        );
    }
}











const renderApplicationScope = (
    <div id="AppSCopeContainer">
        <div className="AppText">Application Scope </div>
        <div className="nodesContainer" style={{ marginTop: "10px" }}>
            <div className="AppRowContainer" style={{ marginRight: "30px" }}>
                <span className="alignContent">Services in Scope</span>
                <span className="alignValue">Voice,SMS {"&"}Data</span>
            </div>
            <div className="AppRowContainer" style={{ marginRight: "30px" }}>
                <span className="alignContent">Network in Scope</span>
                <span className="alignValue">A{"&"}IuCS</span>
            </div>
            <div className="AppRowContainer" style={{ marginRight: "30px" }}>
                <span className="alignContent">Dimesion Feed</span>
                <span className="alignValue">CRM</span>
            </div>
            <div className="AppRowContainer" style={{ marginRight: "30px" }}>
                <span className="alignContent">Component List</span>
                <span className="alignValue">Portal</span>
            </div>
            <div className="AppRowContainer" style={{ marginRight: "30px" }}>
                <span className="alignContent">Component List</span>
                <span className="alignValue">Portal 1</span>
            </div>
            <div className="AppRowContainer" style={{ marginRight: "30px" }}>
                <span className="alignContent">Component List</span>
                <span className="alignValue">Portal 2</span>
            </div>
            <div className="AppRowContainer" style={{ marginRight: "30px" }}>
                <span className="alignContent">Component List</span>
                <span className="alignValue">Portal 3</span>
            </div>
            <div id="editBtn" className="AppRowContainer" style={{ marginRight: "30px" }}>
                <Button id="edit" style={{ margin: "0px" }} text="EDIT" aria-label="Edit" isCalltoAction />
            </div>
        </div>
    </div>
);






const Item = ({
    id, dataObject, name, isOpen, onEditClick, onDeleteClick, togglePanel,
}) => {
    //    this.state.configuredApps.map((eve, i) =>
    //     <div key={i} style={{ marginLeft: "15px", marginTop: "15px" ,border:"1px soliday grey"}} >
    //         {eve.application}
    //     </div>)

    let portalsNodes = dataObject.portalsNode;
    let edgeNodes = dataObject.edgeNodes;
    let deployerNodes = dataObject.deployerNodes;
    let workerNodes = dataObject.workerNodes;
    let storageNodes = dataObject.storageNodes;
    let controllerNode = dataObject.controllerNodes;
    let databaseNodes = dataObject.databaseNodes;
    let processingNodes = dataObject.processingNodes;
    // console.log("portalNodes",portalsNodes);
    let result;
    if (isOpen) {
        result = (
            <div id={id} style={{ paddingBottom: "0px" }} >
                <div role="button" className="toggle-bar111" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="true">
                    <span style={{ marginLeft: "-15px" }}>Name</span> &nbsp; | &nbsp; <span>{dataObject.applicationType}</span> &nbsp; | &nbsp;<span>{dataObject.application}</span>
                    {/* <Button text="Edit" onClick={onEditClick}/> */}
                    {showDelete? <span style={{ float: "right", marginRight: "50px", marginTop: "0px" }}>
                        <div onClick={onDeleteClick} style={{ width: "20px" }}>{DELETE_ICON}</div>
                    </span>:''}
                    {showEdit?<span style={{ float: "right", marginRight: "25px", marginTop: "0px" }}>
                        <div onClick={onEditClick} style={{ width: "20px" }}>{EDIT_ICON}</div>
                    </span>:''}

                    <span className="chevron-indicator expanded">
                        <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                    </span>
                </div>
                <div className="expanded-panel" style={{ backgroundColor: "rgba(0,0,0,0.06)" }} >
                    <div style={{ display: "flex", flex: "1", marginLeft: "15px" }}> <Label text="Application Name Space:" /><span style={{ marginTop: "-2px", fontSize: "14px" }}>{dataObject.applicationNameSpace}</span></div>
                    {/* <div style={{ marginTop: "8px", marginLeft: "15px" }}>
                        <Card
                            id="card1"
                            key="card1"
                            className="card"
                            css={{ height: 110, width: 1120, backgroundColor: "#FFF" }}
                            autoResize={false}
                            selectable={false}
                            singleSelection={false}
                            selectableCardSizeNotChanged={false}
                            //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                            dataTest="cardcollection-card1"
                        >
                            {[renderApplicationScope]}
                        </Card>
                    </div> */}

                    <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px" }}>
                        <div>Portal nodes</div>
                        {/* <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.portalUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue">   {dataObject.portalPassword}</span>
                            </div>
                        </div> */}
                        <div>
                            {portalsNodes.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                    id={"card1" + i}
                                    // key={"card1" + i}
                                    className="card"
                                    style={{ height:"auto", width: "1000px", padding:"10px", backgroundColor: "#FFF",padding:"10px" }}
                                    // autoResize={false}
                                    // selectable={false}
                                    // singleSelection={false}
                                    // selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                    <div className="AppRowContainer">
                                            <span className="alignContent">User name</span>
                                            <span className="alignValue">{eve.portalUserName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Password</span>
                                            <span className="alignValue">{eve.portalPassword}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Portal Name</span>
                                            <span className="alignValue">{eve.portalName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Portal URL</span>
                                            <span className="alignValue">{eve.portalURL}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div>





                    {edgeNodes ? <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px" }}>
                        <div>Edge nodes</div>
                        <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.edgeNodeUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue">   {dataObject.edgeNodeUserName}</span>
                            </div>
                        </div>
                        <div>
                            {edgeNodes.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                    id={"card1" +i}
                                    // key={"card1" + i}
                                    className="card"
                                    style={{ height: "auto", width: "600px", padding:"10px", backgroundColor: "#FFF" }}
                                    autoResize={false}
                                    selectable={false}
                                    singleSelection={false}
                                    selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Portal Name</span>
                                            <span className="alignValue">{eve.nodeName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div> : null}


                    {deployerNodes ? <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px" }}>
                        <div>Deployer nodes</div>
                        <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.deployerUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue"> {dataObject.deployerPassword}</span>
                            </div>
                        </div>
                        <div>
                            {deployerNodes.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                    id={"card1" +i}
                                    // key={"card1" + i}
                                    className="card"
                                    style={{ height: "auto", width: "600px", padding:"10px", backgroundColor: "#FFF" }}
                                    // autoResize={false}
                                    // selectable={false}
                                    // singleSelection={false}
                                    // selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Node Name</span>
                                            <span className="alignValue">{eve.nodeName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div> : null}


                    {databaseNodes ? <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px" }}>
                        <div>Database nodes</div>
                        <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.databaseUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue">   {dataObject.databasePassword}</span>
                            </div>
                        </div>
                        <div>
                            {databaseNodes.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                    id={"card1" +i}
                                    // key={"card1" + i}
                                    className="card"
                                    style={{ height: "auto", width: "600px", padding:"10px", backgroundColor: "#FFF" }}
                                    // autoResize={false}
                                    // selectable={false}
                                    // singleSelection={false}
                                    // selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Node Name</span>
                                            <span className="alignValue">{eve.nodeName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div> : null}




                    {workerNodes ? <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px" }}>
                        <div>Worker nodes</div>
                        <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.workerUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue">   {dataObject.workerPassword}</span>
                            </div>
                        </div>
                        <div>
                            {workerNodes.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                      id={"card1" +i}
                                      // key={"card1" + i}
                                      className="card"
                                      style={{ height: "auto", width: "600px", padding:"10px", backgroundColor: "#FFF" }}
                                    // autoResize={false}
                                    // selectable={false}
                                    // singleSelection={false}
                                    // selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Node Name</span>
                                            <span className="alignValue">{eve.nodeName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div> : null}


                    {controllerNode ? <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px" }}>
                        <div>Controller nodes</div>
                        <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.controllerUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue">   {dataObject.controllerPassword}</span>
                            </div>
                        </div>
                        <div>
                            {controllerNode.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                    id={"card1" +i}
                                    // key={"card1" + i}
                                    className="card"
                                    style={{ height: "auto", width: "600px", padding:"10px", backgroundColor: "#FFF" }}
                                    // autoResize={false}
                                    // selectable={false}
                                    // singleSelection={false}
                                    // selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Node Name</span>
                                            <span className="alignValue">{eve.nodeName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div> : null}


                    {processingNodes ? <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px", marginBottom: "20px" }}>
                        <div>Processing nodes</div>
                        <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.processingUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue">   {dataObject.processingPassword}</span>
                            </div>
                        </div>
                        <div>
                            {processingNodes.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                    id={"card1" +i}
                                    // key={"card1" + i}
                                    className="card"
                                    style={{ height: "auto", width: "600px", padding:"10px", backgroundColor: "#FFF" }}
                                    // autoResize={false}
                                    // selectable={false}
                                    // singleSelection={false}
                                    // selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Node Name</span>
                                            <span className="alignValue">{eve.nodeName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div> : null}


                    {storageNodes ? <div className="portalNodeContainer" style={{ marginTop: "20px", marginLeft: "15px", marginBottom: "20px" }}>
                        <div>Storage nodes</div>
                        <div id="userCredsContainer">
                            <div className="AppRowContainer">
                                <span className="alignContent">User name</span>
                                <span className="alignValue">  {dataObject.storageUserName}</span>
                            </div>
                            <div className="AppRowContainer">
                                <span className="alignContent">Password</span>
                                <span className="alignValue">   {dataObject.storagePassword}</span>
                            </div>
                        </div>
                        <div>
                            {storageNodes.map((eve, i) => <div key={i} style={{ marginTop: "10px" }}>
                                <div
                                      id={"card1" +i}
                                      // key={"card1" + i}
                                      className="card"
                                      style={{ height: "auto", width: "600px", padding:"10px", backgroundColor: "#FFF" }}
                                    // autoResize={false}
                                    // selectable={false}
                                    // singleSelection={false}
                                    // selectableCardSizeNotChanged={false}

                                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                    dataTest="cardcollection-card1"
                                >
                                    {/* {[renderPortalNode]} */}


                                    <div className="nodesContainer">
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Node Name</span>
                                            <span className="alignValue">{eve.nodeName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Host Name</span>
                                            <span className="alignValue">{eve.hostName}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.privateIP}</span>
                                        </div>
                                        <div className="AppRowContainer">
                                            <span className="alignContent">Private IP</span>
                                            <span className="alignValue">{eve.publicIP}</span>
                                        </div>
                                        {eve.status === "SUCCESS" ? <div>{SUCCESS_ICON}</div> : <div>{ERROR_ICON}</div>}
                                    </div>
                                </div>
                            </div>)}
                        </div>
                    </div> : null}


                    <div style={{ margin: "30px" }}>&nbsp;</div>

                </div>
            </div>
        );
    } else {
        result = (
            <div id={id} className="parentPanel">
                <div role="button" className="toggle-bar111" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="false">
                    <span>Name</span> &nbsp; | &nbsp; <span>{dataObject.applicationType}</span> &nbsp; |&nbsp;<span>{dataObject.application}</span>
                    <span className="chevron-indicator">
                        <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                    </span>
                </div>
            </div>
        );
    }
    return result;
};




Item.propTypes = {
    id: PropTypes.string,
    onDelete: PropTypes.func
};

Item.defaultProps = {
    id: undefined,
    onDelete: undefined
};










class Onboard extends React.Component {

    constructor(props) {
        super(props);
        this.handler = this.handler.bind(this);
        this.onClickOfAppButton = this.onClickOfAppButton.bind(this)
        this.state = {
            applicationNames: [],
            onclickofAppbtnflag: false,
            showSheet: false,
            sheetMode: 'create',
            exitEditMsg: 'All current information will be lost if you exit.',
            showExitDialog: false,
            configuredApps: [],
            panel1Expanded: false,
            childPanels: [],
            editFlag: false,
            onSavedialogue: false

        }
        this.getAppNames();
        this.getConfiguredApps();
    }

    getAppNames = () => {
        // axios('http://127.0.0.1:8081/getOnboardAppNames', {
        //     method: 'post',
        //     headers: { 'Content-Type': 'application/json' }
        // })
        //http://10.143.113.44:8082/config/onboard/getappnames
      //axios('https://mda360.mdaupdate.insights.dyn.nesc.nokia.net/config/onboard/getappnames', {
        axios(configData.API.SERVICE.ONBOARD_APPNAMES, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => {
            this.setState({ applicationNames: response.data },()=>{
                console.log("Hi", this.state.applicationNames);
            });

           
        })
            .catch(error => this.setState({ error }));
    }


    getConfiguredApps = () => {
        axios( configData.API.SERVICE.ONBAORD_SUMMARY, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            this.setState({ configuredApps: response.data });
            configuredApplications = response.data;
            for (let i = 0; i < response.data.length; i++) {
                configuredApplications[i].isOpen = false;
                configuredApplications[i].id = uniqueId('csfWidgets-expansionpanel-child-');
                this.state.configuredApps[i].isOpen = false;
                this.state.configuredApps[i].id = uniqueId('csfWidgets-expansionpanel-child-');
            }
            console.log("onboard apps", configuredApplications);

            this.setState({ childPanels: configuredApplications })
       
            // for(let i=0,i)
            // childPanels.push({})
            // this.setState({ applicationNames: response.data })
        })
            .catch(error => this.setState({ error }));
    }

    onClickOfAppButton = (event) => {
        console.log("event of buttons", event)
        if (event.target.innerText === "CXM" || "ISA" || "MNI" || "MZ RTB" || "DR RTB") {
            appName = event.target.innerText;
            editUserModel.application = event.target.innerText;
            this.setState({ onclickofAppbtnflag: true, clickedAppName: event.target.innerText });

        }
    }

    UIforButtons() {
        return this.state.applicationNames.map((eve, i) =>
            <div key={i} style={{ marginLeft: "0px", marginTop: "10px" }}>
                {/* <Button id={eve.value} dataTest={eve.value} value={eve.value} text={eve.value} style={{ width: "120px", color: "black", margin: "15px", boxShadow: "1px 1px 1px 1px lightgrey" }} onClick={this.onClickOfAppButton} aria-label="text" /> */}
                <div id={eve.appName} onClick={this.onClickOfAppButton} className="onboardAppNamesDiv">{eve.appName}</div>

            </div>)
    }

    onClickofDialog = () => {

    }

    onCloseOfDialog = (event) => {
        this.setState({ onclickofAppbtnflag: false, isNonCSFP: false, isCSFP: false })
        console.log("appbtn", this.state.onclickofAppbtnflag);
    }
    handler(data) {
        const newState = {};
        if (data !== '' && this.state.showExitDialog === false) {
            newState.showExitDialog = true;
        } else if (data === '' && this.state.showExitDialog === true) {
            newState.showExitDialog = false;
        }
        if (data !== this.lastInputData) {
            this.lastInputData = data;
            newState.exitEditMsg = 'Changes made on this page will be lost if you continue.';
        } else {
            newState.exitEditMsg = 'All current information will be lost if you exit.';
        }
        this.setState(newState)
        this.forceUpdate();
    }
    onFinish = (e) => {
        console.log("e is", e)

        const portals = [];
        portals.push(editUserModel.CSFPmandtryPortalnodes)
        for (let i = 0; i < editUserModel.listOfPortalNodes.length; i++) {
            portals.push(editUserModel.listOfPortalNodes[i])
        };
        console.log("portals", portals);
        const edgenodes = [];
        edgenodes.push(editUserModel.CSFPmandatoryEdgeNodes)
        for (let i = 0; i < editUserModel.listOfEdgeNodes.length; i++) {
            edgenodes.push(editUserModel.listOfEdgeNodes[i])
        };
        console.log("edgenodes", edgenodes);
        const deployernodes = [];
        deployernodes.push(editUserModel.CSFPmandatoryDeployerNodes)
        for (let i = 0; i < editUserModel.listOfDeployerNodes.length; i++) {
            deployernodes.push(editUserModel.listOfDeployerNodes[i])
        };
        console.log("edgenodes", deployernodes);
        const workernodes = [];
        workernodes.push(editUserModel.CSFPmandatoryWorkerNodes)
        for (let i = 0; i < editUserModel.listOfWorkerNodes.length; i++) {
            workernodes.push(editUserModel.listOfWorkerNodes[i])
        };
        console.log("edgenodes", workernodes);
        const controllernodes = [];
        controllernodes.push(editUserModel.CSFPmandatoryControllerNodes)
        for (let i = 0; i < editUserModel.listOfControllerNodes.length; i++) {
            controllernodes.push(editUserModel.listOfControllerNodes[i])
        };
        console.log("edgenodes", controllernodes);
        const storagenodes = [];
        storagenodes.push(editUserModel.CSFPmandatoryStorageNodes)
        for (let i = 0; i < editUserModel.listOfStorageNodes.length; i++) {
            storagenodes.push(editUserModel.listOfStorageNodes[i])
        };
        console.log("edgenodes", storagenodes);


        //noncsfp
        const noncspPortalnodes = [];
        noncspPortalnodes.push(editUserModel.NonCSFPmandatoryPortalnodes)
        for (let i = 0; i < editUserModel.listOfNonCSFPportalNodes.length; i++) {
            noncspPortalnodes.push(editUserModel.listOfNonCSFPportalNodes[i])
        };
        console.log("edgenodes", noncspPortalnodes);

        const noncspDatabasenodes = [];
        noncspDatabasenodes.push(editUserModel.NonCSFPmandatoryDatabaseNodes)
        for (let i = 0; i < editUserModel.listofNonCSFPdatabasenodes.length; i++) {
            noncspDatabasenodes.push(editUserModel.listofNonCSFPdatabasenodes[i])
        };
        console.log("edgenodes", noncspDatabasenodes);
        const noncspProcessingnodes = [];
        noncspProcessingnodes.push(editUserModel.NonCSFPmandatoryProcessNodes)
        for (let i = 0; i < editUserModel.listOfNonCSFPprocessingNodes.length; i++) {
            noncspProcessingnodes.push(editUserModel.listOfNonCSFPprocessingNodes[i])
        };
        console.log("edgenodes", noncspProcessingnodes);
        const noncspdeployernodes = [];
        noncspdeployernodes.push(editUserModel.NonCSFPmandatoryDeployerNodes)
        for (let i = 0; i < editUserModel.listOfNonCSFPDeployerNodes.length; i++) {
            noncspdeployernodes.push(editUserModel.listOfNonCSFPDeployerNodes[i])
        };
        console.log("edgenodes", noncspdeployernodes);


        let payload;
        if (editUserModel.applicationType === "CSFP") {
            payload = {
                "application": editUserModel.application,
                "applicationType": editUserModel.applicationType,
                "Name": editUserModel.CSFPnameText,
                "applicationNameSpace": editUserModel.CSFPapplicationNameSpace,
                // "portalUserName": editUserModel.PortalUserName,
                // "portalPassword": editUserModel.PortalPassword,
                "portalsNode": portals,
                "edgeUserName": editUserModel.edgeNodeUserName,
                "edgePassword": editUserModel.edgeNodePassword,
                "edgeNodes": edgenodes,
                "workerUserName": editUserModel.workerNodeUserName,
                "workerPassword": editUserModel.workerNodePassword,
                "workerNodes": workernodes,
                "controllerUserName": editUserModel.controllerUserName,
                "controllerPassword": editUserModel.controllerPassword,
                "controllers": controllernodes,
                "storageUserName": editUserModel.storageNodeUserName,
                "storagePassword": editUserModel.storageNodePassword,
                "storageNodes": storagenodes

            }
        }
        else if (editUserModel.applicationType === "Non-CSFP") {

            payload = {
                "application": editUserModel.application,
                "applicationType": editUserModel.applicationType,
                "Name": editUserModel.NonCSFPnameText,
                "applicationNameSpace": editUserModel.NonCSFPapplicationNameSpace,
                // "portalUserName": editUserModel.NonCSFPPortalUserName,
                // "portalPassword": editUserModel.NonCSFPPortalPassword,
                "portalsNode": noncspPortalnodes,
                "databaseUserName": editUserModel.NonCSFPDatabaseUserName,
                "databasePassword": editUserModel.NonCSFPDatabasePassword,
                "databaseNodes": noncspDatabasenodes,
                "processingUserName": editUserModel.NonCSFPProcessingUserName,
                "processingPassword": editUserModel.NonCSFPProcessingPassword,
                "processingNodes": noncspProcessingnodes,
                "deployerUserName": editUserModel.NonCSFPDeployerUserName,
                "deployerPassword": editUserModel.NonCSFPDeployerPassword,
                "deployernodes": noncspdeployernodes,

            }
        }
        console.log("payload",JSON.stringify(payload));

        // http.post('http://127.0.0.1:8081/saveApplicationDetails', { payload })
      //  http.post('http://10.143.113.44:8082/config/onboard/save', { payload })


        // axios('http://10.143.113.44:8082/config/onboard/save', {
        //     method: 'post',
        //     headers: {'Content-Type': 'application/json' },
        //     payload
        // })
        
   //  http.post('https://mda360.mdaupdate.insights.dyn.nesc.nokia.net/config/onboard/save', { payload })

   //http.post('https://default.mdaupdate.insights.dyn.nesc.nokia.net/config/onboard/save', { payload })
   http.post(configData.API.SERVICE.ONBOARD_SAVE,  payload )
  
   // http.post('http://10.143.113.44:8082/config/onboard/save',  JSON.stringify(payload) )
      // http.post('http://127.0.0.1:8081/saveApplicationDetails', JSON.stringify(payload))
       
    //   axios('http://10.143.113.44:8082/config/onboard/save', {
    //     method: 'post',
    //     headers: { 'Content-Type': 'application/json' },
    //     payload: payload
    // })
    .then(response => {
                let data = response;
                console.log("data", data);
                //editUserModel={}
                this.setState({ onSavedialogue: true });
                editUserModel.application = '';
                editUserModel.applicationType = '';
                editUserModel.uploadDataFile = '';
                editUserModel.CSFPnameText = '';
                editUserModel.CSFPapplicationNameSpace = '';
                editUserModel.NonCSFPnameText = '';
                editUserModel.NonCSFPapplicationNameSpace = '';
                editUserModel.CSFPmandtryPortalnodes = { portalName: '', portalURL: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.CSFPmandatoryEdgeNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.CSFPmandatoryDeployerNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.CSFPmandatoryWorkerNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.CSFPmandatoryControllerNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.CSFPmandatoryStorageNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.NonCSFPmandatoryPortalnodes = { portalName: '', portalURL: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.NonCSFPmandatoryDatabaseNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.NonCSFPmandatoryProcessNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.NonCSFPmandatoryDeployerNodes = { nodeName: '', hostName: '', privateIP: '', publicIP: '' };
                editUserModel.listOfPortalNodes = [];
                editUserModel.listOfEdgeNodes = [];
                editUserModel.listOfControllerNodes = [];
                editUserModel.listOfDeployerNodes = [];
                editUserModel.listOfStorageNodes = [];
                editUserModel.listOfWorkerNodes = [];
                editUserModel.listOfNonCSFPDeployerNodes = [];
                editUserModel.listOfNonCSFPportalNodes = [];
                editUserModel.listofNonCSFPdatabasenodes = [];
                editUserModel.listOfNonCSFPprocessingNodes = [];
                // editUserModel.PortalUserName = '';
                // editUserModel.PortalPassword = '';
                editUserModel.edgeNodeUserName = '';
                editUserModel.edgeNodePassword = '';
                editUserModel.workerNodeUserName = '';
                editUserModel.workerNodePassword = '';
                editUserModel.controllerPassword = '';
                editUserModel.controllerUserName = '';
                editUserModel.storageNodeUserName = '';
                editUserModel.storageNodePassword = '';
                editUserModel.deployerNodeUserName = '';
                editUserModel.deployerNodePassword = '';
                // editUserModel.NonCSFPPortalUserName = '';
                // editUserModel.NonCSFPPortalPassword = '';
                editUserModel.NonCSFPDatabaseUserName = '';
                editUserModel.NonCSFPDatabasePassword = '';
                editUserModel.NonCSFPProcessingUserName = '';
                editUserModel.NonCSFPProcessingPassword = '';
                editUserModel.NonCSFPDeployerUserName = '';
                editUserModel.NonCSFPDeployerPassword = '';
                editUserModel.validationflagcolor = false;
                editUserModel.editflagofform3 = false;
                editUserModel.form1Complete = false;
                editUserModel.form2Complete = false;
                editUserModel.form3Complete = true;
                editUserModel.uploadDataFile = "";


            })
            .catch(error => this.setState({ error }));

    }

    onclosedialogue = (e) => {
        console.log("e", e);
        this.setState({ onSavedialogue: false, onclickofAppbtnflag: false, isNonCSFP: false, isCSFP: false })
    }

    actionFunc = (e) => {
        this.setState({ onclickofAppbtnflag: false, isNonCSFP: false, isCSFP: false })
    }
    onExit = (data) => {
        console.log('onExit:', data);
        this.setState({ showSheet: false });
        this.setState({ onclickofAppbtnflag: false });
        this.setState({ editFlag: false })
        editUserModel.editflagofform3 = false;
        editUserModel = []
    };

    onCancel = (data) => {
        if (!this.state.showExitDialog) {
            this.setState({ showSheet: false });
        }
    }
    //   toggle = id => (event) => {
    //     if (event.type === 'click' || event.key === ' ' || event.key === 'Enter') {
    //       event.preventDefault(); // stop scroll down with space bar
    //       const panel = `${id}Expanded`;
    //       this.setState({ [panel]: !this.state[panel] });
    //     }
    //   }

    toggle = (event) => {
        const copyChildPanels = this.state.childPanels.slice();
        copyChildPanels[event.value].isOpen = event.type === 'onExpand';
        this.setState({
            childPanels: copyChildPanels
        });
    }
    onChange = (e) => {
        const { data, value } = e;
        this.setState({ [data.modelId]: value });
    }

    togglePanel = id => (event) => {
        if (event.type === 'click' || event.key === ' ' || event.key === 'Enter') {
            const { childPanels } = this.state;
            const itemIndex = childPanels.findIndex(item => item.id === id);
            const newItems = [...childPanels];
            newItems[itemIndex].isOpen = !childPanels[itemIndex].isOpen;
            this.setState({ childPanels: newItems });
        }
    }

    onEditClick = data => (event) => {
            // console.log("event", event);
            // console.log("edit App", data);
            // formErrors = {};
            // this.setState({ showSheet: true, sheetMode: 'edit' });
            // this.setState({ editFlag: true });
            // editUserModel.editflagofform3 = true;
            // editUserModel.applicationType = data.applicationType;

    }

    onDeleteClick = data => (event) => {
        console.log("delete", event)
    }
    dynamicUIforOnloadApps() {
        const {
            panel1Expanded
        } = this.state;
        return (this.state.configuredApps.map((eve, i) =>
            <div key={i} style={{ marginLeft: "15px", marginTop: "15px", border: "1px soliday grey" }} >
                {eve.application}
            </div>))
    }

    UIforConfiguredApps() {

console.log("this.childpanel",this.state.childPanels.length)

        const {
            panel1Expanded
        } = this.state;
        return (
            <div>
                <div style={{ marginLeft: "15px", fontSize: "20px" }}>Applications Configured</div>

                {/* {this.dynamicUIforOnloadApps()} */}

{this.state.childPanels.length>0?
                <div className="expansion-panel-standard111">
                    <ExpansionPanel showExpansionGap={"true"} height={30}  areBordersVisible={false} isShadowVisible={false}
                  expandedHeight={180} onExpand={this.toggle} onCollapse={this.toggle} hideDefaultControl>
                        {(this.state.childPanels).map((data, i) => (
                            //   <Item id={data.id} key={data.id} name={data.name} tel={data.tel} onDelete={() => this.deleteHandler(i)} isOpen={data.isOpen} togglePanel={this.togglePanel(data.id)} />
                            <Item id={data.id} key={data.id} name={data.Name}  dataObject={data} isOpen={data.isOpen} togglePanel={this.togglePanel(data.id)} onEditClick={this.onEditClick(data)} onDeleteClick={this.onDeleteClick(data)} />


                        ))}
                    </ExpansionPanel>
                </div>
                :
                <div style={{marginTop:"15px",marginLeft:"15px"}}>Please select applications from above to add new application type.</div>}
            </div>
        )
    }


    render() {

        this.form1 = (
            <OnboardForm1 title="Application Type" handler={this.handler} />
        );

        this.form2 = (
            <OnboardForm2 title="Upload" handler={this.handler} />
        );

        this.form3 = (
            <OnboardForm3 title="Verify" handler={this.handler} />
        );
        this.form4 = (
            <OnboardForm3 key="form4" handler={this.handler} />
        )


        const saveBtnDisabled = !editUserModel.form3Complete;

        const children = [this.form4]
        return (

            <div>
                <div style={{ margin: "15px", marginBottom: "0px", fontSize: "20px" }}> Applications in Scope</div>
                <div style={{ marginLeft: "0px", display: "flex", flex: "1" }}>
                  {this.UIforButtons()}
                </div>
                <div>
                   {this.state.childPanels?this.UIforConfiguredApps():null}
                </div>
                <div>
                    {this.state.onclickofAppbtnflag ?
                        <div>
                            <Dialog id="dialogofOnboard" scroll={true} title={appName} height={600} width={1300}
                                header trapFocus={false} close onClick={this.onClickofDialog} onClose={this.onCloseOfDialog.bind(this)}>

                                <div>
                                    <VerticalStepWizard
                                        id="basicWizard"
                                        saveBtnText="SAVE"
                                        finishBtnText="FINISH"
                                        cancelBtnText="CANCEL"
                                        exitCancelBtnText="CANCEL"
                                        exitExitBtnText="YES"
                                        continueBtnText='CONTINUE'
                                        exitTitle={text('exitTitle', 'Are you sure you want to exit the step form?')}
                                        exitMsg={text('exitMsg', 'All current information will be lost if you exit before finishing.')}
                                        exitExitBtnText={text('exitExitBtnText', 'EXIT')}
                                        exitCancelBtnText={text('exitCancelBtnText', 'CANCEL')}
                                        children={[this.form1, this.form2, this.form3]}
                                        continueBtnDisabledArray={[!editUserModel.form1Complete, !editUserModel.form2Complete, !editUserModel.form3Complete]}
                                        handler={this.handler}
                                        onFinish={this.onFinish}
                                        displayMode={this.props.displayMode}
                                        onExit={this.onExit}
                                        onCancel={this.onCancel}
                                    /></div>
                                {this.state.onSavedialogue ? <div>
                                    {/* <AlertDialogInfo id="alertDialogInfo" title="Information" infoText="This data has been saved successfully"
       onClose={this.onclosedialogue} trapFocus={false} focusDialog={false}/> */}
                                    {/* <Snackbar id="snackbarID" 
        dataList={[{message: "This data has been saved successfully", action: "Action", actionFunc: {actionFunc()}}] }
        /> */}
                                    {/* <Snackbar id="snackbarID" dataList={[{message: "This data has been saved successfully",action: "ok",actionFunc:this.onclosedialogue}]}
     /> */}
                                    <AlertDialogInfo id="alertDialogInfo" title="Information" infoText="This data has been saved successfully."
                                        onClose={this.onclosedialogue} trapFocus={false} focusDialog={false} />
                                </div> : null}

                            </Dialog>
                        </div> : null}




                    {this.state.editFlag ?
                        <div>
                            <Dialog id="dialogofOnboard2" scroll={true} title={editUserModel.applicationType} height={600} width={1255}
                                header trapFocus={false} close onClick={this.onClickofDialog} onClose={this.onCloseOfDialog.bind(this)}>

                                <div>

                                    <VerticalStepWizard
                                        id="basicWizard"
                                        saveBtnText="SAVE"
                                        finishBtnText="FINISH"
                                        cancelBtnText="CANCEL"
                                        exitCancelBtnText="CANCEL"
                                        exitExitBtnText="YES"
                                        continueBtnText='CONTINUE'
                                        exitTitle={text('exitTitle', 'Are you sure you want to exit the step form?')}
                                        exitMsg={text('exitMsg', 'All current information will be lost if you exit before finishing.')}
                                        exitExitBtnText={text('exitExitBtnText', 'EXIT')}
                                        exitCancelBtnText={text('exitCancelBtnText', 'CANCEL')}
                                        children={[this.form1, this.form3]}
                                        continueBtnDisabledArray={[!editUserModel.form3Complete]}
                                        handler={this.handler}
                                        onFinish={this.onFinish}
                                        displayMode={this.props.displayMode}
                                        onExit={this.onExit}
                                        onCancel={this.onCancel}
                                        onFinish={this.onFinish}
                                    />




                                </div>


                            </Dialog>
                        </div>
                        : null}
                </div>
            </div>

        )
    }




}
export default Onboard;