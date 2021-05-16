import React, { Component } from 'react';
import{ExpansionPanel,SvgIcon,Card,CardCollection,
    Button,SelectItem,Calendar,TextInput} from '@nokia-csf-uxr/csfWidgets';
import { PieChart } from '@nokia-csf-uxr/ccht';
import PropTypes from 'prop-types';
import http from './service';
import '@nokia-csf-uxr/ccht/ccht.css';
import configData from "../Config.json";
import * as dateTime from './DateAndTime';
import moment from 'moment';
import DisplayError from './DisplayError';



const startDateTime="00:00";    
const currentDateTime="23:59"

//const currentTime = dateTime.getPortalCurrentTime();
 
const lastSevenDays = dateTime.getLastSevenDays();  
const yesterDay = dateTime.getYesterDay();
const pickDate = [
    {     
      label: "Current Day",
      value: "Current Day"
    }
    // {
    //   label: "Yesterday",
    //   value: "Yesterday"
    // },
    // {
    //   label: "Last 7 days",
    //   value: "Last 7 days"
    // },
    // {
    //   label: "Custom Range",
    //   value: "Custom Range"
    // }
  ];
  

const VIEW_CHART = <SvgIcon key="icon-error" iconWidth="20" icon="ic_view_chart" iconColor="rgb(18, 65, 145)" />;

const ERROR_ICON = <SvgIcon key="icon-error" iconWidth="20" icon="ic_exclude" iconColor="rgb(199, 47, 33)" />;
const WARNING_ICON = <SvgIcon key="icon-warning" iconWidth="20" icon="ic_warning" iconColor="rgb(232, 157, 0)" />;
const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;


