import React, { Component } from 'react';
import{Button,Card,SvgIcon} from '@nokia-csf-uxr/csfWidgets';
import '../../Styles/Adapter.css';
import http from '../../components/service';
import * as dateTime from '../../components/DateAndTime';

const currentDate = dateTime.getCurrentDate();
const currentTime = dateTime.getCurrentTime();
const startDateTime="00:00:00";    


const EDIT_ICON = <SvgIcon key="icon-edit" iconWidth="20" icon="ic_edit" iconColor="rgb(18, 65, 145)" />;
const DELETE_ICON = <SvgIcon key="icon-delete" iconWidth="20" icon="ic_delete" iconColor="rgb(217, 7, 10)" />;

class AdapterPreview extends Component{
    constructor(props){
        super(props);
        this.state={
            adaptersCardCollection:[]
        }

        this.getAdapterDetails();
    }

    getAdapterDetails=()=>{
        // var params={
        //     APPLICATION_NAME:"AdapterComponent",
        //     START_DATE:"2021-01-13 11:46:02",
        //     END_DATE:"2021-01-13 11:46:02"
        // }

        var params={
            APPLICATION_NAME:"AdapterComponent",
            START_DATE:currentDate+startDateTime,      
            END_DATE:currentDate+currentTime
        }

         http.get('http://127.0.0.1:8081/getAdapterDetails',{params})
         .then((response)=>{
            console.log("AdapterDetails:"+ JSON.stringify(response.data));
            if (response && response.data.length>0) {  

                const getadapters=response.data;
                let adaptersCardCollection=[];
                let adaptersCard=[];

                getadapters.forEach((adapterDtl,adapterIndex)=>{

                    let adapterDetails=adapterDtl.listOfAdapters;                    
                    adapterDetails.forEach((adapterList,index)=>{

                    let adapterName = adapterList.adapterName;
                    let adapterType = adapterList.adapterType;
                    let listOfAdapter = adapterList.listOfItems;

                    listOfAdapter.forEach((adpater,index)=>{
                        let integrationType = adpater.integrationType;
                        let integrationName = adpater.integrationName;
                        let protocol = adpater.protocol;
                        let hostDetails = adpater.hostDetails;
                        let sourceDirectory = adpater.sourceDirectory;
                        let frequency = adpater.frequency;
                        let numberOfRetries = adpater.numberOfRetries;
                        let fileNamingConventions = adpater.fileNamingConventions;
                        let monitorSubDirectories = adpater.monitorSubDirectories;
                        console.log("adpater.length"+Object.keys(listOfAdapter).length);
                        
                                       
                        let renderCardContent=(
                            <div id="mainContainer">
                                <div className="headerContainer">
                                <div className="adapterTextContainer">
                                <span className="adapterCount">{adapterName}</span>
                                <span className="adapterType">{adapterType}</span>
                                </div>
                                <div className="iconsContainer">   
                                <span style={{marginRight:"20px",cursor:"pointer"}} onClick={this.onEditBtnClicked}>{EDIT_ICON}</span>             
                                <span style={{marginRight:"20px", cursor:"pointer"}}>{DELETE_ICON}</span>
                                </div>                                
                                </div>
                                <div id="adapterDetails">
                            <div class="colContainer">
                            <span className="alignHeader">Integration Type</span>
                            <span className="alginValue">{integrationType}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">Integration Name</span>
                            <span className="alginValue">{integrationName}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">Protocol</span>
                            <span className="alginValue">{protocol}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">Host Details</span>
                            <span className="alginValue">{hostDetails}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">Source Directory</span>
                            <span className="alginValue">{sourceDirectory}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">Frequency</span>
                            <span className="alginValue">{frequency}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">Number of retries</span>
                            <span className="alginValue">{numberOfRetries}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">File naming conventions</span>
                            <span className="alginValue">{fileNamingConventions}</span>
                            </div>
                            <div class="colContainer">
                            <span className="alignHeader">Monitor sub directories</span>
                            <span className="alginValue">{monitorSubDirectories}</span>
                            </div>          
                            </div>
                            </div>
                        );

                        adaptersCard.push(    
                            <div className="cardContainer">                        
                            <Card
                            id="card1"
                            key="card1"
                            className="card"
                            css={{height: 130, width: 1124, backgroundColor: "#FFF"}}
                            autoResize={false}
                            selectable={false}
                            singleSelection={false}
                            selectableCardSizeNotChanged={false}
                            onClick={this.onCardClick}
                            //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                            dataTest="cardcollection-card1"
                            > 
                            {renderCardContent}
                            </Card>    
                            </div>                    
                        );
                    })                  

                    })
                    adaptersCardCollection.push(<div className="cardHolder">
                    {adaptersCard}
                </div>)
                })
                this.setState({ adaptersCardCollection: adaptersCardCollection });
            }            
         })
         .catch(error => this.setState({ error }));
    }

    onEditBtnClicked=()=>{
        alert("edit");
    }

    render(){

             return(
            <div>
                {this.state.adaptersCardCollection}
            </div>
        );
    }

}
export default AdapterPreview;