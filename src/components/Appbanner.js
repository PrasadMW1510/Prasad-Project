import React from 'react';
import { AppBanner, AppToolbar, Button, SimpleList, Snackbar, AlertDialogInfo } from '@nokia-csf-uxr/csfWidgets';
import IframeComponent from './IframeComponent';
import axios from "axios";
import TabsComponent from "./TabsComponent";
import moment from 'moment';
import ic_settings from '@nokia-csf-uxr/csfWidgets/images/ic_settings.svg';
import ic_export from '@nokia-csf-uxr/csfWidgets/images/ic_export.svg';
import ic_Profile from '@nokia-csf-uxr/csfWidgets/images/ic_Profile.svg';
import ic_arrow_back from '@nokia-csf-uxr/csfWidgets/images/ic_arrow_back.svg';
import { withRouter } from 'react-router-dom';
import '@nokia-csf-uxr/csfWidgets/csfWidgets.css';
import IdleTimer from 'react-idle-timer';
import jwt from 'jsonwebtoken';
import qs from 'query-string';
import configData from "../Config.json";    
import ConfigurationTabs from './Configuration/ConfigurationTabs';
import Constants from '../assets/Constants.json';
import thirdpartylogo from '../images/USCC.svg';

var getPrivilegesIDS;
var  Roles;
var appToolbar;
let self = null;
var testBoolean=false;
class AllMenusWrapper extends React.PureComponent {
  lastdate = window.localStorage.getItem("refreshedDate");
  getPrivilegesIDS=JSON.parse(window.localStorage.getItem("AllTABSACESSIDS"))
  Roles=window.localStorage.getItem("MDAroles");
  
  constructor(props) {
    super(props);
    console.log("getIds",getPrivilegesIDS)
    this.goBack = this.goBack.bind(this);
    self = this;
    this.state = {
      showAppBannerInfo: false,
      freshTokenPromise: undefined,
      refreshtime: 60000,
      newpassword: '',
      retypepassword: '',
      password: '',
      dialog: false,
      showSnackbar: false,
      fetchstatus: 0,
      passchangedstatus: 0,
      message: '',
      userid: '',
      keycloakurl: '',
      systems: [],
      systemSelectedValue: "CXM",
      viewId: '',
      sidemenuValuesSelection: false,
      drawerType: 'compact',
      menuObject: Constants.menuObject,
      resourceUtilization:false
    };
  
    getPrivilegesIDS=JSON.parse(window.localStorage.getItem("AllTABSACESSIDS"));
    Roles=window.localStorage.getItem("MDAroles");
  }
  componentWillMount() {
      

    if(getPrivilegesIDS.includes(configData.TABS_PRIVILIGES_IDS.RESOURCE_UTILIZATION_METRICS)){
     // this.setState({resourceUtilization:true});
      testBoolean=true;
      }
      else{
        testBoolean=false;
        this.setState({resourceUtilization:false});
     }

     Roles.includes(configData.ROLES_NAMES.ADMIN)? testBoolean=true:this.setState({});

     console.log("testBoolean",testBoolean)


     if(testBoolean){
       this.setState({menuObject:[]});
       this.setState({
         menuObject:Constants.menuObjectwithResourceUtilization
       })
     }
     console.log("menuoject",this.state.menuObject)
    }

  onSideDrawerItemClick = (eventObj) => {
    this.setState({ viewId: eventObj.menuItem.action },()=>{
      switch (this.state.viewId) {
        case "dashboard":
          console.log("viewId getview: ", this.state.viewId);
          return this.dashboard();
          break;
        case "resourceUtil":
          console.log("viewId getview: ", this.state.viewId);
          return this.getResourceUtil();
          break;
        case "cloudera":
          console.log("viewId getview: ", this.state.viewId);
          return this.getCloudera();
          break;      
        case "configuration":
          console.log("viewId getview: ", this.state.viewId);
          return this.getConfiguration();
          break;
        case "onboard":
          console.log("viewId getview: ", this.state.viewId);
          return this.getOnBoard();
          break;
        case "adapter":
          console.log("viewId getview: ", this.state.viewId);
          return this.getadapter();
          break;
        case "roleManagement":
          console.log("viewId getview: ", this.state.viewId);
          return this.roleManagement();
          break;
        default:
          break;
      }
  
    });
    console.log("viewId:" + eventObj.menuItem.action);
    //this.getView();
 

  };