const layout = [
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



const layout2 = [
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



class PortalComponent extends Component{
    constructor(props){
        super(props);
        
        this.state={
            cardCollectionItems:[],
            portalCount:0,            
            portalRunTime:[],
            statusIcon: "",
            statusColor:"",
            selectedValue:"Current Day",            
            isCustomRange:false,
            appID:props.appID,
            appName:props.appName,
            isErrorCode:false,
            defaultDateSelection:"Current Day"
        } 
        console.log("lastSevenDays:",lastSevenDays);        
       this.getPortalHealthDetails();     
    };     

    onDateSelection = e => {
        const pickDate = e.value;          
               
        if(pickDate === "Current Day"){       
            this.setState({defaultDateSelection:"Current Day",selectedValue:"Current Day"});
            this.getPortalHealthDetails();        
        }
        // else if(pickDate === "Yesterday"){
        //      this.setState({ startDate: yesterDay+startDateTime,isCustomRange:false }, () => {            
        //       this.getPortalHealthDetails();
        //       });
        // }
        // else if(pickDate === "Last 7 days"){       
        // this.setState({ startDate: lastSevenDays+startDateTime,isCustomRange:false }, () => {            
        //     this.getPortalHealthDetails();
        //   });
        // }
        // else if(pickDate === "Custom Range"){
        //     this.setState({isCustomRange:true});
        // }
        // else{           
           
        //     this.setState({ startDate: currentDate+startDateTime,isCustomRange:false }, () => {              
        //        this.getPortalHealthDetails();
        //       });
        // }                
        
    
      };

      getTotalTime=(data)=>{   
         
        let totalminutes=Number(data);

        if(totalminutes > 60){

        let hours = Math.floor(totalminutes / 60);
            if(hours <=1 ){   
            hours = hours+" "+"hr";  
            }
            else{
                hours = hours+" "+"hrs"; 
            } 

        let minutes = totalminutes % 60;

        if(minutes <=1 ){   
            minutes = minutes+" "+"min";
        }
        else{
        minutes = minutes+" "+"mins";
        }
        return hours+" "+minutes;
        }

        else{
            if(totalminutes <= 1){                
            return totalminutes+" "+"min";
            } 
            else{
                return totalminutes+" "+"mins";
            }
        }
      }
    
    
    getPortalHealthDetails =()=>{     
          
           const params = {   
            applicationName: this.props.appName,
            applicationId: this.props.appID,
            layerName:"PORTAL SERVICE",       
            startTime:dateTime.getCurrentDate()+" "+startDateTime,            
            endTime:dateTime.getCurrentDate()+" "+currentDateTime
          }         
        
         http.get(configData.API.SERVICE.PORTAL,{params})
            .then((response) => {
                console.log("Portal Response:"+response.data);

                if (response && response.data && response.data.statusCode === "200") {                 
                  
                   this.setState({isErrorCode:false})
                   let healthStatusDetails=response.data.responseObject.healthStatus
                    let portalCount=healthStatusDetails.length;
                    let portalEndTime=response.data.endTime;
                    this.setState({portalCount:portalCount});
                    let layoutType=layout;
                    let cardPerPortal = [];
                    let cardCollectionPortalArr=[];
                    let cardCollectionItems=[];
                    let portalRunTime=[];
                    let cnt = 0;
                    let cardCollectionCnt = 0;
                    let errorStatus = false;
                    let successStatus = false;
                    let warningStatus = false;
                    healthStatusDetails.forEach((portal,index)=>{                                             
                        let portalService=portal.portalService;
                        let portalName=portalService.portalName; 
                        let portalURL=portalService.portalURL;
                        let portalStatus= portalService.portalStatus;                         
                        
                        let totalUPTime = this.getTotalTime(portalService.portalUpTime);                                            
                        let totalDownTime = this.getTotalTime(portalService.portalDownTime);
                        
                        let totalUPTimeChart= Number(portalService.portalUpTime);
                        let totalDownTimeChart= Number(portalService.portalDownTime);

                        // if(portalStatus==="SUCCESS" && totalUPTimeChart==0 && totalDownTimeChart>0 ||
                        //   portalStatus==="SUCCESS" && totalUPTimeChart==0 && totalDownTimeChart==0){
                        //     totalDownTimeChart = 0;
                        //     totalUPTimeChart = 1;
                        // }

                        let lastUpdatedStartTime = portalService.lastUpdatedStartTime;
                        let lastUpdatedEndTime = portalService.lastUpdatedEndTime;

                        cnt = cnt+1;
                        let statusIcon;
                        let statusColor;
                        if (portalStatus === 'FAILED') {
                            errorStatus = true;
                            //statusIcon = ERROR_ICON;   
                            statusColor= "errorText";                         
                        } else if (portalStatus === 'WARNING') {
                            warningStatus = true;
                           // statusIcon = WARNING_ICON;        
                            statusColor= "warningText";                    
                        } else if (portalStatus === 'SUCCESS') {
                            successStatus = true;
                           // statusIcon = SUCCESS_ICON; 
                            statusColor = "successText";                           
                        }
                        this.setState({ statusColor:statusColor});
                        let displayCardContent=(
                            <div>                                
                                <div style={{borderBottom:"1px solid lightgray",paddingBottom:"4px",fontSize:"14px",fontFamily:"Nokia Pure Text Bold"}}>{portalName}</div>
                                <div id="statusContainer" style={{marginTop:"8px",border:"1px solid lightgray", 
                                borderRadius:"2px", background: "#fafafa", padding:"4px",fontSize:"12px"}}>                        
                                
                                <div style={{marginBottom:"2px"}}>
                                    <span style={{marginRight:"4px"}}>Status :</span>
                                    <span className={statusColor} style={{ fontSize: "10px", fontFamily: 'Nokia Pure Text Medium'}}>{portalStatus}</span>
                                </div>
                               
                                <div style={{color:"#9E9E9E",fontSize:"10px"}}>{lastUpdatedEndTime}</div>  
                                                            
                                </div>
                                <div id="urlContainer" style={{marginTop:"8px",border:"1px solid lightgray", 
                                borderRadius:"2px", background: "#fafafa", padding:"4px",fontSize:"12px"}}>
                                 <div style={{marginBottom:"2px",textDecoration:"underline"}}>{portalURL}</div>                                 
                                 <div style={{color:"#9E9E9E",fontSize:"10px"}}>Portal URL</div>                                
                                </div>
                                <div style={{width:"200px", float:"right"}}>
                                <PieChart id="twoSegments" title=""
                               width="85%" height="85%" activeIndex={0} 
                                    data={[{ value: totalUPTimeChart,fill:"#80AD07"}, { value: totalDownTimeChart,fill:"#D9070A"}]} 
                                   outerRadius="80%" innerRadius="50%" animate={false}
                                    expandOption={false} showLabel={false} tooltip={false}/>
                                </div>
                                <div id="chartLegend" style={{width:"160px"}}>
                                <div id="upTime" style={{marginTop:"12px"}}>
                                    <span style={{display:"inline-block",width:"10px",height:"10px",background:"#80AD07"}}></span>
                                    <span style={{marginLeft: "6px",fontSize: "14px",fontFamily: 'Nokia Pure Text Medium'}}>{totalUPTime}</span>
                                    <div style={{color:"#9E9E9E",fontSize:"12px"}}>Total Up Time</div>
                                </div>
                                <div id="downTime" style={{marginTop:"12px"}}>
                                    <span style={{display:"inline-block",width:"10px",height:"10px",background:"#D9070A"}}></span>
                                    <span style={{marginLeft: "6px",fontSize: "14px",fontFamily: 'Nokia Pure Text Medium'}}>{totalDownTime}</span>
                                    <div style={{color:"#9E9E9E",fontSize:"12px"}}>Total Down Time</div>
                                </div>
                                </div>
                                {/* <div className="diagonisebtn" style={{marginLeft:"0px",borderRadius:"2px",marginTop:"20px"}}>
                                <Button id="diagnose" text="DIAGNOSE" aria-label="Diagnose" />
                                </div>                                */}
                            </div>
                        );
                        cardPerPortal.push(
                            <Card
                                id={portalName}
                                key={portalName}
                                className="card"
                                css={{height: 300, width: 900, backgroundColor: "#FFF"}}
                                autoResize={false}
                                selectable={false}
                                singleSelection={false}
                                selectableCardSizeNotChanged={false}
                                onClick={this.onCardClick}
                                onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                                dataTest="cardcollection-card1"
                                >     
                            {displayCardContent}
                            </Card>
                        );
                        if((cnt % 3 == 0)||(cnt == portalCount)){
                            let layoutTypeCnt;
                                                      
                            if (cnt % 3 !== 0 && portalCount > 3) {
                                layoutTypeCnt = portalCount - (3 * cardCollectionCnt);
                                layoutType = layout2[layoutTypeCnt - 1];
                            }
                            else if(cnt === portalCount && portalCount < 3){  
                                layoutType = layout2[portalCount - 1];
                            }
                        
                            cardCollectionCnt = cardCollectionCnt + 1;

                        cardCollectionPortalArr.push(<CardCollection
                            id={portalName+"cardCollection"}
                            className="cardCollection"
                            isDraggable={false}
                            width={"1100"}
                            cols={3}
                            rowHeight={330}
                            margin={[10, 10]}
                            padding={[0, 0]}
                            layout={layoutType}
                            onLayoutChange={(newLayout) => {
                                console.log('newLayout: ', newLayout);
                            }}
                        // onSelectionChanged={this.onSelectionChanged}
                        // deSelectAll={this.state.deSelectAll}
                        >
                        {cardPerPortal}
                        </CardCollection>
                        );
                        cardPerPortal=[];
                        }
                    })
                    if(errorStatus){
                        this.setState({statusIcon: ERROR_ICON});
                    }
                    else if(warningStatus){
                        this.setState({statusIcon:WARNING_ICON});
                    }
                    else{
                        this.setState({statusIcon:SUCCESS_ICON});
                    }
                    
                    cardCollectionItems.push(
                        <div>
                            {cardCollectionPortalArr}
                        </div>
                    );
                    this.setState({ cardCollectionItems: cardCollectionItems });  
                    this.setState({portalRunTime:portalRunTime});
                }
                else{
                    if(response.data.statusCode === "204"){
                        this.setState({isErrorCode:true});
                        let temp= <DisplayError statusDesc={response.data.statusDesc}/>
                        this.setState({ cardCollectionItems: temp });
                    }
                }
            })
        
            .catch(error => {
                this.setState({isErrorCode:true});
                        let temp= <DisplayError statusDesc={error}/>
                        this.setState({ cardCollectionItems: temp });
                
            });
        
    }

    static propTypes = {
        isOpen: true,
        title: PropTypes.string.isRequired,
        all: PropTypes.bool,
        togglePanel: PropTypes.func,
    };

    static defaultProps = {
        isOpen: true,
        all: false,
        togglePanel: () => 0,
    };

    renderCustomDateSelection = () =>{
        return(
            <div style={{display:"flex",flexDirection:"row",float:"right"}}>
                
                <span style={{marginTop:"-7px", marginLeft:"-18px"}}>
                
                <Calendar closeOnClickOutside={true}
                isTimeFormat24Hr={true}
                field={{
                    label: 'Sart Date',                   
                    isVisible: true,
                    width: 150,
                    format: 'DD-MM-YYYY'
                }}
                
              onChange={this.handleCalendarChange}
              getRef={(refs) => { console.log("Date refs:",refs); }}
                />
                </span>
                
                <span style={{marginTop:"-7px",marginLeft:"0px"}}>
                <Calendar closeOnClickOutside={true}
                isTimeFormat24Hr={true}
                field={{
                    label: 'End Date',                   
                    isVisible: true,
                    width: 150,
                    format: 'DD-MM-YYYY'
                }}
                />
                </span>
            </div>
        )
    }

    renderExpansionHeader = (applyClass)=>{
        return(
        <div>
        <div id="headerContainer" className="headerContainers">
          <span style={{float:"left",marginLeft:"-13px",marginRight:"8px"}}>{this.state.statusIcon}</span>
          <span style={{
            float: "left", fontSize: "16px",
            fontFamily: '"Nokia Pure Text Medium", Arial, sans-serif',
            marginTop:"2px"
          }}>
            {"Health status"}</span>
        </div>
        <div id="rightContainer" style={{ display: "flex", float: "right",marginTop:"6px",marginRight:"20px"}}>
          <span style={{           
            fontFamily: '"Nokia Pure Text Medium", Arial, sans-serif',
            marginRight: "4px"            
          }}>
            {this.state.portalCount}</span>
          <span className="totalInterfaces">No.of Portals</span>          
       {/* <span style={{ marginTop: "-5px", marginRight: "0px"}} className={this.props.class}> {EXPORT_ICON} </span>
            <span id="Export" className={this.props.class}>Export      
        </span>  */}
        <span className= {applyClass} style={{marginTop:"-7px"}}>
            <SelectItem 
            id="system"
            width={120}
            height={500}
            required={true}
            placeholder={this.state.defaultDateSelection}
            options={pickDate}
            selectedItem={this.state.selectedValue}
            onChange={this.onDateSelection}            
           />  
         </span>
         {/* {this.state.isCustomRange && applyClass=="showElement" &&this.renderCustomDateSelection()} */}
        </div>        
      </div>
        );
    }

    render() {
        const { isOpen, all, togglePanel } = this.props;
       
        if (isOpen) {
            return (
                <div className="csfWidgets expansion-panel-basic-item">
                    <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="true">
                      
                       {this.renderExpansionHeader("showElement")}
                    <span className="chevron-indicator">
                            <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                        </span>
                    </div>

                    <div>
                    {this.state.isCustomRange && this.renderCustomDateSelection()}
                    {this.state.cardCollectionItems}
                    
                    </div>
                </div>
            );
        
    }


        return (
            <div>
            <div className="csfWidgets expansion-panel-basic-item">
                <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="false">
                    
                
                {this.renderExpansionHeader("hideElement")}  
                              <span className="chevron-indicator">
                        <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
                    </span>
                </div>
            </div>
            {this.state.isErrorCode && this.state.cardCollectionItems}
            
            </div>
        );

    }

}
//export default PortalComponent;

class PortalExpansionPanel extends Component {
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
                    id="PortalHealthStatusExpansion"
                    height={-1} 
                    hideDefaultControl
                    areBordersVisible={false}
                    isShadowVisible={false}
                    dividers={true}
                    width={1150}
                >

                    <PortalComponent all togglePanel={this.toggle('panel1')}
                        isOpen={this.state.panel1Expanded} updateClickvalue={this.props.updateClickvalue}
                        updateElementId={this.props.updateElementId}
                        statusClickStatus={this.props.statusClickStatus} 
                        appID={this.props.appID} appName={this.props.appName}/>

                </ExpansionPanel>
            </div>

        );
    }
}

export default PortalExpansionPanel;