import React, { Component } from 'react';
import{SvgIcon,ExpansionPanel} from '@nokia-csf-uxr/csfWidgets';
import "../../Styles/ApplicationConfig.css"
import ApplicationScope from "./ApplicationScope";

const EDIT_ICON = <SvgIcon key="icon-edit" iconWidth="20" icon="ic_edit" iconColor="rgb(18, 65, 145)" />;
const DELETE_ICON = <SvgIcon key="icon-delete" iconWidth="20" icon="ic_delete" iconColor="rgb(217, 7, 10)" />;


class ApplicationConfig extends Component{
    constructor(props){
        super(props);
    }

    render(){
        const { isOpen, all, togglePanel } = this.props;
        if (isOpen) {
            return (
                <div className="csfWidgets expansion-panel-basic-item">
                    <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="true">
                    <div>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                    <div className="AppDetails">
                        <span className="AppName">Name</span>
                        <span className="AppDesc">CSFP</span>
                        <span className="SysName">MNI</span>
                    </div>          
                    <div className="iconsContainer">   
                    <span style={{marginRight:"20px"}}>{EDIT_ICON}</span>             
                    <span style={{marginRight:"20px"}}>{DELETE_ICON}</span>
                    </div>  
                    </div>
                        <div className="AppNameSpace">
                        <span className="NameSpaceDesc">Application Name space:</span>
                        <span className="nameSpace">Display Name space</span>                        
                    </div>
                    
                    </div>
                        <span className="chevron-indicator">
                            <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                        </span>
                    </div>

                    <div>
                    <ApplicationScope />
                    </div>
                </div>
            );

        }

        return (
            <div className="csfWidgets expansion-panel-basic-item">
                <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="false">
                        <div className="AppDetails" style={{position:"absolute"}}>
                        <span className="AppName">Name</span>
                        <span className="AppDesc">CSFP</span>
                        <span className="SysName">MNI</span>
                        </div>
                    <span className="chevron-indicator">
                        <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                    </span>
                </div>
            </div>
        );

    }
}

//export default ApplicationConfig;

class ExpansionPanelApplicationConfig extends Component {
    constructor(props) {
        super(props);
        this.state = { childPanels: [] };
        this.panelCount = 7;
    }

    iconButtonClick = () => {
        // add another BasicItem Panel
        this.setState({ childPanels: this.state.childPanels.concat('Basic Item') });
    }

    toggle = id => (event) => {
        if (event.type === 'click' || event.key === ' ' || event.key === 'Enter') {
            event.preventDefault(); // stop scroll down with space bar
            const panel = `${id}Expanded`;
            this.setState({ [panel]: !this.state[panel] });
        }
    }

    render() {
        const { childPanels } = this.state;
        return (
            <div style={{ marginLeft: "18px", marginTop: "18px" }}>
                <ExpansionPanel
                    id="ETLInputExpansion"
                    height={-1} /* automatically determine collapsed panel height */
                    hideDefaultControl
                    areBordersVisible={false}
                    isShadowVisible={false}
                    dividers={true}
                    width={1150}
                >

                    <ApplicationConfig all togglePanel={this.toggle('panel1')}
                        isOpen={this.state.panel1Expanded} updateClickvalue={this.props.updateClickvalue}
                        updateElementId={this.props.updateElementId}
                        statusClickStatus={this.props.statusClickStatus} />

                </ExpansionPanel>
            </div>

        );
    }
}

export default ExpansionPanelApplicationConfig; 