  onButtonClick() {
    window.location.reload();
    const timestamp = moment(Date.now()).format('DD/MM/YYYY - hh:mm')
    window.localStorage.setItem("refreshedDate", timestamp);
    this.setState({ refreshedTime: window.localStorage.getItem("refreshedDate") })
  }

  getView = viewId => {
    switch (this.state.viewId) {
      case "dashboard":
        console.log("viewId getview: ", this.state.viewId);
        return this.dashboard();
        break;
      case "resourceUtil":
        console.log("viewId getview: ", this.state.viewId);
        return this.getResourceUtil();
        break;
      case "cloudera":
        console.log("viewId getview: ", this.state.viewId);
        return this.getCloudera();
        break;      
      case "configuration":
        console.log("viewId getview: ", this.state.viewId);
        return this.getConfiguration();
        break;
      case "onboard":
        console.log("viewId getview: ", this.state.viewId);
        return this.getOnBoard();
        break;
      case "adapter":
        console.log("viewId getview: ", this.state.viewId);
        return this.getadapter();
        break;
      case "roleManagement":
        console.log("viewId getview: ", this.state.viewId);
        return this.roleManagement();
        break;
      default:
        break;
    }
  };


  dashboard() {
    this.props.history.push({
      pathname:  Constants.Routerpath.Dashboard
    });
  };
  getResourceUtil() {
  
      this.props.history.push({
      pathname:  Constants.Routerpath.ResourceUtil
    })
   
    // return (
    //   <div>

    //   </div>
    // );
  };
  getCloudera() {
    
    this.props.history.push({
      pathname:  Constants.Routerpath.Iframe
    });

    // return (
    //   <IframeComponent sandbox="allow-same-origin" url="https://reactjsexample.com/tag/iframe/"
    //     width="1200px"
    //     height="550px"
    //     display="initial"
    //     position="relative"
    //   />
    // );
  };
  getConfiguration() {
    
    this.props.history.push({
      pathname:  Constants.Routerpath.Configuration
    });
    // return (
    //   <div>
    //     <ConfigurationTabs />
    //   </div>
    // );
  };

  onClickofMenus = (event) => {
    if (event.value.row.textLines[0] === 'Configuration') {
      this.setState({ sidemenuValuesSelection: true });
      this.setState({ viewId: 'onboard' });
      this.setState({ drawerType: 'persistent' });
      this.setState({
        menuObject: [{
          group: [
            {
              id: 'onboard',
              name: 'Onboard',
              action: 'onboard',
              icon: 'Onboard'
            },
            {
              id: 'adapter',
              name: 'Adapter',
              action: 'adapter',
              icon: 'Adapter'
            },
            {
              id: 'rolemanagemnt',
              name: 'RoleManagement',
              action: 'roleManagement',
              icon: 'RoleManagement'
            }
          ]
        }]
      })

      appToolbar = true;
    }
    else if(event.value.row.textLines[0] === 'Sign Out'){
      this.props.history.push({
        pathname: Constants.Routerpath.Login
      });
      localStorage.clear();
   
    }
    else {
      this.setState({ sidemenuValuesSelection: false });
      appToolbar = false;
    }
  }

  goBack = () => {
    // this.props.history.goBack();
    console.log("go");
    // this.props.history.goBack();
    // this.props.history.push('/overview');
  }
  getOnBoard() {

    return (
      <div>
        {/* <Onboard /> */}
      </div>
    )
  }
  roleManagement() {
    return (
      <div>
        {/* <RoleManagement /> */}
      </div>
    )
  }

  getadapter() {
    return (
      <div>
        {/* <Adapter /> */}
      </div>
    )
  }

