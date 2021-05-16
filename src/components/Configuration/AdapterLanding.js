import React, { Component } from 'react';
import{SvgIcon,Button,Dialog,RadioButtonGroup,
    RadioButton,SelectItem,TextInput,Card} from '@nokia-csf-uxr/csfWidgets';
import '../../Styles/Adapter.css';
import AdapterPreview from './AdapterPreview';
import http from '../../components/service';
import * as dateTime from '../../components/DateAndTime';

const currentDate = dateTime.getCurrentDate();
const currentTime = dateTime.getCurrentTime();
const startDateTime="00:00:00";    


const EDIT_ICON = <SvgIcon key="icon-edit" iconWidth="20" icon="ic_edit" iconColor="rgb(18, 65, 145)" />;
const DELETE_ICON = <SvgIcon key="icon-delete" iconWidth="20" icon="ic_delete" iconColor="rgb(217, 7, 10)" />;


const DOMAIN_ICON = <SvgIcon key="icon-success" iconWidth="150" icon="ic_domain" iconColor="rgb(117, 117, 117)" />;
const integrationTypeOptions=[
    {
        "label":"File Availability-HDFS",
        "value":"File Availability-HDFS"
    },
    {
        "label":"File Availability-Non HDFS",
        "value":"File Availability-Non HDFS"
    },
    {
        "label":"File Consumption",
        "value":"File Consumption"
    },
    {
        "label":"File Export",
        "value":"File Export"
    }

];

const protocol=[
    {
        "label":"Protocol one",
        "value":"Protocol one"
    },
    {
        "label":"Protocol two",
        "value":"Protocol two"
    },
    {
        "label":"Protocol three",
        "value":"Protocol three"
    }
];

const frequency=[
    {
        "label":"Frequency one",
        "value":"Frequency one"
    },
    {
        "label":"Frequency two",
        "value":"Frequency two"
    },
    {
        "label":"Frequency three",
        "value":"Frequency three"
    }
];


