import React, { Component, PureComponent } from 'react';
import { SvgIcon, SelectItem} from "@nokia-csf-uxr/csfWidgets";
import '../Styles/ExpandedLayerHeader.css';

const EXPORT_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_import_file" iconColor="rgb(18, 65, 145)" />;
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

class PortalLayerHeader extends Component {
  constructor(props) {
    super(props);
    this.state={
      //pickDate:["Today so far","Yesterday","Last 7 days","Custom Range"],
      
    }
  }

  onDateSelection = e => {
    const pickDate = e.value;
    console.log("the selected system is:" + pickDate);
    this.setState({ pickDate });

  };

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
            {"Health status"}</span>
        </div>
        <div id="rightContainer" style={{ display: "flex", float: "right",marginTop:"6px",marginRight:"32px" }}>
          <span style={{           
            fontFamily: '"Nokia Pure Text Medium", Arial, sans-serif',
            marginRight: "4px"            
          }}>
            {this.props.portalCount}</span>
          <span className="totalInterfaces">No.of Portals</span>          
       {/* <span style={{ marginTop: "-5px", marginRight: "0px"}} className={this.props.class}> {EXPORT_ICON} </span>
            <span id="Export" className={this.props.class}>Export      
        </span>  */}
        <span className={this.props.class} style={{marginTop:"-7px"}}>
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
         </span>
        </div>
        <span className="chevron-indicator">
          <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
        </span>
      </div>

    );
  }
}
export default PortalLayerHeader;