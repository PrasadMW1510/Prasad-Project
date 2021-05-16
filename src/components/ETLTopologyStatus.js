import React, { Component } from 'react';
import { Card, SvgIcon, CardCollection, ExpansionPanel } from '@nokia-csf-uxr/csfWidgets';
import { ChartComponent, ChartContainer } from '@nokia-csf-uxr/ccht';
import CommonEnums from '@nokia-csf-uxr/ccht/utils/CommonEnums';
import '@nokia-csf-uxr/ccht/ccht.css';
import PropTypes from 'prop-types';
import ExpandedLayerHeader from './ExpandedLayerHeader';
import '../Styles/Expansion.css';
import '../Styles/ETLInputDirectoryStatistics.css';
import http from './service';
import configData from "../Config.json";
import * as dateTime from './DateAndTime';
import moment from 'moment';

const currentDate = moment(dateTime.getCurrentDate()).format('YYYY-DD-MM');
const currentTime = dateTime.getCurrentTime();
const startDateTime="00:00:00";    


const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const ERROR_ICON = <SvgIcon key="icon-error" iconWidth="20" icon="ic_exclude" iconColor="rgb(199, 47, 33)" />;
const WARNING_ICON = <SvgIcon key="icon-warning" iconWidth="20" icon="ic_warning" iconColor="rgb(232, 157, 0)" />;

