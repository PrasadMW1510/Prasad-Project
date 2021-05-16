import React from 'react';
import { Button, AlertDialogConfirm,ProgressIndicatorCircular,SvgIcon, Dialog, CheckBoxGroup, CheckBox, AlertDialogInfo } from '@nokia-csf-uxr/csfWidgets';
import '../../Styles/RoleManagement.css';
import axios from "axios";
import qs from 'query-string';
import http from '../service';
import configData from "../../Config.json";


const ADD_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_add_circle" iconColor="#124191" />;
const EDIT_ICON = <SvgIcon key="icon_edit" icon="ic_edit" iconHeight="24px" iconWidth="24px" iconColor="#124191" />;
const DELETE_ICON = <SvgIcon key="icon-success" iconHeight="24px" iconWidth="24px" icon="ic_delete" iconColor="red" />;
const REMOVE_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_remove_circle_outline" iconColor="red" />;


const defaultRoleForm = {
    userTobeEdited: '',
}


let roleForm = defaultRoleForm;
var deleteRolename;

class RoleManagement extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            onloadData: [],
            onEditEnable: false,
            toAllPermission: [],
            permisisonsAdded: [],
            addNewBoolean: false,
            allRoles: [],
            selectedRoles: [],
            editPermissionList: [],
            checkedarrayvalues: [],
            onSavEditdialog: false,
            onSaveAddDialog: false,
            recordDeleted: false,
            recordDeleteMessage: '',
            selectedRoles: [],
            progressbar:false,
            confirmcancel:false,
            SynErrorFromServer:false,
            synchroniseErrorMsg:''
        }
     //   this.getallRolesFromKeycloak();
        this.getOnloadRoleData();
        this.getsAllPermissionsavailable();
    }

    getOnloadRoleData() {
        // axios('http://127.0.0.1:8081/getonloadJSONRoleMngmnt', {
           
        axios(configData.API.SERVICE.ROLES_ONLOAD, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            this.setState({progressbar:false});
            this.setState({ onloadData: response.data }, () => { console.log("onload data", this.state.onloadData) });

        })
            .catch(error => this.setState({ error }));
    }

    // getallRolesFromKeycloak() {
    //     var payload = {
    //         grant_type: configData.keycloakApiDetails.grant_type,
    //         username: configData.keycloakApiDetails.username,
    //         password: configData.keycloakApiDetails.password,
    //         client_id: configData.keycloakApiDetails.client_id
    //     }

    //     http.post('http://localhost:8080/auth/realms/master/protocol/openid-connect/token',
    //         qs.stringify(payload)
    //     ).then(response => {
    //         console.log("Response", response);
    //         const token = response.data.access_token;
    //         console.log("token of getroles", response.data.access_token)
    //         const config = {
    //             Authorization: `Bearer ${token}`
    //         };
    //         console.log("token", token);
    //         console.log("config", config)
    //         axios('http://localhost:8080/auth/admin/realms/Mda/roles', {
    //             method: 'get',
    //             headers: config
    //         }).then(response => {
    //             console.log("Key cloak test to all roles", response.data)
    //             let data = response.data;
    //             data.forEach((rolename) => {
    //                 (this.state.allRoles).push(rolename.name);
    //             })
    //             console.log("all roles", this.state.allRoles)
    //         })
    //             .catch(error => this.setState({ error }));

    //     }
    //     ).catch(error => {
    //         console.log("Error", error.response);

    //     })
    // }


    getsAllPermissionsavailable() {
        //  axios('http://127.0.0.1:8081/getAllPermissionsavailable', {
        axios(configData.API.SERVICE.ROLES_GETALL_PRIVILGES, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            this.setState({ toAllPermission: response.data.privileges });
            console.log("all permissions", this.state.toAllPermission)
        })
            .catch(error => this.setState({ error }));
    }
    onAddnewRole = (e) => {
        console.log("add new role", e);
      this.setState({progressbar:true});
        
        axios(configData.API.SERVICE.ROLES_SYNCHRONISATION, {
            method: 'get',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {

            this.getOnloadRoleData();
        })
        .catch(error => this.setState({progressbar:false,SynErrorFromServer:true,synchroniseErrorMsg:"Internal Server Error" }));
    }
    
    onClose = () => {
        this.setState({
            onEditEnable: false
        })
    }
    remove(arr, what) {
        var found = arr.indexOf(what);

        while (found !== -1) {
            arr.splice(found, 1);
            found = arr.indexOf(what);
        }
    }
    oncloseSyncErrorPopupEdited=()=>{
        this.setState({SynErrorFromServer:false})
   }
    onAddClick = (data, e) => {
        console.log("data on click of add",data)
        this.remove(this.state.toAllPermission, data);
        console.log("this.state.toallpermissions",this.state.toAllPermission);
        (this.state.permisisonsAdded).push(data);
        (this.state.editPermissionList).push(data);
       this.forceUpdate();
    }
    onRemoveClick = (data, e) => {
        console.log("data on click of remove", data);
        this.remove(this.state.permisisonsAdded, data);
        this.remove(this.state.editPermissionList, data);
        console.log("this.state.toallpermissions", this.state.toAllPermission);
        (this.state.toAllPermission).push(data);
        this.forceUpdate();
    }
    onEditClick = data => (e) => {
        console.log("edit", e);
        console.log("edit", data);
        this.setState({ onEditEnable: true });
        roleForm.userTobeEdited = data.role.roleName;
        console.log("role usertobeedited", roleForm.userTobeEdited)
       
        const myArray = this.state.toAllPermission
        const myFilter = data.privileges
        console.log("myArray", myArray);
        console.log("myFilter", myFilter);
        const result = myArray.filter(md =>
            myFilter.every(fd => fd.id !== md.id));
        console.log("myfilteredArray", result)
        this.setState({ editPermissionList: data.privileges, toAllPermission: result })

    }

    onDeleteClick = data => (e) => {
        console.log("ondelete", data.role.roleName)
        deleteRolename = data.role.roleName;
        this.setState({confirmcancel:true});
        }
    onCancelEdit = (e) => {
        this.setState({
            onEditEnable: false
        })
    }
    oncloseDeletePopupEdited = (e) => {
        this.setState({ recordDeleted: false ,confirmcancel:false})
    }
    onSaveEdit = (e) => {

        let privilgeId = [];
        for (var i = 0; i < this.state.editPermissionList.length; i++) {
            privilgeId.push(this.state.editPermissionList[i].id);
        }
        console.log("ids", privilgeId);

        let payload = {
            "roleName": roleForm.userTobeEdited,
            "privilegeIds": privilgeId
        }

        let payload1 = JSON.stringify(payload);
        console.log("paylpoad", payload1)
        http.post(configData.API.SERVICE.ROLES_EDIT_SAVE, {
            "roleName": roleForm.userTobeEdited,
            "privilegeIds": privilgeId
        })
            .then(response => {
                console.log("on save edit roles", response);
                this.setState({ onSavEditdialog: true });
                this.getOnloadRoleData();
            })
            .catch(error => this.setState({ error }));
    }
    onCancelAddnewRole = (e) => {
        this.setState({ addNewBoolean: false });
    }
    onSaveAddNewRole = (e) => {
        console.log("on save add new Role", e)
        let payload = this.state.selectedRoles;
        //  payload.push(this.state.selectedRoles);
        console.log("payload", payload);
        http.post(configData.API.SERVICE.ROLES_NEWROLES_SAVE, { roles: this.state.selectedRoles })
            .then(response => {
                console.log("on save edit roles", response);
                this.setState({ onSavEditdialog: true });
            })
            .catch(error => this.setState({ error }));
    }

    checkBoxOnChange = (e) => {
        console.log(e);
        this.setState({ checkedarrayvalues: e.value });
        console.log("selected roles", this.state.checkedarrayvalues);
        console.log("type of selected roles", this.state.checkedarrayvalues);
        var keys = [];
        const objectArray = Object.entries((this.state.checkedarrayvalues));
        objectArray.forEach(([key, value]) => {
            console.log(key); // 'one'
            console.log(value); // 1
            if (value === true) {
                keys.push(key)
            }
            else {
                console.log("");
            }
        });
        console.log("selectedRoles", keys)
        this.setState({ selectedRoles: keys })
    }

    onclosePopupEdited = () => {
        this.setState({ onSavEditdialog: false, onEditEnable: false })
    }
    onclosePopupSaveRole = () => {
        this.setState({ onSavEditdialog: false, addNewBoolean: false })
    }

    onCloseConfirmationDelete=()=>{
this.setState({confirmcancel:false})
    }

    onConfirmofdelete=()=>{
        const params = {
            rolename: deleteRolename
        }

        http.get(configData.API.SERVICE.ROLES_DELETE, { params })
            .then(response => {
                console.log("on delete roles", response);
                this.setState({ recordDeleted: true, recordDeleteMessage: "Record deleted successfully" })
                this.getOnloadRoleData();
                //this.setState({ onSaveAddNewRole: true });
            })
            .catch(error =>
                this.setState({ recordDeleted: true, recordDeleteMessage: "Error occurred while deleting" }));
   
    }
    renderFooterforEdit = () => {
        return (
            <div>
                <Button id="cancel" text="CANCEL" aria-label="Cancel" onClick={this.onCancelEdit} />
                <Button id="save" text="SAVE" aria-label="Save" isCallToAction onClick={this.onSaveEdit} />
            </div>
        )
    }
    renderFooterforNewRole = () => {
        return (
            <div>
                <Button id="cancel" text="CANCEL" aria-label="Cancel" onClick={this.onCancelAddnewRole} />
                <Button id="save" text="SAVE" aria-label="Save" isCallToAction onClick={this.onSaveAddNewRole} />
            </div>
        )
    }
    editDialogUI() {
        return (
            <div>
                <Dialog id="RolePopup" title={roleForm.userTobeEdited} height={500} width={600}
                    renderFooter={this.renderFooterforEdit}
                    header trapFocus={false} close onClose={this.onClose.bind(this)}
                >
                    <div >
                        <div style={{ display: "flex", flex: "1", justifyContent: "space-between" }}>
                            <div style={{ width: "auto", marginBottom: "10px", marginTop: "10px" }}> All Permissions </div>
                            <div style={{ width: "auto", marginBottom: "10px", marginTop: "10px", marginRight: "86px" }}> Permissions added </div>
                        </div>
                        <div style={{ display: "flex", flex: "1", justifyContent: "space-between" }}>

                            <div style={{ border: "1px solid grey", width: "fit-content", marginBottom: "30px" }}>
                                {this.state.toAllPermission.map((eve, i) => {
                                    return (
                                        <div key={i} style={{ margin: "10px", border: "1px solid grey", paddingTop: "12px", width: "200px", height: "45px", borderRadius: "40px", display: "flex", flex: "1", justifyContent: "space-between" }}>
                                            <label style={{ textAlign: "left", padding: "2px", paddingLeft: "28px" }}>{eve.privilegeName}</label>
                                            <div style={{ marginRight: "10px", paddingTop: "2px", cursor: "pointer" }} onClick={this.onAddClick.bind(this, eve)} >{ADD_ICON}</div>

                                        </div>)
                                })}


                            </div>
                            <div style={{ border: "1px solid grey", width: "fit-content", marginBottom: "30px" }}>
                                {this.state.editPermissionList.map((eve, i) => {
                                    return (
                                        <div key={i} style={{ margin: "10px", border: "1px solid grey", paddingTop: "12px", width: "200px", height: "45px", borderRadius: "40px", display: "flex", flex: "1", justifyContent: "space-between" }}>
                                            <label style={{ textAlign: "left", padding: "2px", paddingLeft: "28px" }}>{eve.privilegeName}</label>
                                            {!(eve.id ===configData.TABS_PRIVILIGES_IDS.INTEGRATED_VIEW) && !(eve.id === configData.TABS_PRIVILIGES_IDS.ALERTS_NOTIFICATIONS_VIEW) ? <div style={{ marginRight: "10px", paddingTop: "2px", cursor: "pointer" }} onClick={this.onRemoveClick.bind(this, eve)} >{REMOVE_ICON}</div> : null}

                                        </div>)
                                })}


                            </div>






                        </div>
                        <div style={{ height: "20px" }}></div>
                    </div>


                    {this.state.onSavEditdialog ? <div>
                        <AlertDialogInfo id="alertDialogInfo" title="Information" infoText="This data has been saved successfully."
                            onClose={this.onclosePopupEdited} trapFocus={false} focusDialog={false} />
                    </div> : null}
                </Dialog>


            </div>
        )
    }


    addnewRoleUI() {
        return (
            <div>
                <Dialog id="AddnewRolePopup" title="User Role" height={500} width={300}
                    renderFooter={this.renderFooterforNewRole}
                    header trapFocus={false} close onClose={this.onClose.bind(this)}
                >
                   
                    <div style={{ marginTop: "0px", marginLeft: "0px" }}>
                        {/* <div> &nbsp; </div> */}
                        <CheckBoxGroup id="checkBoxGroup" label="Select Roles" onChange={this.checkBoxOnChange} values={this.state.checkedarrayvalues} errorMsg="" minWidth={240} maxWidth={500}>
                            {this.state.allRoles.map((eve, i) => <CheckBox id={eve} name={eve} label={eve} style={{ margin: "15px" }}
                            />)}
                        </CheckBoxGroup>

                    </div>
                    {this.state.onSavEditdialog ? <div>
                        <AlertDialogInfo id="alertDialogInfo" title="Information" infoText="This data has been saved successfully."
                            onClose={this.onclosePopupSaveRole} trapFocus={false} focusDialog={false} />
                    </div> : null}
                </Dialog>
            </div>
        )
    }



    render() {
        return (
            <div>
                <div style={{ display: "flex", flex: "1", justifyContent: 'space-between' }}>
                    <div style={{ margin: "15px", fontSize: "21px" }}> Role </div>
                    <div style={{ margin: "15px" }}><Button id="New" text="Synchronize"  onClick={this.onAddnewRole} isCallToAction /> </div>
                </div>
                {this.state.progressbar?<div><ProgressIndicatorCircular id="progressIndicatorCircularID" spinner="right" className="" overlay
        css={{small: false, medium: true, large: false, xlarge: false, xxlarge: false}}/></div>:''}

                {this.state.onloadData.map((eve, i) =>
                    <div key={i} style={{ border: "1px solid whitesmoke", height: "auto", boxShadow: "1px 1px 1px 1px lightgrey", margin: "15px", borderRadius: "3px" }}>
                        <div style={{ display: "flex", flex: "1" }}>
                            <div style={{ margin: "15px", fontSize: "18px", display: "flex", flex: "1" }}> {eve.role.roleName} </div>

                            {!(eve.role.id ===  configData.ROLE_IDS.ADMIN)?<div onClick={this.onEditClick(eve)} style={{ width: "20px", margin: "15px", cursor: "pointer", justifyContent: 'left' }}>{EDIT_ICON}</div>:null}
                            {/* {!(eve.role.id === configData.ROLE_IDS.INTEGRATION_USER) && !(eve.role.id === configData.ROLE_IDS.OPERATION_USER)&& !(eve.role.id === configData.ROLE_IDS.CARE_USER) && !(eve.role.id === configData.ROLE_IDS.ADMIN) ? <div onClick={this.onDeleteClick(eve)} style={{ width: "20px", margin: "15px", cursor: "pointer" }}>{DELETE_ICON}</div> : null} */}

                        </div>

                        <div style={{ margin: "15px", display: "flex", height: "auto", flex: "1", flexWrap: "wrap" }}>
                            <div>Permissions:</div>
                            <div style={{ display: "flex", height: "auto", flex: "1", flexWrap: "wrap" }}>
                                {this.state.onloadData[i].privileges.map((eve, i) => <div className="permissions">
                                    {eve.privilegeName}</div>
                                )}
                            </div>
                        </div>
                    </div>

                )}


                {this.state.onEditEnable ? <div>{this.editDialogUI()}</div> : null}

                {this.state.addNewBoolean ? <div>{this.addnewRoleUI()}</div> : null}
                {this.state.confirmcancel?<AlertDialogConfirm id="alertDialogConfirm" title="Do you want to delete theis role?" confirmationText1="This role will be deleted permanently"
                  confirmationButtonLabel="DELETE" onClose={this.onCloseConfirmationDelete} onConfirm={this.onConfirmofdelete}
               trapFocus={false} focusDialog={false} detailsText="" />:''}
                  {this.state.SynErrorFromServer?
                  <AlertDialogInfo id="SynchroniseError" title="Information" infoText={this.state.synchroniseErrorMsg}
                   onClose={this.oncloseSyncErrorPopupEdited} trapFocus={false} focusDialog={false} />
                    :''}

                {this.state.recordDeleted ? <div>
                    <AlertDialogInfo id="deletedPopup" title="Information" infoText={this.state.recordDeleteMessage}
                        onClose={this.oncloseDeletePopupEdited} trapFocus={false} focusDialog={false} />
                </div> : null}
            </div>
        )
    }

}

export default RoleManagement;