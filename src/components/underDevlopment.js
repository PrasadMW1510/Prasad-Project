import { Component } from "react";
import { SvgIcon } from "@nokia-csf-uxr/csfWidgets";

const HOUR_GLASS_ICON = <SvgIcon key="icon-success" iconWidth={150} icon="ic_domain" iconColor="rgb(230, 230, 230)" />;

class UnderDevlopment extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div style={{width: "500px",position: "relative",
                top: "140px",
                left: "350px"
                }}>
                <div style={{marginLeft:"150px"}}>{HOUR_GLASS_ICON}</div>
            <div style={{fontFamily:"Nokia Pure Text Regular,Arial,sans-serif",
             fontSize:"26px",             
            color:"#757575"
        }}>Component details yet to be provisioned</div>
        </div>
        );
    }
}

export default UnderDevlopment;