const barChartData = {
    chart: {
        type: 'bar'
    },
    xAxis: {
        lineColor: '#fff',
        categories: ['ETL Backlog Count', 'Rejected Count', 'Usage Backlogs', 'Error File Count'],
        title: {
            text: null
        }
    },
    yAxis: {
        visible: false,
        min: 0,
        title: {
            align: 'high'
        },
        labels: {
            enabled: false
        }
    },
    tooltip: {
        valueSuffix: ' millions'
    },
    plotOptions: {
        series: {

            borderRadius: 3,
            groupPadding: 0,
            pointPadding: 0,
            pointWidth: 20
        },
        bar: {
            dataLabels: {
                enabled: true
            }
        }
    },
    legend: {
        enabled: false
    },
    credits: {
        enabled: false
    },
    series: [{
        data: [300, 200, 100, 500],
        dataLabels: { enabled: true, color: '#333', crop: false, overflow: "none", inside: false, x: -5 }
    }]
};


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
const layout6 = [
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
    },
    {
        x: 4, y: 1, w: 1, h: 1, i: '4'
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
var isExpanded = false;
const noOfCardsEachLine = 4;
class ETLInputDirectoryStatistics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cardCollectionDivItems: [],
            checked: false,
            storeCards: [],
            toggleLabel: "Hide",
            interfaceCount: 0,
            statusIcon: "",
            etlLayerName: "Topology Status"
        }
        this.getETLDetails();
    };

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

    updateState = (e) => {
        //alert(e.value);
        if (e.value == true) {
            isExpanded = true;
        }
        else {
            isExpanded = false;
        }
        // alert(isExpanded);
        this.setState({ checked: e.value });
        /* for(let i=0;i<this.state.storeCards.length;i++){
            // alert(!this.state.isExpanded);
            
           document.getElementById(this.state.storeCards[i]).setAttribute("initiallyExpanded",isExpanded)
           //document.getElementsByTagName("H1")[0].setAttribute("class", "democlass");.
         }*/
    };

    getETLDetails = () => {
        // const params = {
        //     APPLICATION_NAME:"NCI",
        //     COMPONENT_NAME:"ETL",
        //     START_DATE:"2021-02-09 14:03:10",
        //     END_DATE:"2021-02-09 14:03:10"            
        //   } 
        
        const params = {
            APPLICATION_NAME:"CXM",
            COMPONENT_NAME:"ETL",
            START_DATE:currentDate+" "+startDateTime,      
            END_DATE:currentDate+" "+currentTime
          }


       // http.get('https://default.mdaupdate.insights.dyn.nesc.nokia.net/etlservice',{params})
       http.get(configData.API.SERVICE.ETL,{params})
            .then((response) => {
                if (response && response.data) {
                    const interfaceDetails = response.data.interfaceDetails;
                    let interfaceCount = interfaceDetails.length;
                    this.setState({ interfaceCount: interfaceCount });
                    let layoutType = this.getlayout(interfaceCount);
                    let cardPerInterfaceArr = [];
                    let cardCollectionInterfaceArr = [];
                    let cnt = 0;
                    let checkInterfaceCnt = 0;
                    let cardCollection;
                    let cardCollectionDivItems = [];
                    let errorCnt, warningCnt, normalCnt = 0;
                    let cardCollectionCnt = 0;
                    interfaceDetails.forEach((interfaceDtl, interfaceIndex) => {
                        let interfaceName = interfaceDtl.name;
                        this.state.storeCards.push(interfaceName);
                        let fileAvailablity = interfaceDtl.fileAvailablity;

                        let topologyStatus = fileAvailablity.topologyStatus;
                        let srcBacklog = topologyStatus.srcBacklog;
                        let etlBacklog = topologyStatus.etlBacklog;
                        let usageBacklog = topologyStatus.usageBacklog;
                        let rejectedCnt = topologyStatus.rejectedCnt;
                        let errFileCnt = topologyStatus.errFileCnt;
                        let status = topologyStatus.status;
                        cnt = cnt + 1;
                        let statusIcon;
                        if (status === 'ERROR') {
                            statusIcon = ERROR_ICON;
                            errorCnt = errorCnt + 1;
                        } else if (status === 'WARNING') {
                            statusIcon = WARNING_ICON;
                            warningCnt = warningCnt + 1;
                        } else if (status === 'SUCCESS') {
                            statusIcon = SUCCESS_ICON;
                            normalCnt = normalCnt + 1;
                        }
                        if ((!this.props.statusClickStatus) ||
                            (this.props.statusClickStatus && this.props.updateElementId === "Error" && status === 'ERROR')
                            || (this.props.statusClickStatus && this.props.updateElementId === "Warning" && status === 'WARNING')
                            || (this.props.statusClickStatus && this.props.updateElementId === "Normal" && status === 'SUCCESS')) {
                            let displayData = (
                                <div style={{ display: "flex" }}>
                                    <div style={{ marginTop: "-3px" }}>{statusIcon}</div>
                                    <div className="interfaceName">{interfaceName}</div>
                                </div>
                            );
                            let displyExpandPanelContent = (
                                <div style={{ width: "200px" }}>
                                    <ChartContainer
                                        id="start-chart-line-chart"
                                        renderChart={props => (
                                            <ChartComponent
                                                options={{
                                                    xAxis: barChartData.xAxis,
                                                    yAxis: barChartData.yAxis,
                                                    tooltip: {
                                                        enabled: false
                                                    },
                                                    series: [{
                                                        showInLegend: false,
                                                        data: [etlBacklog, rejectedCnt, usageBacklog, errFileCnt],
                                                        dataLabels: { enabled: true, color: '#333', crop: false, overflow: "none", inside: false, x: -5 }
                                                    }],
                                                    plotOptions: barChartData.plotOptions,
                                                    colors: CommonEnums.LINE_COLUMN_CHART_COLOR_SET,
                                                    chart: barChartData.chart
                                                }}
                                                {...props}
                                            />
                                        )}
                                        onChange={eventData => console.log(eventData)}
                                    />
                                </div>
                            );
                            cardPerInterfaceArr.push(
                                <Card
                                    id={interfaceName}
                                    className="csfWidgets-card"
                                    expansionChildren={[displyExpandPanelContent]}
                                    expandable={true}
                                    initiallyExpanded={isExpanded}
                                    expansionPanelHeight={185}
                                    // expansionChildren={this.state.isExpanded}
                                    //onClick={this.onClick()}
                                    //onCardChangeState={onCardChangeState()}
                                    //onCardSelected={onCardSelected()} 
                                    css={{ height: 100, backgroundColor: "#FFF" }}
                                //onCardExpansion={onCardExpansion()}
                                >
                                    {[displayData]}
                                </Card>
                            );
                            checkInterfaceCnt = checkInterfaceCnt + 1;

                        }
                        cardCollection = "CardCollection" + interfaceName;
                        if ((!this.props.statusClickStatus) && ((cnt % noOfCardsEachLine === 0) || (cnt === interfaceCount))) {
                            let layoutTypeCnt;
                            if (cnt % noOfCardsEachLine !== 0 && interfaceCount > noOfCardsEachLine) {
                                layoutTypeCnt = interfaceCount - (noOfCardsEachLine * cardCollectionCnt);
                                layoutType = layout5[layoutTypeCnt - 1];
                            }
                            cardCollectionCnt = cardCollectionCnt + 1;
                            cardCollection = cardCollection + cnt;
                            cardCollectionInterfaceArr.push(<CardCollection
                                id={cardCollection}
                                className="cardCollection"
                                isDraggable={false}
                                width={"1100"}
                                cols={noOfCardsEachLine}
                                rowHeight={140}
                                margin={[10, 10]}
                                padding={[0, 0]}
                                border="4px solid red"
                                layout={layoutType}
                                onLayoutChange={(newLayout) => {
                                    console.log('newLayout: ', newLayout);
                                }}
                            // onSelectionChanged={this.onSelectionChanged}
                            // deSelectAll={this.state.deSelectAll}
                            >
                                {cardPerInterfaceArr}
                            </CardCollection>
                            );
                            cardPerInterfaceArr = [];
                        } else if ((this.props.statusClickStatus) && ((checkInterfaceCnt % noOfCardsEachLine === 0 && checkInterfaceCnt > 0) || (cnt === interfaceCount))) {
                            let layoutTypeCnt;
                            cardCollectionCnt = cardCollectionCnt + 1;

                            if (checkInterfaceCnt >= noOfCardsEachLine) {
                                layoutType = this.getlayout(noOfCardsEachLine);
                            }
                            if (cnt === interfaceCount) {
                                if (checkInterfaceCnt > noOfCardsEachLine) {
                                    layoutTypeCnt = checkInterfaceCnt - (noOfCardsEachLine * cardCollectionCnt);
                                    layoutType = layout5[layoutTypeCnt - 1];
                                } else if (checkInterfaceCnt < noOfCardsEachLine) {
                                    layoutType = layout5[checkInterfaceCnt - 1];
                                }
                                this.setState({ interfaceCount: checkInterfaceCnt });
                            }
                            cardCollection = cardCollection + checkInterfaceCnt;
                            cardCollectionInterfaceArr.push(<CardCollection
                                id={cardCollection}
                                className="cardCollection"
                                isDraggable={false}
                                width={"1100"}
                                cols={4}
                                rowHeight={140}
                                margin={[10, 10]}
                                padding={[0, 0]}
                                border="4px solid red"
                                layout={layoutType}
                                onLayoutChange={(newLayout) => {
                                    console.log('newLayout: ', newLayout);
                                }}
                            // onSelectionChanged={this.onSelectionChanged}
                            // deSelectAll={this.state.deSelectAll}
                            >
                                {cardPerInterfaceArr}
                            </CardCollection>
                            );
                            cardPerInterfaceArr = [];
                        }

                    })
                    cardCollectionDivItems.push(
                        <div>
                            {cardCollectionInterfaceArr}
                        </div>
                    )

                    this.setState({ cardCollectionDivItems: cardCollectionDivItems });
                    if ((errorCnt !== 0 && !this.props.statusClickStatus) || (this.props.updateElementId === "Error" && this.props.statusClickStatus)) {
                        this.setState({ statusIcon: ERROR_ICON });
                    } else if ((warningCnt !== 0 && !this.props.statusClickStatus) || (this.props.updateElementId === "Warning" && this.props.statusClickStatus)) {
                        this.setState({ statusIcon: WARNING_ICON });
                    } else if ((normalCnt !== 0 && !this.props.statusClickStatus) || (this.props.updateElementId === "Normal" && this.props.statusClickStatus)) {
                        this.setState({ statusIcon: SUCCESS_ICON });
                    }
                } else if (response && response.data && !response.data.message && parseInt(response.data.statusCode, 10) === 200) {
                    console.log("Data not available");
                } else {
                    console.log("Failed to get data");
                }
            })
            .catch(error => this.setState({ error }));


    }

    static propTypes = {
        isOpen: PropTypes.bool,
        title: PropTypes.string.isRequired,
        all: PropTypes.bool,
        togglePanel: PropTypes.func,
    };

    static defaultProps = {
        isOpen: false,
        all: false,
        togglePanel: () => 0,
    };


    render() {
        const { isOpen, all, togglePanel } = this.props;
        if (isOpen) {
            return (
                <div className="csfWidgets expansion-panel-basic-item">
                    <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="true">
                        <ExpandedLayerHeader class={"showElement"} interfaceCount={this.state.interfaceCount}
                            statusIcon={this.state.statusIcon} etlLayerName={this.state.etlLayerName} 
                            topologyStats={true}/>
                        <span className="chevron-indicator">
                            <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                        </span>
                    </div>

                    <div>
                        {this.state.cardCollectionDivItems}
                    </div>
                </div>
            );

        }

        return (
            <div className="csfWidgets expansion-panel-basic-item">
                <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="false">
                    <ExpandedLayerHeader class={"hideElement"} interfaceCount={this.state.interfaceCount}
                        statusIcon={this.state.statusIcon} etlLayerName={this.state.etlLayerName} 
                        topologyStats={true}/>
                    <span className="chevron-indicator">
                        <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                    </span>
                </div>
            </div>
        );

    }

}

//export default ETLInputDirectoryStatistics;

class ExpansionPanelTopologyStatus extends Component {
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
            <div style={{ marginLeft: "18px", marginTop: "0px", overflowY: "overlay" }}>
                <ExpansionPanel
                    height={-1} /* automatically determine collapsed panel height */
                    hideDefaultControl
                    areBordersVisible={false}
                    isShadowVisible={false}
                    dividers={true}
                    width={1150}
                >

                    <ETLInputDirectoryStatistics all togglePanel={this.toggle('panel1')}
                        isOpen={this.state.panel1Expanded} updateClickvalue={this.props.updateClickvalue}
                        updateElementId={this.props.updateElementId}
                        statusClickStatus={this.props.statusClickStatus} />

                </ExpansionPanel>
            </div>

        );
    }
}

export default ExpansionPanelTopologyStatus;