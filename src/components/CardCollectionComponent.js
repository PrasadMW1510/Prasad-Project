import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SvgIcon, Card, CardCollection } from '@nokia-csf-uxr/csfWidgets';
import http from './service';
import ETLcomponent from './ETLComponent';
import '../Styles/CardCollectionComponent.css';
import UnderDevlopment from './underDevlopment';
import configData from "../Config.json";
import * as dateTime from './DateAndTime';
import {connect} from 'react-redux';

const currentDate = dateTime.getCurrentDate();
const currentTime = dateTime.getCurrentTime();
const startDateTime="00:00:00";    


const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const ERROR_ICON = <SvgIcon key="icon-error" iconWidth="20" icon="ic_exclude" iconColor="rgb(199, 47, 33)" />;
const WARNING_ICON = <SvgIcon key="icon-warning" iconWidth="20" icon="ic_warning" iconColor="rgb(232, 157, 0)" />;

const PORTAL_ICON = <SvgIcon key="ic_Monitor" iconWidth="30" icon="ic_Monitor" iconColor="rgb(161, 161, 161)" />;
const WEBSERVICE_ICON = <SvgIcon key="ic_Internet" iconWidth="30" icon="ic_Internet" iconColor="rgb(161, 161, 161)" />;
const ICECACHE_ICON = <SvgIcon key="ic_Constraints" iconWidth="30" icon="ic_Constraints" iconColor="rgb(161, 161, 161)" />;
const ANALYTICSENGINE_ICON = <SvgIcon key="ic_Sniffer" iconWidth="30" icon="ic_Sniffer" iconColor="rgb(161, 161, 161)" />;
const TNP_ICON = <SvgIcon key="ic_vnfcs_status" iconWidth="30" icon="ic_vnfcs_status" iconColor="rgb(161, 161, 161)" />;
const METADATAREPOSITORY_ICON = <SvgIcon key="ic_network_resource" iconWidth="30" icon="ic_network_resource" iconColor="rgb(161, 161, 161)" />;
const SPARKHIVE_ICON = <SvgIcon key="ic_summary_view" iconWidth="30" icon="ic_summary_view" iconColor="rgb(161, 161, 161)" />;
const HBASE3_ICON = <SvgIcon key="ic_Wan" iconWidth="30" icon="ic_Wan" iconColor="rgb(161, 161, 161)" />;
const SUMMARIZATIONENGINE_ICON = <SvgIcon key="ic_events_management" iconWidth="30" icon="ic_events_management" iconColor="rgb(161, 161, 161)" />;
const DATALAKE_ICON = <SvgIcon key="ic_DHCP_pools" iconWidth="30" icon="ic_DHCP_pools" iconColor="rgb(161, 161, 161)" />;
const ETL_ICON = <SvgIcon key="ic_workflow" iconWidth="30" icon="ic_workflow" iconColor="rgb(161, 161, 161)" />;
const DATAREFINERY_ICON = <SvgIcon key="ic_ProxyServer" iconWidth="30" icon="ic_ProxyServer" iconColor="rgb(161, 161, 161)" />;
const PROBES_ICON = <SvgIcon key="ic_reachability" iconWidth="30" icon="ic_reachability" iconColor="rgb(161, 161, 161)" />;
const ITINTEGRATIONS_ICON = <SvgIcon key="ic_automate" iconWidth="30" icon="ic_automate" iconColor="rgb(161, 161, 161)" />;
const ICON_ARRAY = [{
    "PORTAL_ICON": PORTAL_ICON, "WEBSERVICE_ICON": WEBSERVICE_ICON,
    "ICECACHE_ICON": ICECACHE_ICON, "ANALYTICSENGINE_ICON": ANALYTICSENGINE_ICON, "TNP_ICON": TNP_ICON,
    "METADATAREPOSITORY_ICON": METADATAREPOSITORY_ICON, "SPARKHIVE_ICON": SPARKHIVE_ICON, "HBASE3_ICON": HBASE3_ICON,
    "SUMMARIZATIONENGINE_ICON": SUMMARIZATIONENGINE_ICON, "DATALAKE_ICON": DATALAKE_ICON, "ETL_ICON": ETL_ICON,
    "DATAREFINERY_ICON": DATAREFINERY_ICON, "PROBES_ICON": PROBES_ICON, "ITINTEGRATIONS_ICON": ITINTEGRATIONS_ICON
}];