  render() {
    var alertDialogue = <div></div>;
    if (this.state.showAppBannerInfo) {
      alertDialogue = <AlertDialogInfo id="InfoDialogueWarning" title="Warning" warningText1="Logging out"
        warningText2="session expired" onClose={this.onCloseSession} trapFocus={false} />
    }
    const breadcrumbs = {
      isCompact: true,
      items: [{
        id: 'only-breadcrumbs-item',
        title: 'Home>Configuration',
        tooltip: {
          text: 'Home>Configuration',
        }
      }],
      listMaxWidth: 20,
      listMaxHeight: 20,
      renderBackButton:
        props => (<Button icon={ic_arrow_back} {...props} onClick={this.goBack}
        />)
    };




    return (
      <div style={{width:" 100%",
        height: "50px",
        position: "-webkit-sticky",
        position: "sticky",
        top: "0", zIndex:"1"}}>
        <IdleTimer
          ref={ref => { this.idleTimer = ref }}
          element={document}
          onActive={this.onActive}
          onIdle={this.onIdle}
          timeout={100}
        />

        {alertDialogue}

        <AppBanner userAccountSummaryOnLogoutButtonClick={this.userAccountSummaryOnLogoutButtonClick}
          userAccountSummaryUsername={localStorage.getItem("Nokia_Username")}
          sideDrawerItemGroups={this.state.menuObject}
          sideDrawerOnItemClick={this.onSideDrawerItemClick}
          sideDrawerButtonVisible={true}
          sideDrawerDefaultSelectedItem={this.state.viewId}
          sideDrawerSelectedItem={this.state.viewId}
          sideDrawerType={this.state.drawerType}
          productFamily="MDA360"
          logo={thirdpartylogo}
          userAccountSummaryContent={closeMenus => (
            <SimpleList
              data={{
                rows: [{ id: "simpleListItem1", icon: ic_Profile, textLines: ['Profile'] },
              ] 
              }} onClick={this.onClickofMenus}
            />

          )}
          //userAccountSummaryLogoutButtonText="Sign Out"
          notificationProps={{
            //children: this.getList(),
            //disable: notificationDisabled,
            //numberOfNotifications: numberOfNewNotificationsOnIcon,
            onClick: this.handleNotificationButtonClick,
            //onShowMoreButtonClick: e => console.log('show more button clicked', e),
            //onShowMoreButtonKeyDown: this.handleNotificationButtonKeyDown,
            title: 'Notifications'
          }}

          renderAfterBanner={appToolbar ? <AppToolbar id="wBreadcrumsTabsSelectItem" breadcrumbs={breadcrumbs} />
            : null}

        />
          {/* {this.getView()}
        </AppBanner> */}
      </div>

    );
  }
  userAccountSummaryOnLogoutButtonClick = () => {
    this.props.history.push({
      pathname:  Constants.Routerpath.Login
    });
    localStorage.clear();
  }

  rendershowSnackbar() {
    return (
      <Snackbar id="snackbarID" dataList={[{
        message: this.state.message,
        duration: 2000, autoIncreaseDuration: false
      }]} />
    );
  }

  componentDidMount = () => {

    this.fetchkeyclockenv();

  }

  fetchkeyclockenv = async () => {
   
    const keyclok = await fetch('/api/env/keycloak')
      .then(response => response.json());
    // console.log("async");
    // console.log(keyclok.environmentvar);
    this.setState({ keycloakurl: keyclok.environmentvar });
    // console.log('===' + this.state.keycloakurl + '====');
  }

  onCloseSnack() {
    this.setState({
      newpassword: '',
      retypepassword: '',
      showSnackbar: false
    });
  }

  onClose = () => {
    this.setState({
      dialog: false,
      newpassword: '',
      retypepassword: '',
      showSnackbar: false,
      message: ''
    })
  }

  onCloseSession() {
    //self.props.actions.SHOWAPPBANNERINFO(false, "", "");
    this.setState({
      showAppBannerInfo: false,
    });
    self.props.history.push({
      pathname:  Constants.Routerpath.Login
    });

    //self.props.actions.LOGOUT();

    localStorage.clear();

  }


