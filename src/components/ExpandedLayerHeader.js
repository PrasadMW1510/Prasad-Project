import React, { Component, PureComponent } from 'react';
import { SvgIcon, SelectItem} from "@nokia-csf-uxr/csfWidgets";
import '../Styles/ExpandedLayerHeader.css';
import ExportInputDirStats from './ExportInputDirStats';
import ExportTopologyStats from './ExportTopologyStats';
import configData from "../Config.json";

const pickDate = [
  {
    label: "Today so far",
    value: "Today so far"
  },
  {
    label: "Yesterday",
    value: "Yesterday"
  },
  {
    label: "Last 7 days",
    value: "Last 7 days"
  },
  {
    label: "Custom Range",
    value: "Custom Range"
  }
];
var Roles;

class ExpandedLayerHeader extends Component {
  constructor(props) {
    Roles=window.localStorage.getItem("MDAroles");

    super(props);
    this.state={
      getActions:[],
      showExport:false,
      appID:props.appID,
      appName:props.appName

      //pickDate:["Today so far","Yesterday","Last 7 days","Custom Range"],
      
    }
  
  }

  onDateSelection = e => {
    const pickDate = e.value;
    console.log("the selected system is:" + pickDate);
    this.setState({ pickDate });

  };
  componentWillMount() {
    this.setState({getActions:window.localStorage.getItem('ALLACTIONSACCESSIDS')},()=>{
      console.log("getActions",this.state.getActions);
      if(((this.state.getActions).includes(configData.TABS_PRIVILIGES_IDS.EXPORT))){
        this.setState({showExport:true});
        }
        else{
          this.setState({showExport:false}); 
        }
        if( Roles.includes(configData.ROLES_NAMES.ADMIN)){
       this.setState({showExport:true});
        }
        this.forceUpdate();   
    });
  
  
   
  }

  render() {
 
    return (
      <div>
        <div id="headerContainer" className="headerContainers">
          <span style={{float:"left",marginLeft:"-13px",marginRight:"8px"}}>{this.props.statusIcon}</span>
          <span style={{
            float: "left", fontSize: "16px",
            fontFamily: '"Nokia Pure Text Medium", Arial, sans-serif',
            marginTop:"2px"
          }}>
            {this.props.etlLayerName}</span>
        </div>
        <div id="rightContainer" style={{ display: "flex", float: "right",marginTop:"6px",marginRight:"32px" }}>
          <span style={{           
            fontFamily: '"Nokia Pure Text Medium", Arial, sans-serif',
            marginRight: "4px"            
          }}>
            {this.props.interfaceCount}</span>
          <span className="totalInterfaces">Total Interfaces</span>          
    {/*    <span style={{ marginTop: "-5px", marginRight: "0px"}} className={this.props.class}> {EXPORT_ICON} </span>
            <span id="Export" className={this.props.class}>Export      
        </span> */}
        { this.state.showExport && this.props.inputDirStats?
          <ExportInputDirStats appName = {this.state.appName} appID = {this.state.appID} className={this.props.class}/>
        :null}
         { this.state.showExport && this.props.topologyStats?
           <ExportTopologyStats appName = {this.state.systemSelectedValue} className={this.props.class}/>
        :null}
            {/*<span className={this.props.class} style={{marginTop:"-10px"}}>
            <SelectItem 
            id="system"
            width={110}
            height={500}
            required={true}
            placeholder={"Today so far"}
            options={pickDate}
            selectedItem={this.state.selectedDateItem}
            onChange={this.onDateSelection}            
           />  
         </span>*/}
          
        </div>
        <span className="chevron-indicator">
          <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
        </span>
      </div>

    );
  }
}
export default ExpandedLayerHeader;