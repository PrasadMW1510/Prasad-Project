import React,{Component} from 'react';
import { SelectItem,SvgIcon } from '@nokia-csf-uxr/csfWidgets';
import {GaugeChart,LineChart,BulletChart} from '@nokia-csf-uxr/ccht';
import http from '../service';
import configData from "../../Config.json"
import '../../Styles/CurrentUtilization.css';
import SparkLine from './SparkLine';
import SparkLinesInCardCollectionSource from './SparkLineInCardSol';
import AreaChartResponsiveContainer from './UtilizationTrendCPU';

import {ChartComponent,ChartContainer,ChartTitle} from '@nokia-csf-uxr/ccht';
import CommonEnums from '@nokia-csf-uxr/ccht/utils/CommonEnums';
import '@nokia-csf-uxr/ccht/ccht.css';

var defaultAppID,defaultAppName;
const CPU_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_cpu" iconColor="rgb(117, 117, 117)" />;

const averages = [
  [1246406400000, 15],
  [1246492800000, 10],
  [1246579200000, 15],
  [1246665600000, 12],
  [1246752000000, 10],
  [1246838400000, 15],
  [1246924800000, 16],
  [1247011200000, 15],
  [1247097600000, 16]
  
];

const plotbandFixedData = {
  legend: {
    enabled: false
},
tooltip: {
  enabled: false
},
  xAxis: {
    type: 'datetime',
    visible: false,
    accessibility: {
      rangeDescription: 'Range: Jul 1st 2009 to Jul 31st 2009.'
    },
    min: 1246406400000,
    max: 1248998400000
  },
  yAxis: {
    visible: false,
    title: {
      text: null
    },    
  },
  plotOptions: {
    line: {
      lineWidth: 1
    },
    series: {
      marker: {
        enabled:false
      }
    }
  },   
  
  series: [{
    data: averages,
    zIndex: 1,
    showInLegend: false
  }],
 
  chart: {}
};


class CurrentUtilization extends React.Component{
    constructor(props){
        super(props);
        
        defaultAppID = Number(window.localStorage.getItem("SELECTED_APPID"));
        defaultAppName = window.localStorage.getItem("SELECTED_APPNAME");
        this.onSystemNameChange = this.onSystemNameChange.bind(this);

        this.state = {
            systems: [],
            systemSelectedValue: defaultAppID,
            selectedNode:true,
            //selectedProject:false
        }
        this.enableContent = this.enableContent.bind(this);
        this.getApplicationNames();
    }



    onSystemNameChange = (e) => {
        const systemSelectedValue = e.value;
        const applicationName = e.nativeEvent.target.innerText;
        this.setState({systemSelectedValue:systemSelectedValue});
    
        window.localStorage.setItem("SELECTED_APPNAME",applicationName);
        window.localStorage.setItem("SELECTED_APPID",systemSelectedValue);
    
    }

    getApplicationNames = () => {
        
        http.get(configData.API.SERVICE.ONBOARD_APPNAMES)
          .then(response => {
            let applicationNames = response.data;        
            let appName=[];
            let appID=[];
            applicationNames.forEach((item,index)=>{
               appName.push(item.appName);  
               appID.push(item.id);    
            
            })   
    
            for(var i=0; i<appName.length; i++)  {
            this.state.systems.push({label: appName[i], value: appID[i]});           
                      
          }  
        
          })
    }
    
    enableContent(element){
      console.log("this event target:"+ element.target.id);
      

      if(element.target.id == "node"){
        this.setState({
          selectedNode:true         
        })
      }
      else{
        this.setState({
          selectedNode:false          
        })
      }

    }
    
