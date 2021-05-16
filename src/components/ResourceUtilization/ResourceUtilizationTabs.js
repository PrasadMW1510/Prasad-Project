import React,{Component} from 'react';
import{Tab,Tabs,Button} from '@nokia-csf-uxr/csfWidgets';
import ic_refresh from '@nokia-csf-uxr/csfWidgets/images/ic_refresh.svg';
import moment from 'moment';
import CurrentUtilization from './CurrentUtilization';

var lastdate;

class ResoruceTabs extends React.Component{
    constructor(props){
        super(props);
        this.state={
            SystemFlag:false,
            refreshclicked:0
        }
    }

    tabClick(event){
        // alert("tabs click:"+event.value);         
     }

     onButtonClick=(e)=> {
      
        const timestamp = new Date();
        window.localStorage.setItem("refreshedDate", timestamp);
        let timezone=moment(window.localStorage.getItem("refreshedDate")).format('DD/MM/YYYY - HH:mm');
        this.setState({ refreshedTime:timezone,
        SystemFlag:!this.state.SystemFlag,refreshclicked:this.state.refreshclicked+1});      
       
      }

    render(){

        if (window.localStorage.getItem("refreshedDate") === null || undefined || '') {
            lastdate = moment(Date.now()).format('DD/MM/YYYY - HH:mm')
          }
          else {
            lastdate = window.localStorage.getItem("refreshedDate");
            lastdate=moment(lastdate).format('DD/MM/YYYY - HH:mm')
          }

        return(
            <div>
                <Tabs alignment="left">
                <Tab id="currentUtilization" label="CURRENT UTILIZATION" onClick={() => this.tabClick(this)}>
                {this.state.SystemFlag ? <CurrentUtilization />:null}
                {!this.state.SystemFlag ? <CurrentUtilization />:null}
                </Tab>
                <Tab id="utilizationTrend" label="UTILIZATION TREND" onClick={() => this.tabClick(this)}>
                </Tab>
                </Tabs>

                <span className="lastrefresheddate">  <Button id="default" icon={ic_refresh} onClick={this.onButtonClick} style={{  top: "8px", borderRadius: "4px", width: "86px", fontSize: "12px" }} />
                  Last updated:{lastdate} </span>
            </div>
        );
    }
}
export default ResoruceTabs;