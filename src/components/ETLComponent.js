import React, { Component } from 'react';
import ExpansionPanelInputDirectory from './ETLInputDirectoryStatistics';
import ExpansionPanelTopologyStatus from './ETLTopologyStatus';

class ETLcomponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            appID:props.appID,
            appName:props.appName
        }

    };

    render() {

        return (

            <div style={{ marginBottom: "18px" }}>
                <ExpansionPanelInputDirectory updateClickvalue={this.props.updateClickvalue}
                    updateElementId={this.props.updateElementId} statusClickStatus={this.props.statusClickStatus} 
                    appID = {this.state.appID} appName={this.state.appName}/>
						{/* <br />
                <ExpansionPanelTopologyStatus updateClickvalue={this.props.updateClickvalue}
						updateElementId={this.props.updateElementId} statusClickStatus={this.props.statusClickStatus} /> */}
            </div>

        );
    }

}

export default ETLcomponent;