const layout = [
    {
        x: 0, y: 0, w: 4, h: 0, i: '0'
    }
    /* {
       x: 2, y: 0, w: 2, h: 0, i: '1'
     }*/

];

const layout2 = [
    {
        x: 0, y: 0, w: 2, h: 0, i: '0'
    },
    {
        x: 2, y: 0, w: 2, h: 0, i: '1'
    }
];
const layout3 = [
    {
        x: 0, y: 0, w: 1, h: 1, i: '0'
    },
    {
        x: 1, y: 0, w: 1, h: 1, i: '1'
    },
    {
        x: 3, y: 0, w: 1, h: 1, i: '3'
    }
];
const layout4 = [
    {
        x: 0, y: 1, w: 1, h: 1, i: '0'
    },
    {
        x: 1, y: 1, w: 1, h: 1, i: '1'
    },
    {
        x: 2, y: 1, w: 1, h: 1, i: '2'
    },
    {
        x: 3, y: 1, w: 1, h: 1, i: '3'
    }
];
const layout5 = [
    [
        {
            x: 0, y: 1, w: 1, h: 1, i: '0'
        }
    ],
    [
        {
            x: 0, y: 1, w: 1, h: 1, i: '0'
        },
        {
            x: 1, y: 1, w: 1, h: 1, i: '1'
        }
    ], [
        {
            x: 0, y: 1, w: 1, h: 1, i: '0'
        },
        {
            x: 1, y: 1, w: 1, h: 1, i: '1'
        },
        {
            x: 2, y: 1, w: 1, h: 1, i: '2'
        }
    ]
];

const cardCollectionMargin = [[16, 13], [0, 0], [12, 14]];
const cardCollectionPadding = [[15, 15], [6, 0], [12, 14]];

const cardIcon = [
    ["singleCardIcon", "singleCardText", "singleCardErrorContainer", "singleCardErrorCountContainer", "singleCardErrorText", "singleCardStatusIcon"],
    ["doubleCardIcon", "doubleCardText", "doubleCardErrorContainer", "doubleCardErrorCountContainer", "doubleCardErrorText", "doubleCardStatusIcon"],
    ["tripleCardIcon", "trippleCardText", "trippleCardErrorContainer", "trippleCardErrorCountContainer", "trippleCardErrorText", "trippleCardStatusIcon"],
    ["fourCardIcon", "fourCardText", "fourCardErrorContainer", "fourCardErrorCountContainer", "fourCardErrorText", "fourCardStatusIcon"]
]

const cardCSS = [[70, 1110], [70, 700], [114, 350], [100, 260]];
const noOfCardsEachLine = 4;
var ListOfLayersLength;
class CardCollectionComponent extends Component {
    static propTypes = {
        responsive: PropTypes.bool,
        selectable: PropTypes.bool,
        singleSelection: PropTypes.bool,
        selectableCardSizeNotChanged: PropTypes.bool,
        appToolbar: PropTypes.bool,
    };
    static defaultProps = {
        responsive: false,
        selectable: false,
        singleSelection: false,
        selectableCardSizeNotChanged: false,
        appToolbar: false,
    };
    constructor(props) {
        super(props);
        
        this.state = {
            cardCollectionDivItems: [],
            layerName: "",
            appName: props.appName,
            updateClickvalue: props.updateClickvalue,
            updateElementId: props.updateElementId,
            statusClickStatus: props.statusClickStatus,
            dashboardResponse : props.dashboardResponse
        }
        // const dashboardResponse = this.props.dashboardResponse;
         console.log("dashboardResponse in Cardcollection***************", this.state.dashboardResponse);
        
       // this.getServicesCall();
    };
   componentDidMount = () => {
        this.getServicesCall();
    }

