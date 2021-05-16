import React, { Component } from 'react';
import{SvgIcon,Button,Dialog,RadioButtonGroup,
    RadioButton,SelectItem,TextInput} from '@nokia-csf-uxr/csfWidgets';
import '../../Styles/Adapter.css';
import AdapterPreview from './AdapterPreview';
import http from '../../components/service';

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




class AdapterPopup extends Component{
constructor(props){
    super(props);

    this.state={
        exportDialog: this.props.isDialogOpen,
        isFileAdapter:false,
        selectedIntegrationType:"",           
        isNonHDFS:false,
        isHDFS:false,
        isFileConsumption:false,
        isSaveClicked:false,
        isData:false,

        integartionName:"",
        hostDetails:"",
        sourceDirectory:"",
        numberOfRetries:"",
        fileNameConventions:""

    };
  
    this.integrationTypeOnChange=this.integrationTypeOnChange.bind(this);
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

onSave =()=>{
    this.setState({
        exportDialog: false,
        isSaveClicked:true            
    });       
    
    let adapterData=[];
    adapterData.push(
    this.state.integartionName,
    this.state.hostDetails,
    this.state.sourceDirectory,
    this.state.numberOfRetries,
    this.state.fileNameConventions
)    
}

onCancel =() =>{
    this.setState({
        exportDialog: false
    })
}

onClear =()=>{
    this.setState({selectedIntegrationType:""})
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
                    focus                    
                    onChange={(e) => {
                    this.setState({ integartionName: e.value }) 
                    }}
                />            
       </span>           
       <span>
        <SelectItem  id="selectItemID" label={"Protocol"} width={350} //menuZIndex={-1}
        dynamicHeight required={true} options={protocol} 
        hasOutline            
        selectedItem={this.state.selectedPValue}           
        //onChange={this.onChange}      
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
                    focus                    
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
                    focus                    
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
        selectedItem={this.state.selectedPValue}           
        //onChange={this.onChange}      
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

onClose = () => {
    this.setState({
        exportDialog: false
    })
}


render(){
    
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
}
export default AdapterPopup;