import React, { Component } from 'react';
import{SvgIcon,Button,Dialog,RadioButtonGroup,
    RadioButton,SelectItem,TextInput} from '@nokia-csf-uxr/csfWidgets';
import '../../Styles/Adapter.css';


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
]



class AdapterLanding extends Component{
    constructor(props){
        super(props);
        this.state={
            exportDialog: false,
            isFileAdapter:false,
            selectedIntegrationType:"",
            integartionText:"",
            isNonHDFS:false,
            isFileConsumption:false
        };
        this.integrationTypeOnChange=this.integrationTypeOnChange.bind(this);
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
    }

   
    

    renderFooter=()=>{
        return(
            <div>
            <Button id="clear" text="CLEAR" aria-label="Clear" />
            <Button id="cancel" text="CANCEL" aria-label="Cancel" onClick={this.onCancel}/>
            <Button id="save" text="SAVE" aria-label="Save" disabled isCallToAction />
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
                //selectedItem={this.props.selectedItem}
                name="radiocolorgroup"
                label={"Adapter Type"}
                onChange={this.getSelectedAdapter}
                layout={"horizontal"}
                minWidth={500}
                maxWidth={900}
                width={900} >
                <RadioButton label="File Adapter" value="FileAdapter" />
                <RadioButton label="Webservice Adapter" value="webservice adapter" />
                <RadioButton label="SSH Adapter" value="ssh adapter" />
                <RadioButton label="SNMP Adapter" value="snmp adapter" />
                <RadioButton label="SNTP Adapter" value="sntp adapter" />
                <RadioButton label="Kafka Adapter" value="kafka adapter" />
               </RadioButtonGroup>
            </div>   
            {this.state.isFileAdapter && this.renderIntegrationType()}   
            {(this.state.isNonHDFS || this.state.isFileConsumption) && this.renderNONHDFSContent()}  
             
        </div>
        );
    }

    getSelectedAdapter=(event)=>{
        console.log("selected Adapter"+event.value);
        if(event.value=="FileAdapter"){       
            this.setState({
                isFileAdapter:true
            });
       }
       else{
        this.setState({
            isFileAdapter:false,isNonHDFS:false,isFileConsumption:false,
            selectedIntegrationType:""
        });
       }
    }
    
    textOnchange=(newText)=>{
        console.log("New text:"+newText);
        this.setState({
            integartionText:newText
        })
    }

    integrationTypeOnChange=(e)=>{
        const selectedType=e.value;
        if(selectedType=="File Availability-Non HDFS"){
           this.setState({isNonHDFS:true,isFileConsumption:false});
        }
        else if(selectedType=="File Consumption"){
            this.setState({isFileConsumption:true,isNonHDFS:false});
        }
        else{
            this.setState({isNonHDFS:false,isFileConsumption:false});
        }

        this.setState({selectedIntegrationType:selectedType});
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
            <div id="row2">            
            <TextInput
             text={this.state.integartionText}
                   id="TextInputID"
                   // value={evn.publicIP || ''}
                      label="Integration name"
                      name="IntegrationName"
                      autocomplete="off"
                      placeholder="placeholder"
                      width={360}
                      focus
                    onChange={this.textOnchange}
                    />                     
           
            <SelectItem  id="selectItemID" label={"Protocol"} width={350} //menuZIndex={-1}
            dynamicHeight required={true} options={protocol} 
            hasOutline            
            //selectedItem={this.state.selectedValue}           
            //onChange={this.onChange}      
            />            
            </div>

            <div id="row3">            
            <TextInput //text={"this.state.text"}
            id="TextInputID" placeholder="Enter" label="Host Details" width={350}
           // onChange={this.onChange}
           />        
          
            <TextInput //text={"this.state.text"}
            id="TextInputID" placeholder="Enter" label="Source Directory" width={350}
           // onChange={this.onChange}
           />        
            </div>

            <div id="row4">            
            <SelectItem  id="selectItemID" label="Frequency" width={350} //menuZIndex={-1}
            dynamicHeight required={true} options={frequency} 
            hasOutline            
            //selectedItem={this.state.selectedValue}           
            //onChange={this.onChange}      
            />        
          
            <TextInput //text={"this.state.text"}
            id="TextInputID" placeholder="Enter" label="Number of retries" width={350}
           // onChange={this.onChange}
           />        
            </div>

            <div id="row5"> 
            <TextInput //text={"this.state.text"}
            id="TextInputID" placeholder="Enter" label="File naming conversions" width={350}
           // onChange={this.onChange}
           />   
            </div>
            {(this.state.isNonHDFS && !this.state.isFileConsumption) && this.renderMonitorDirectories()}  
            </div>
        );            
    }

    renderMonitorDirectories(){
        return(
        <div id="row6">
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
        this.setState({exportDialog:true})
    }

    render(){
        return(
            <div style={{position:"relative",top:"140px",left:"380px",width:"700px"}}>
                <div className="domainIcon" style={{width:"150px",marginLeft:"75px"}}>{DOMAIN_ICON}</div>
                <div style={{width:"424px",fontSize:"32px",lineHeight:"2.8",fontFamily:"Nokia Pure Headline Light"}}>No adapter is available.</div>
                <div style={{fontSize:"19px", position:"relative",right:"34px",fontFamily:"Nokia Pure Headline Light"}}>Please click on below button to add new adapter</div>
                <div style={{marginLeft:"114px",marginTop:"30px"}}>
                <Button id="addNew" text="Add New" aria-label="Add New" isCallToAction onClick={this.getAdapterPopup} />
                </div>
                {this.state.exportDialog&&this.renderAdapterPopup()}
            </div>

        );
    }

}
export default AdapterLanding;