    /*componentWillReceiveProps(nextProps) {
        this.setState({
            appName: nextProps.appName,
            updateClickvalue: nextProps.updateClickvalue,
            updateElementId: nextProps.updateElementId,
            statusClickStatus: nextProps.statusClickStatus
        });
    } */
    getlayout = (length) => {
        if (length === 1) {
            return layout;
        } else if (length === 2) {
            return layout2;
        } else if (length === 3) {
            return layout3;
        } else {
            return layout4;
        }
    }
    getCardCSS = (length) => {
        if (length === 1) {
            return cardCSS[0];
        } else if (length === 2) {
            return cardCSS[1];
        } else if (length === 3) {
            return cardCSS[2];
        } else {
            return cardCSS[3];
        }
    }
    getCardStatusIcon = (length) => {
        if (length === 1) {
            return cardIcon[0];
        } else if (length === 2) {
            return cardIcon[1];
        } else if (length === 3) {
            return cardIcon[2];
        } else {
            return cardIcon[3];
        }
    }
    getNoOfColumns = (length) => {
        if (length === 1) {
            return 1;
        } else if (length === 2) {
            return 2;
        } else if (length === 3) {
            return 3;
        } else {
            return 4;
        }
    }

    renderETLComponent() {
        return (
            <div>
                <ETLcomponent />
            </div>
        )
    }

