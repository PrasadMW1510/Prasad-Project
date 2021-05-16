import { Component } from "react";
import { SvgIcon } from "@nokia-csf-uxr/csfWidgets";

const HOUR_GLASS_ICON = <SvgIcon key="icon-success" iconWidth={150} icon="ic_domain" iconColor="rgb(230, 230, 230)" />;

class UnderDevlopment extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div style={{fontFamily:"Nokia Pure Text Regular,Arial,sans-serif",
            fontSize:"26px",             
           color:"red",
           textAlign: "center"
       }}>                
            {this.props.statusDesc}
        </div>
        );
    }
}

export default UnderDevlopment;