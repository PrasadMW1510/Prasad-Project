import { LoginScreen, SvgIcon } from '@nokia-csf-uxr/csfWidgets';
import React from 'react';
import axios from 'axios';
import qs from 'query-string';
import jwt from 'jsonwebtoken';
import configData from "../Config.json";
import { withRouter } from 'react-router-dom';
import constants from '../assets/Constants.json';
import http from './service';
import thirdpartylogo from '../images/USCC.svg';

import { text, boolean, select } from '@storybook/addon-knobs';

var errorMsg;
var  RolesofMDA;
const productDetailsLogoOptions = {
  thirdpartylogo: 'custom'
};

class LoginScreenComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      buttonDisabled: true,
      username: '',
      password: '',
      keycloakurl: '',
      keycloak: null,
      authenticated: false


    };
  }

  onUserNameChange = (data) => {
    const { value } = data;
    console.log('Username change: ', data); // eslint-disable-line no-console
    this.setState({
      username: value,
      buttonDisabled: (this.state.password.length === 0 || value.length === 0),
      notificationType: undefined,
      notificationMessage: undefined,
      usernameError: false,
      passwordError: false,
    });
  }

  onPasswordChange = (data) => {
    const { value } = data;
    // console.log('Password change: ', data); // eslint-disable-line no-console
    this.setState({
      password: value,
      buttonDisabled: (this.state.username.length === 0 || value.length === 0),
      notificationType: undefined,
      notificationMessage: undefined,
      usernameError: false,
      passwordError: false,
    });
  }

  onButtonClick = (event) => {
    event.nativeEvent.preventDefault();

    var port = configData.LoginScreen.CKEY.PORT;
    var hostname = configData.LoginScreen.CKEY.SERVER_NAME;
    var path = configData.LoginScreen.CKEY.CKEY_REALM;


    var payload = {

      grant_type: 'password',
      username: this.state.username,
      password: this.state.password,
      client_id: configData.LoginScreen.CKEY.CLIENT_ID,
    }


    // console.log("payload", payload);

    var instance = axios.create({
      baseURL: 'http://' + hostname + ":" + port

    })



    instance.post(path,

      qs.stringify(payload)

    ).then(response => {
      console.log("Response", response);
      let recvdData = response.data;
      let extractedToken = jwt.decode(response.data.access_token);
      var expiresin = recvdData.expires_in;
      var ttllocal = new Date();
      var newSeconds = (ttllocal.getSeconds() + expiresin);
      ttllocal.setSeconds(newSeconds);
      var roles = extractedToken.realm_access.roles;
      
      var stringifiedRoles = JSON.stringify(roles);
      console.log("extractedToken: ", extractedToken);
      console.log("Roles: ", stringifiedRoles);
      console.log("EXPIRES_in: ", response.data.expires_in)
      localStorage.clear();
      localStorage.setItem("TTL", ttllocal);
      localStorage.setItem("ROLES", stringifiedRoles);
      localStorage.setItem("ACCESS_TOKEN", response.data.access_token);
      localStorage.setItem("REFRESH_TOKEN", response.data.refresh_token);
      localStorage.setItem("Nokia_Username", this.state.username);
      localStorage.setItem("EXPIRES_in", response.data.expires_in);
      var obj =extractedToken.resource_access;
      if(("mda" in obj) || ("mda360" in obj)){
      var clientRoles = JSON.stringify(extractedToken.resource_access.mda.roles);
      localStorage.setItem("MDAroles", clientRoles)
      // let params=window.localStorage.getItem("ROLES");
     
      let params = window.localStorage.getItem("MDAroles");
      RolesofMDA=params;

      let Roles = {
        roles: ["Integration User", "MDAAdmin"]
      }
      console.log("params", params)
      console.log(Roles)

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        roles: ["Integration User", "MDAAdmin"]
      };
      console.log("request", requestOptions)
      //  http.post('http://10.143.114.231:8080/config/roles/rolenamemappings', { roles:params})
      //  http.post('http://127.0.0.1:8081/getAllkeycloakRolesnPrivilages',{roles:params})
      http.post(configData.API.SERVICE.SEND_ROLES_GET_PRIVILGES, { roles: JSON.parse(params) })
        .then(response => {
          console.log("Roles" + JSON.stringify(response.data));
          localStorage.setItem("Roles&Privilages", JSON.stringify(response.data));

          let UserPrivilages = JSON.parse(window.localStorage.getItem("Roles&Privilages"))
          console.log("UserPrivilages", UserPrivilages)
          let actionPrivilages = [];
          let tabPrivilages = [];
          //        let allTabPrivilages = {}; //Store all tab privilages as key value pair
          //        let allActionPrivilages = {}; //Store all action privilages as key value pair
          let allTabPrivilages = [];
          let allTabPrivilagesIDs = [];
          let allActionPrivilages = [];
          let allActionPrivilagesIDs = [];
          UserPrivilages.forEach((UserPrivilages, privilageIndex) => {
            actionPrivilages = UserPrivilages.actionPrivileges;
            tabPrivilages = UserPrivilages.tabPrivileges;
            actionPrivilages.forEach((actionPrivilages, privilageIndex) => {
              //      allActionPrivilages[actionPrivilage.id] = actionPrivilage.privilegeName;
              allActionPrivilagesIDs.push(actionPrivilages.id);
              allActionPrivilages.push(actionPrivilages.privilegeName);
            })
            tabPrivilages.forEach((tabPrivilages, privilageIndex) => {
              //     allTabPrivilages[tabPrivilage.id] = tabPrivilage.privilegeName;
              allTabPrivilages.push(tabPrivilages.privilegeName);
              allTabPrivilagesIDs.push(tabPrivilages.id);

            })
          })
          console.log("allActionPrivilages" + JSON.stringify(allActionPrivilages));
          console.log("allTabPrivilages" + JSON.stringify(allTabPrivilages));
          let newArrayofAction = this.remove_duplicates_es6(allActionPrivilages);
          let newArrofActionIDS=this.remove_duplicates_es6(allActionPrivilagesIDs);
          console.log("newArrayofAction", newArrayofAction)
          let newArrayofTabs = this.remove_duplicates_es6(allTabPrivilages);
          let newArrofTabsIDS=this.remove_duplicates_es6(allTabPrivilagesIDs);
          console.log("newArrayofAction", newArrayofAction)
          console.log("newArrayofTabs", newArrayofTabs)
          localStorage.setItem("ALLACTIONSACCESS", JSON.stringify(newArrayofAction));
          localStorage.setItem("AllTABSACESS", JSON.stringify(newArrayofTabs));
          localStorage.setItem("ALLACTIONSACCESSIDS",JSON.stringify(newArrofActionIDS));
          localStorage.setItem("AllTABSACESSIDS", JSON.stringify(newArrofTabsIDS));
                    console.log("access token action", extractedToken);
          this.setState({
            buttonLoading: true,
            passwordDisabled: true,
            userNameDisable: true
          }, () => {
            setTimeout(() => {
              this.setState({
                passwordDisabled: false,
                userNameDisable: false,
                buttonLoading: false,
                notificationType: 'info',
                notificationMessage: 'You are now logged in.',
              });
            }, 6000);
          });
          http.get(configData.API.SERVICE.ONBOARD_APPNAMES)
          .then(response => {
            let applicationNames = response.data;        
            let appName=[];
            let appID=[];
            applicationNames.forEach((item,index)=>{
               appName.push(item.appName);  
               appID.push(item.id);    
                   if(item.defaultEnable=="yes"){
                    localStorage.setItem("SELECTED_APPNAME", item.appName);  
                    localStorage.setItem("SELECTED_APPID", item.id);   
                  if(RolesofMDA.includes(configData.ROLES_NAMES.ADMIN)){
                    this.props.history.push({
                      pathname: constants.Routerpath.Configuration
              
              
                    });    }
                  else{
                    this.props.history.push({
                    
                      pathname: constants.Routerpath.Dashboard
              
              
                    }); 

                  }        }
            })   
          })
          .catch(error => { console.log("Error", error.response);
          errorMsg="Internal server error, please try later";
        
          this.setState({
            buttonLoading: true,
            passwordDisabled: true,
            userNameDisable: true
          }, () => {
            setTimeout(() => {
              this.setState({
                notificationType: 'error',
                notificationMessage:errorMsg,
                passwordDisabled: false,
                userNameDisable: false,
                buttonLoading: false,
                usernameError: true,
                passwordError: true,
              });
            }, 6000);
          });
        
        })
        })

        .catch(error => {
          // this.setState({ error })
          console.log("Error", error.response);
          errorMsg="Internal server error occurred";
          //console.log('Sign In button click: ', event); // eslint-disable-line no-console
          this.setState({
            buttonLoading: true,
            passwordDisabled: true,
            userNameDisable: true
          }, () => {
            setTimeout(() => {
              this.setState({
                notificationType: 'error',
                notificationMessage:errorMsg,
                passwordDisabled: false,
                userNameDisable: false,
                buttonLoading: false,
                usernameError: true,
                passwordError: true,
              });
            }, 6000);
          });
        }
          );
      }
      else {this.setState({
        buttonLoading: true,
        passwordDisabled: true,
        userNameDisable: true
      }, () => {
        setTimeout(() => {
          this.setState({
            notificationType: 'error',
            notificationMessage: 'There is no role assigned to given user. Please contact Admin',
            passwordDisabled: false,
            userNameDisable: false,
            buttonLoading: false,
            usernameError: true,
            passwordError: true,
          });
        }, 6000);
      });

      // this.props.history.push({
      //   pathname: '/dashboard'


      // });
    }
    }
    ).catch(error => {
      console.log("Error", error.response);
      errorMsg= "Invalid Credentials";
      //console.log('Sign In button click: ', event); // eslint-disable-line no-console
      this.setState({
        buttonLoading: true,
        passwordDisabled: true,
        userNameDisable: true
      }, () => {
        setTimeout(() => {
          this.setState({
            notificationType: 'error',
            notificationMessage:errorMsg,
            passwordDisabled: false,
            userNameDisable: false,
            buttonLoading: false,
            usernameError: true,
            passwordError: true,
          });
        }, 6000);
      });
    })
  }
  remove_duplicates_es6(arr) {
    let s = new Set(arr);
    let it = s.values();
    return Array.from(it);
  }
  render() {

    const passwordProps = {
      onChange: this.onPasswordChange,
      css: {
        error: this.state.passwordError,
        disabled: this.state.passwordDisabled,
      },
      text: this.state.password,
    };

    const userNameProps = {
      onChange: this.onUserNameChange,
      css: {
        error: this.state.usernameError,
        disabled: this.state.userNameDisable,
      },
      text: this.state.username
    };

    const buttonProps = {
      disabled: this.state.buttonDisabled,
      onClick: this.onButtonClick
    };

    const loginScreenProps = {
      //(<div>{MDA_LOGO}</div>)
      productDescription: configData.LoginScreen.APPLICATION_DESCRIPTION,

      //     marketingMessage: '',
      //      versionNumber: configData.LoginScreen.APPLICATION_VERSION,
      copyrightYear: new Date().getFullYear(),
      notificationType: this.state.notificationType,
      notificationMessage: this.state.notificationMessage,
      //    notificationArea: this.getNotificationArea(),
      onRememberUserChange: this.onRememberUserChange,
      rememberUser: this.state.rememberUser,
     // showRememberUser: true,
      passwordProps,
      userNameProps,
      buttonProps,
      buttonLoading: this.state.buttonLoading

    };

    return (
          <LoginScreen {...loginScreenProps} 
          productName={ configData.LoginScreen.APPLICATION_NAME}
          productDetailsLogo={select('productDetailsLogo', productDetailsLogoOptions, thirdpartylogo)}
             />
  
    );
  }
}

export default withRouter(LoginScreenComponent);