    getServicesCall = () => {    
        
        let  params = {
            // APPLICATION_NAME:this.props.appName,
            //APPLICATION_ID:this.state.systemSelectedValue,
            APPLICATION_NAME:this.state.appName,
            COMPONENT_NAME:"ETL",
            START_DATE:currentDate+startDateTime,      
            END_DATE:currentDate+currentTime
           }
       
        //http.get(configData.API.SERVICE.LANDING,{params})
      //  .then(response => {
        //   if(response && response.data.length>0){
            //   let numberOfLayers = response.data;
               if(this.state.dashboardResponse.data.length>0){                   
                   let numberOfLayers = this.state.dashboardResponse.data;           
                    let cardCollectionDivItems = [];
                    numberOfLayers.forEach((layer1, layerIndex) => {
                        var listOfLayers = layer1.listOfLayers;
                        ListOfLayersLength=listOfLayers.length;
                        // console.log("listOflayer length",ListOfLayersLength)
                    listOfLayers.forEach((layer, layerIndex) => {
                        let eachLayerServices = layer.listOfItems;
                        let servicesCount = eachLayerServices.length;
                        let cardItems = [];
                        let cardCollectionItems = [];
                        let cardCollectionCnt = 0;
                        let cnt = 0;
                        let layoutType = this.getlayout(servicesCount);
                        let CardCSS = this.getCardCSS(servicesCount);
                        let statusIcon = this.getCardStatusIcon(servicesCount);
                        let noofColumns = this.getNoOfColumns(servicesCount);
                        eachLayerServices.forEach((service, serviceIndex) => {
                            console.log("serviceIndex:" + service);
                            let serviceName = service.serviceName;
                            let cardCollection = "CardCollection" + serviceName;
                            let normal = service.normal;
                            let warning = service.warning;
                            let error = service.error;
                            let statusCount;
                            let statusIconType;
                            let statusMsg;
                            if (!this.props.statusClickStatus) {
                                
                                if (error !== 0 && error !== undefined) {
                                    statusCount = error;
                                    statusIconType = ERROR_ICON;
                                    (statusCount <= 1 ? statusMsg = "Error": statusMsg = "Errors");
                                } else if (warning !== 0 && warning !== undefined) {
                                    statusCount = warning;
                                    statusIconType = WARNING_ICON;
                                    (statusCount <= 1 ? statusMsg = "Warning": statusMsg = "Warnings");
                                } else {
                                    statusCount = normal;
                                    statusIconType = SUCCESS_ICON;
                                    statusMsg = "Success";
                                }
                            }
                            else {

                                if (this.props.updateElementId == "Normal") {
                                    statusCount = normal;
                                    statusIconType = SUCCESS_ICON;
                                    statusMsg = "Success";
                                }
                                if (this.props.updateElementId == "Error") {
                                    statusCount = error;
                                    statusIconType = ERROR_ICON;
                                    (statusCount <= 1 ? statusMsg = "Error": statusMsg = "Errors");
                                }
                                if (this.props.updateElementId == "Warning") {
                                    statusCount = warning;
                                    statusIconType = WARNING_ICON;
                                    (statusCount <= 1 ? statusMsg = "Warning": statusMsg = "Warnings");
                                }
                            }
                            cnt = cnt + 1;
                            let layerName = (serviceName.replace(/\s/g, '').toUpperCase());
                            this.setState({ layerName: layerName });
                            console.log("layerName", layerName);
                            console.log("State layerName", this.state.layerName);
                            let iconConstName = this.state.layerName + '_ICON';
                            let iconName = PORTAL_ICON;
                            if (undefined !== ICON_ARRAY[0][iconConstName]) {
                                iconName = ICON_ARRAY[0][iconConstName];
                            }
                            let dispCardIcon = (<div style={{ width: "100%", clear: "both" }}>
                                <div key={serviceName} className={statusIcon[0]}>
                                    {iconName}
                                    <div className={statusIcon[1]}>{serviceName}</div>
                                </div>
                                <div key={serviceName} className={statusIcon[5]}>{statusIconType}</div>
                                {/* <div key={serviceName} className={statusIcon[2]}>
                                    <div key={serviceName} className={statusIcon[3]}>{statusCount}</div>
                                    <div key={serviceName} className={statusIcon[4]}>&nbsp;{statusMsg}</div>
                                </div> */}
                            </div>);
                            cardItems.push(<div
                                id={layerName}  
                                key={layerName}                              
                                className="card"
                                style={{width: "100%", padding:"15px",display:"flex",flex:"1",backgroundColor: "#FFF", }}
                                // autoResize={this.state.responsive}
                                // selectable={this.state.selectable}
                                // singleSelection={this.state.singleSelection}
                              //  selectableCardSizeNotChanged={this.state.selectableCardSizeNotChanged}
                                onClick={this.props.clickHandler}
                                // onCardChangeState={e => console.log("this is called")}
                                // dataTest={serviceName}
                                // ref={serviceName}
                            >{dispCardIcon}</div>);
                            
                            if ((cnt % noOfCardsEachLine === 0) || (cnt === servicesCount)) {
                                let layoutTypeCnt;
                                if (cnt % noOfCardsEachLine !== 0 && servicesCount > noOfCardsEachLine) {
                                    layoutTypeCnt = servicesCount - (noOfCardsEachLine * cardCollectionCnt);
                                    layoutType = layout5[layoutTypeCnt - 1];
                                }
                                cardCollection = cardCollection + cnt;
                                cardCollectionItems.push(<div
                                    id={cardCollection}
                                    className="cardCollection"
                                    style={{display:"flex",flex:"1",flexWrap:"wrap", width:"auto",
                                    marginLeft:"15px"
                                    }}
                                    // isDraggable={false}
                                                                     
                                    // cols={noofColumns}
                                    // minCardWidth="auto"
                                    // rowHeight={100}//105
                                    // margin={cardCollectionMargin[cardCollectionCnt]}
                                    // padding={cardCollectionPadding[cardCollectionCnt]}
                                    // layout={layoutType}
                                    // onLayoutChange={(newLayout) => {
                                    //     console.log('newLayout: ', newLayout);
                                    // }}
                                >
                                    {cardItems}
                                </div>);
                                cardItems = [];
                                cardCollectionCnt = cardCollectionCnt + 1;
                            }
                        })
                        cardCollectionDivItems.push(
                        <div className="divStyleForCard">
                            {cardCollectionItems}
                        </div>)
                    })
                })
                    this.setState({ cardCollectionDivItems: cardCollectionDivItems });
            
                } 
                 if (this.state.dashboardResponse && ListOfLayersLength===0) { 

                    console.log("responseLength"+ this.state.dashboardResponse);
                    let temp= <UnderDevlopment />

                     this.setState({ cardCollectionDivItems: temp });
                    
                } 
                // else {
                //     console.log("Failed to get data");
                //     let temp= <UnderDevlopment />

                //     this.setState({ cardCollectionDivItems: temp });
                // }
    
           // })
            //.catch(error => this.setState({ error }));
    }

    onChange = newText => this.setState({ text: newText.value });

    render() {

        const { responsive, selectable, singleSelection, selectableCardSizeNotChanged } = this.props;

        const responsiveCardCss = backgroundColor =>
            (responsive ? { backgroundColor, height: 275 } : { backgroundColor, width: 250, height: 275 });

        return (

            <div style={{ marginBottom: "40px" }}>

                {this.state.cardCollectionDivItems}

            </div>


        );
    }

}

function mapStateToProps(state){
    return {
      dashboardResponse: state.dashboardResponse
    }
  }
  
export default connect(mapStateToProps)(CardCollectionComponent);