class AdapterLanding extends Component{
    constructor(props){
        super(props);
        this.state={
            exportDialog: false,
            isFileAdapter:false,
            selectedIntegrationType:"",
            selectedProtocol:"",  
            selectedFrequency:"",       
            isNonHDFS:false,
            isHDFS:false,
            isFileConsumption:false,
            isSaveClicked:false,
            isData:false,

            integartionName:"",
            hostDetails:"",
            sourceDirectory:"",
            numberOfRetries:"",
            fileNameConventions:"",

            adaptersCardCollection:[],
            isEditBtnCliked:false

        };
        this.integrationTypeOnChange=this.integrationTypeOnChange.bind(this);
        this.onProtocolChange=this.onProtocolChange.bind(this);
        
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
            if (response && response.data.length===0) {   
                this.setState({isData:false});
            }
            else{
                this.setState({isData:true});
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
                                <span style={{marginRight:"20px",cursor:"pointer"}} onClick={this.onEditAdapter}>{EDIT_ICON}</span>             
                                <span style={{marginRight:"20px",cursor:"pointer"}}>{DELETE_ICON}</span>
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

    onEditAdapter=()=>{
        alert("Edit");
        // this.setState({
        //     isEditBtnCliked:true,        
        //     exportDialog: false,
        //     isFileAdapter:false,
        //     //selectedIntegrationType:"",           
        //     isNonHDFS:false,
        //     isHDFS:false,
        //     isFileConsumption:false,
        //     isSaveClicked:false,
        //     isData:false
        // });

        this.setState({
        exportDialog: true,
        isFileAdapter:false,
        selectedIntegrationType:"",
        selectedProtocol:"",  
        selectedFrequency:"",       
        isNonHDFS:false,
        isHDFS:false,
        isFileConsumption:false,
        isSaveClicked:false,
        isData:false,

        integartionName:"",
        hostDetails:"",
        sourceDirectory:"",
        numberOfRetries:"",
        fileNameConventions:"",

        adaptersCardCollection:[],
        isEditBtnCliked:true
    })

    }

    renderAdapterPopup(){
        return(
            <Dialog id="adapterPopup" title="New Adapter" height={1300} width={900}
                header={true} trapFocus={false}
                underlayClickExits={true} 
                close="true"              
                onClose={this.onClose} 
                renderFooter={this.renderFooter}
                >    
                {this.renderAdapterContent()}          
            </Dialog>
        );
    }
    onClose = () => {
        this.setState({
            exportDialog: false
        })
    }

    onCancel =() =>{
        this.setState({
            exportDialog: false
        })

        if(this.state.isEditBtnCliked){
        this.getAdapterDetails();
        }
    }

    onClear =()=>{
        this.setState({selectedIntegrationType:"",
        selectedProtocol:"",
        selectedFrequency:"",
        integartionName:"",
        hostDetails:"",
        sourceDirectory:"",
        numberOfRetries:"",
        fileNameConventions:""});
    }
    
    onSave =()=>{
        this.setState({
            exportDialog: false,
            isSaveClicked:true,
            isData:false           
        });       
        
        let adapterData=[];
        adapterData.push(
        this.state.integartionName,
        this.state.hostDetails,
        this.state.sourceDirectory,
        this.state.numberOfRetries,
        this.state.fileNameConventions
        );
        
        if(this.state.isEditBtnCliked){
        this.getAdapterDetails();
        }
    }
        


    renderAdapterPreview(){
        
        return(
            <div>
                {this.state.adaptersCardCollection}
            </div>
        );
    }

    renderFooter=()=>{
        return(
            <div>
            <Button id="clear" text="CLEAR" aria-label="Clear" onClick={this.onClear} />
            <Button id="cancel" text="CANCEL" aria-label="Cancel" onClick={this.onCancel}/>
            <Button id="save" text="SAVE" aria-label="Save" enabled isCallToAction onClick={this.onSave} />
        </div>
        )
    }

    renderAdapterContent=()=>{       
        return(
        <div>            
            <div id="adapterType">
            <RadioButtonGroup 
               id="radio-container-id"
                disabled={false}
                selectedItem={this.state.selectedIntegrationType}
                name="radiocolorgroup"
                label={"Adapter Type"}                
                onChange={(data)=>{
                this.setState({selectedIntegrationType:data.value},()=>{
                this.getSelectedAdapter();
                });                    
                }}                     
                
                layout={"horizontal"}
                minWidth={500}
                maxWidth={900}
                width={900}>
                <RadioButton label="File Adapter" value="FileAdapter" />
                <RadioButton label="Webservice Adapter" value="webservice adapter" />
                <RadioButton label="SSH Adapter" value="ssh adapter" />
                <RadioButton label="SNMP Adapter" value="snmp adapter" />
                <RadioButton label="SNTP Adapter" value="sntp adapter" />
                <RadioButton label="Kafka Adapter" value="kafka adapter" />
               </RadioButtonGroup>
            </div>   
            {this.state.isFileAdapter && this.renderIntegrationType()}   
            {(this.state.isNonHDFS ||this.state.isHDFS|| this.state.isFileConsumption) && this.renderNONHDFSContent()}  
             
        </div>
        );
    }

    getSelectedAdapter(){        
        if(this.state.selectedIntegrationType=="FileAdapter"){       
            this.setState({
                isFileAdapter:true
            });
       }
       else{
        this.setState({
            isFileAdapter:false,isNonHDFS:false,isHDFS:false,isFileConsumption:false
            //selectedIntegrationType:""
        });
       }
    }
    
    // textOnchange=(newText)=>{
    //     console.log("New text:"+newText);
    //     this.setState({
    //         integartionText:newText.value
    //     })
        
    // }

    textOnchange = newText => this.setState({ text: newText.value });

    integrationTypeOnChange=(e)=>{
        const selectedType=e.value;
        if(selectedType=="File Availability-Non HDFS"){
           this.setState({isNonHDFS:true,isHDFS:false,isFileConsumption:false});
        }
        else if(selectedType=="File Availability-HDFS"){
            this.setState({isHDFS:true,isNonHDFS:false,isFileConsumption:false});
        }
        else if(selectedType=="File Consumption"){
            this.setState({isFileConsumption:true,isNonHDFS:false,isHDFS:false});
        }
        else{
            this.setState({isNonHDFS:false,isHDFS:false,isFileConsumption:false});
        }

        this.setState({selectedIntegrationType:selectedType});
    }

    onProtocolChange =(e)=>{
        
        this.setState({selectedProtocol:e.value})
    }

    renderIntegrationType(){
        return(            
            <div id="integrationType" style={{marginTop:"15px"}}>
            <SelectItem  label={"Integration Type"} width={350}
            id="selectItem" dynamicHeight required={true}
            options={integrationTypeOptions}
            noResultsText="No matching terms"
            hasOutline            
            selectedItem={this.state.selectedIntegrationType}           
            onChange={this.integrationTypeOnChange}      
            />
            </div>      
            
        );
    }

    renderNONHDFSContent(){
        return(
            <div id="fileAdapterContent">
            <div id="row2" className="rowAlignment"> 
            <span className="rightAlignment">            
            <TextInput
                        text={this.state.integartionName}
                        id="TextInputID"
                        placeholder="Enter"
                        label="Integration name"
                        width={365}                                            
                        onChange={(e) => {
                        this.setState({ integartionName: e.value }) 
                        }}
                    />            
           </span>           
           <span>
            <SelectItem  id="selectItemID" label={"Protocol"} width={350} //menuZIndex={-1}
            dynamicHeight required={true} options={protocol} 
            hasOutline            
            selectedItem={this.state.selectedProtocol}           
            onChange={(e)=>{
                this.setState({selectedProtocol:e.value})
            }}     
            />     
            </span>       
            </div>

            <div id="row3" className="rowAlignment">   
            <span className="rightAlignment">             
           <TextInput
                        text={this.state.hostDetails}
                        id="TextInputID"
                        placeholder="Enter"
                        label="Host Details"
                        width={365}                                            
                        onChange={(e) => {
                        this.setState({ hostDetails: e.value }) 
                        }}
                    />                   
           </span> 
            <span>         
              
            <TextInput
                        text={this.state.sourceDirectory}
                        id="TextInputID"
                        placeholder="Enter"
                        label="Source Directory"
                        width={365}                                            
                        onChange={(e) => {
                        this.setState({ sourceDirectory: e.value }) 
                        }}
                    />                         
           </span>
            </div>

            <div id="row4" className="rowAlignment"> 
            <span className="rightAlignment">
            <SelectItem  id="selectItemID" label={"Frequency"} width={350} //menuZIndex={-1}
            dynamicHeight required={true} options={frequency} 
            hasOutline            
            selectedItem={this.state.selectedFrequency}           
            onChange={(e) => {
                this.setState({ selectedFrequency: e.value }) 
                }}

            />     
            </span>       

            <span style={{marginLeft:"15px"}}>
            <TextInput
             text={this.state.numberOfRetries}
                   id="TextInputID"                  
                      label="Number of retries"
                      name="NumberOfRetries"
                      autocomplete="off"
                      placeholder="Enter"
                      width={365}                      
                      onChange={(e) => {
                        this.setState({ numberOfRetries: e.value }) 
                        }}
                    />                     
           </span>                    
            </div>          
            
            <div id="row5" className="rowAlignment">             
            <TextInput 
            text={this.state.fileNameConventions}
            id="TextInputID" placeholder="Enter"
             label="File naming conversions" 
             width={365} 
             onChange={(e) => {
                this.setState({ fileNameConventions: e.value }) 
                }}
           />   
            </div>
            {(this.state.isNonHDFS||this.state.isHDFS) && (!this.state.isFileConsumption) && this.renderMonitorDirectories()}  
            </div>
        );            
    }

    renderMonitorDirectories(){
        return(
        <div id="row6" className="rowAlignment">
            <RadioButtonGroup 
               id="radio-container-id"
                disabled={false}
                //selectedItem={this.props.selectedItem}
                name="radiocolorgroup"
                label={"Monitor sub directories"}
               // onChange={e => console.log(e, 'onChange')}
                layout={"horizontal"}
                minWidth={500}
                maxWidth={900}
                width={900} >
                <RadioButton label="Yes" value="yes" />
                <RadioButton label="No" value="no" />                
               </RadioButtonGroup>
            </div>
        );

    }

    
    getAdapterPopup=()=>{        
        this.setState({exportDialog:true});
        this.setState({
            selectedIntegrationType:"",
            selectedProtocol:"",
            selectedFrequency:"",
            integartionName:"",
            hostDetails:"",
            sourceDirectory:"",
            numberOfRetries:"",
            fileNameConventions:""
        });
    }

    renderNoAdapter(){
        return(
            <div style={{position:"relative",top:"140px",left:"380px",width:"700px"}}>
                <div className="domainIcon" style={{width:"150px",marginLeft:"75px"}}>{DOMAIN_ICON}</div>
                <div style={{width:"424px",fontSize:"32px",lineHeight:"2.8",fontFamily:"Nokia Pure Headline Light"}}>No adapter is available.</div>
                <div style={{fontSize:"19px", position:"relative",right:"34px",fontFamily:"Nokia Pure Headline Light"}}>Please click on below button to add new adapter</div>
                <div style={{marginLeft:"114px",marginTop:"30px"}}>
                <Button id="addNew" text="Add New" aria-label="Add New" isCallToAction onClick={this.getAdapterPopup} />
                </div>                
            </div>
        );
    }

    render(){        
        return(
            <div>
            {this.state.isData && !this.state.isEditBtnCliked && this.renderNoAdapter()}
            {this.state.exportDialog && this.renderAdapterPopup()}
            {!this.state.isData && this.renderAdapterPreview()}
            {this.state.isEditBtnCliked && this.state.exportDialog && this.renderAdapterPopup()}            
            </div>
        );
    }

}
export default AdapterLanding;