  onActive() {
    //   console.log("on active test");
    self.checkTokenExpiration();
  }

  onIdle() {
    //   console.log("on idle test");
    self.checkTokenExpiration();
  }

  checkTokenExpiration = () => {

    var TTLString = localStorage.getItem("TTL");
    var expiryTime = new Date(TTLString);
    var currentTime = new Date();
    var timeDiff = (expiryTime - currentTime) / 1000;
    var expiresin = localStorage.getItem("EXPIRES_in");

    //  console.log("app banner timeout check", currentTime);
    //  console.log("app banner timeout check expiry time", expiryTime);
    //  console.log("app banner timeout check expiry EXPIRES_in", expiresin);
    //  console.log("expiry time is:", expiryTime);
    //  console.log("current time is:", currentTime);
    //  console.log("time difference is:", timeDiff);
    //console.log("Token: ",token);
    if (currentTime > expiryTime) {
   //   console.log("now APP banner timeout");
      this.setState({
        showAppBannerInfo: true
      });
      //store.dispatch({ type: 'SHOWAPPBANNERINFO', showAppBannerInfo:true, title1: "Token has expired.",title2: "User token time has been expired.Please login again." });
      self.onCloseSession();
    }
    else if (timeDiff < (expiresin * 0.5)) {
      var ftoken = this.freshTokenPromise;

      console.log("trying to refresh the token", ftoken);
      if (!ftoken) {
        self.refreshToken().then(() => {
          console.log("completed token renewal");

        });
      } else {
        //  return store.auth.freshTokenPromise.then(() => next(action));
      }
    }

  }


  refreshToken() {

    var freshTokenPromise = self.fetchJWTToken()
    var freshToken = freshTokenPromise
      .then(t => {
        //  store.dispatch({
        //    type: 'DONE_REFRESHING_TOKEN'
        //  });
        // this.setState({
        //   freshTokenPromise: undefined
        // });
        console.log('Done Refreshing Token')
        self.saveAppToken(t);
        return t.data.access_token ? Promise.resolve(t.data.access_token) : Promise.reject({
          message: 'could not refresh token'
        });
      })
      .catch(e => {
        console.log('error refreshing token', e.response);
        //  store.dispatch({
        //    type: 'DONE_REFRESHING_TOKEN'
        //  });
        this.setState({
          freshTokenPromise: undefined
        });
        return Promise.reject(e);
      });
    this.setState({
      freshTokenPromise: freshToken
    });

    return freshTokenPromise;

  }


  saveAppToken(response) {

    console.log("fetching refresh is succesfull", response);
    let recvdData = response.data;
    let extractedToken = jwt.decode(response.data.access_token);
    var expiresin = recvdData.expires_in;
    var ttllocal = new Date();
    var newSeconds = (ttllocal.getSeconds() + expiresin);
    ttllocal.setSeconds(newSeconds);
    console.log("local expiration time", ttllocal);


    localStorage.removeItem("TTL");
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("EXPIRES_in");

    //console.log("TTL local",ttllocal);

    localStorage.setItem("TTL", ttllocal);
    localStorage.setItem("ACCESS_TOKEN", response.data.access_token);
    localStorage.setItem("REFRESH_TOKEN", response.data.refresh_token);
    localStorage.setItem("EXPIRES_in", response.data.expires_in);


  }

  fetchJWTToken() {

    var refreshToken = localStorage.getItem("REFRESH_TOKEN");

    var path = configData.LoginScreen.CKEY.CKEY_REALM;
    console.log(process.env);
    var payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: configData.LoginScreen.CKEY.CLIENT_ID
    }
    //console.log("testing fetching  jwt in appbanner",qs.stringify(payload));
    var instance = axios.create({
      baseURL: this.state.keycloakurl
    })
    return instance.post(path,
      qs.stringify(payload)
    );
  }
}

export default withRouter(AllMenusWrapper);