    render(){
        return(
            <div>
            <div className="secondLayerContainer">
              <SelectItem
                id="system"
                hasOutline                
                width={200}
                height={500}
                required={true}
                options={this.state.systems}
                selectedItem={this.state.systemSelectedValue}
                onChange={this.onSystemNameChange}
              />
              <div className="computeCluster">
               COMPUTE CLUSTER
             </div>
             <div className="dataCluster" style={{background:"#f0f0f0",color:"#000"}}>
               DATA CLUSTER
             </div>
              </div>
              <div style={{background:"#fafafa"}}>  
              <div id="chart_Container" style={{paddingTop:"20px", display:"flex"}}>
                  <div id="cpuUsage" style={{width:"380px", height:"auto",background:"#fff",
                  border:"1px solid lightgray",marginLeft:"10px"}}>
                      <div style={{display:"flex",padding:"10px"}}>
                          <span>{CPU_ICON}</span>
                          <span>CPU Usage</span>
                      </div> 
                      <div style={{display:"flex"}}>
                      <div className="lineChartContainer" style={{width:"400px",position:"relative",top:"0px"}}>
                        {/* <SparkLine /> */}
                        {/* <SparkLinesInCardCollectionSource /> */}
                        <AreaChartResponsiveContainer />
                      </div>
                      {/* <div className="lineChartContainer" style={{width:"200px",position:"relative",top:"0px"}}>
                      <LineChart id="line-chart-id" 
                      data={[
                        {year:1940, CPU: 15}, 
                        {year: 1950, CPU: 20},
                        {year: 1960, CPU: 30}
                        ]} 
                        xDataKey="year" yDataKey={["CPU"]} xLabel="" yLabel="" title="" 
                        width={200} height={100} allowUserHideDatasets eventData={{identifier: "identifier"}} yLabelProps={{offset:
                      10}}  expandOption={false}  displayPoints={false} displayActiveDots={false} clickOutsideExits/>
                      </div>    */}
                      {/* <div id="gaugeContainer" style={{position:"relative"}}>
                      <GaugeChart id="gauge1" measurementValue={20} cx={80} cy={50} rangeData={[{Percentage: 20, Text: "of 100%", Color:
                      "#239cf9"}]} maxValue={100}/>
                      </div>                    */}
                      </div>                     
                    </div>   

                    
                    

                    <div id="memoryUsage" style={{width:"380px", height:"auto",background:"#fff",
                  border:"1px solid lightgray",marginLeft:"10px"}}>
                      <div style={{display:"flex",padding:"10px"}}>
                          <span>{CPU_ICON}</span>
                          <span>Memory Usage</span>
                      </div> 
                      <div style={{display:"flex"}}>
                      
                      <div className="lineChartContainer" style={{width:"200px",position:"relative",top:"0px"}}>
                      <LineChart id="line-chart-id" 
                      data={[
                        {year:1940, Memory: 15}, 
                        {year: 1950, Memory: 20},
                        {year: 1960, Memory: 30}
                        ]} 
                        xDataKey="year" yDataKey={["Memory"]} xLabel="" yLabel="" title=""
                        width={200} height={100} allowUserHideDatasets eventData={{identifier: "identifier"}} yLabelProps={{offset:10}}
                        expandOption={false}  displayPoints={false} displayActiveDots={false} clickOutsideExits/>
                      </div>   
                      <div id="gaugeContainer" style={{position:"relative"}}>
                      <GaugeChart id="gauge1" measurementValue={20} cx={80} cy={50} rangeData={[{Percentage: 20, Text: "of 100GB", Color:
                      "#03d0ff"}]} maxValue={100}/>
                      </div>                   
                      </div>
                      </div>

                      <div id="storageUsage" style={{width:"380px", height:"auto",background:"#fff",
                  border:"1px solid lightgray",marginLeft:"10px"}}>
                      <div style={{display:"flex",padding:"10px"}}>
                          <span>{CPU_ICON}</span>
                          <span>Storage Usage</span>
                      </div> 
                      <div style={{display:"flex"}}>
                      
                      <div className="lineChartContainer" style={{width:"200px",position:"relative",top:"0px"}}>
                      <LineChart id="line-chart-id" 
                      data={[
                        {year:1940, Storage: 15}, 
                        {year: 1950, Storage: 20},
                        {year: 1960, Storage: 30}
                        ]} 
                        xDataKey="year" yDataKey={["Storage"]} xLabel="" yLabel="" title=""
                        width={200} height={100} allowUserHideDatasets eventData={{identifier: "identifier"}} yLabelProps={{offset:
                      10}} expandOption={false}  displayPoints={false} displayActiveDots={false} clickOutsideExits/>
                      </div>   
                      <div id="gaugeContainer" style={{position:"relative"}}>
                      <GaugeChart id="gauge1" measurementValue={20} cx={80} cy={50} rangeData={[{Percentage: 20, Text: "of 100%", Color:
                      "#48bbad"}]} maxValue={100}/>
                      </div>                   
                      </div>
                      </div>
                </div> 
                <div id="buttonContainer" style={{display:"flex",padding:"10px 0px 0px 10px"}}>
                    <div id="node" className={this.state.selectedNode?'selectedElement':'actionButton'} onClick={this.enableContent}>NODES</div>                   
                    <div id="project" className={!this.state.selectedNode ? 'selectedElement':'actionButton'} onClick={this.enableContent} >PROJECTS</div>
                </div> 
                                     
                   {this.state.selectedNode ?<div id="nodeContent" style={{padding:"20px 0px 10px 10px",width:"1150px"}}>
                        <div id="rowHeaders" style={{display:"flex"}}>
                          <span style={{marginRight:"200px"}}>Node</span>
                          <span style={{marginRight:"130px"}}>#of Components</span>
                          <span style={{marginRight:"130px"}}>CPU Usage</span>
                          <span style={{marginRight:"130px"}}>Memory Usage</span>
                          <span>Storage Usage</span>
                        </div>
                        <div id="mainContainer" style={{marginTop:"10px"}}>
                          <div id="nodeDetails" style={{display:"flex",border:"1px solid lightgray",background:"#fff"}}>
                            <div id="nodeData" style={{width:"200px",marginRight:"50px",padding:"10px"}}>
                            <span>Node1</span>                            
                            <div>
                              <span style={{color:"#787878",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>Host Name :</span>
                              <span style={{paddingLeft:"4px",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>Lorem Ipsum</span>                              
                            </div>
                            <div>
                            <span style={{color:"#787878",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>IP Address :</span>
                            <span style={{paddingLeft:"4px",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>192.80.34.12</span>
                            </div>
                            </div>
                            <div id="totalcomponentContainer" style={{width:"150px",paddingTop:"30px",marginRight:"30px"}}>
                            <div id="totalComponents" style={{width:"70px",border:"1px solid #124191",textAlign:"center",
                              color:"#124191",borderRadius:"2px"}}>03</div>
                              </div>
                            <div id="cpuBulletChartContainer" style={{width:"200px",marginRight:"20px"}}>
                              <BulletChart id="id-1" title="80%" subtitle="of 100 GB" values={[
                                {value: 1, color: "rgba(0, 0, 0, .20)",type:"stroke"},
                                {value: 0.89, color: "#239cf9",type:"stroke"},
                                {value: 0.72, color: "orange",type:"edge"}]}/>
                              </div>

                              <div id="memoryBulletChartContainer" style={{width:"200px",marginRight:"30px"}}>
                              <BulletChart id="id-1" title="50%" values={[
                                {value: 1, color: "rgba(0, 0, 0, .20)",type:"stroke"},
                                {value: 0.50, color: "#03d0ff",type:"stroke"},
                                {value: 0.72, color: "orange",type:"edge"}]}
                                labels={[{label: "of 100 GB"}]}/>
                              </div>

                              <div id="storageBulletChartContainer" style={{width:"200px"}}>
                              <BulletChart id="id-1" title="40%" values={[
                                {value: 1, color: "rgba(0, 0, 0, .20)",type:"stroke"},
                                {value: 0.40, color: "#48bbad",type:"stroke"},
                                {value: 0.72, color: "orange",type:"edge"}]}/>
                              </div>                                     
                          </div>
                        </div>

                      </div> :  <div id="projectContent" style={{padding:"20px 0px 10px 10px",width:"1150px"}}>
                        <div id="rowHeaders" style={{display:"flex"}}>
                          <span style={{marginRight:"200px"}}>Project</span>
                          <span style={{marginRight:"130px"}}>#of Components</span>
                          <span style={{marginRight:"130px"}}>CPU Usage</span>
                          <span style={{marginRight:"130px"}}>Memory Usage</span>
                          <span>Storage Usage</span>
                        </div>
                        <div id="mainContainer" style={{marginTop:"10px"}}>
                          <div id="nodeDetails" style={{display:"flex",border:"1px solid lightgray",background:"#fff"}}>
                            <div id="nodeData" style={{width:"200px",marginRight:"50px",padding:"10px"}}>
                            <span>Project1</span>                            
                            <div>
                              <span style={{color:"#787878",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>Host Name :</span>
                              <span style={{paddingLeft:"4px",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>Lorem Ipsum</span>                              
                            </div>
                            <div>
                            <span style={{color:"#787878",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>IP Address :</span>
                            <span style={{paddingLeft:"4px",fontSize:"12px", fontFamily:"Nokia Pure Text Regular"}}>192.80.34.12</span>
                            </div>
                            </div>
                            <div id="totalcomponentContainer" style={{width:"150px",paddingTop:"30px",marginRight:"30px"}}>
                            <div id="totalComponents" style={{width:"70px",border:"1px solid #124191",textAlign:"center",
                              color:"#124191",borderRadius:"2px"}}>03</div>
                              </div>
                            <div id="cpuBulletChartContainer" style={{width:"200px",marginRight:"20px"}}>
                              <BulletChart id="id-1" title="80%" subtitle="of 100 GB" values={[
                                {value: 1, color: "rgba(0, 0, 0, .20)",type:"stroke"},
                                {value: 0.89, color: "#239cf9",type:"stroke"},
                                {value: 0.72, color: "orange",type:"edge"}]}/>
                              </div>

                              <div id="memoryBulletChartContainer" style={{width:"200px",marginRight:"30px"}}>
                              <BulletChart id="id-1" title="50%" values={[
                                {value: 1, color: "rgba(0, 0, 0, .20)",type:"stroke"},
                                {value: 0.50, color: "#03d0ff",type:"stroke"},
                                {value: 0.72, color: "orange",type:"edge"}]}
                                labels={[{label: "of 100 GB"}]}/>
                              </div>

                              <div id="storageBulletChartContainer" style={{width:"200px"}}>
                              <BulletChart id="id-1" title="40%" values={[
                                {value: 1, color: "rgba(0, 0, 0, .20)",type:"stroke"},
                                {value: 0.40, color: "#48bbad",type:"stroke"},
                                {value: 0.72, color: "orange",type:"edge"}]}/>
                              </div>                                     
                          </div>
                        </div>

                      </div>}
                                             
              </div>

              
            </div>
        );
    }
}

export default CurrentUtilization;