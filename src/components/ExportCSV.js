import React from 'react';
import { Button } from '@nokia-csf-uxr/csfWidgets';
import { CSVLink } from "react-csv";

const headers = [
   
];
var layerNameArr=[];
 
 
var output="";
// formatting variables //

var today = new Date(),

Curtime = today.toString();
var fileName= `SystemReport_${today.getFullYear()+"_"+(today.getMonth() + 1)+"_"+today.getDate()+"_"+today.toTimeString()}.csv`;

var errorCount=[];
var warningCount=[];
var normalCount=[];
var serviceNameArr=[];


var delimiter = ",";
var endl = "\n";
var metaData=  "NOKIA - MDA360\nSystem: CXM\nReport generated on: " + Curtime+ "\nLast refreshed: " + Curtime +endl ;

 
 

 
class ExportCSV extends React.Component {
 

    constructor(props) {
        super(props);
        this.download = this.download.bind(this);
        this.state = {
            exportData: [],
            headers: [],
            filename: 'Report.csv'
        }
    }
    
    download = (event) => {
    
    
      fetch("http://localhost:8080/summary/NCI").then(response => response.json()).then(jsonRes => {
        

        for(let layer in jsonRes.listOfLayers){
           layerNameArr.push(jsonRes.listOfLayers[layer].layerName);
         
          for(let item in jsonRes.listOfLayers[layer].listOfItems){
            //console.log(jsonRes.listOfLayers[layer].listOfItems[item].serviceName);
            let itemtemp = jsonRes.listOfLayers[layer].listOfItems[item];
             
             errorCount.push(itemtemp.error);
            
             warningCount.push(itemtemp.warning);
            
            normalCount.push(itemtemp.normal);
            
             serviceNameArr.push(itemtemp.serviceName);
             
                      }
        }

      // warning norml and error count
      var cntNormal=0;
      var cntWarning=0;
      var cntError=0;

      for(var i =0 ; i <serviceNameArr.length; i++){
          cntNormal = cntNormal+normalCount[i];
          cntWarning=cntWarning+warningCount[i];
          cntError=cntError+errorCount[i];
   }
   
        
        output=metaData+ `Normal :  ${cntNormal} \nWarning : ${cntWarning} \nError : ${cntError}\n\n\n`;
         
        output=  output + "ServiceName , Normal , Warning , Error \n";
                console.log(output);

           for(var i =0 ; i <serviceNameArr.length; i++){
                output= output +   serviceNameArr[i] + delimiter + normalCount[i] + delimiter + warningCount[i] + delimiter + errorCount[i] + endl;
           }

          this.setState({ exportData: output });
          this.csvLink.link.click();

          
      });
   
    }

    render() {
        return(            
            <div>
                <CSVLink
                    data={this.state.exportData}
                    headers={headers}
                    filename={fileName}
                    asynconclick="{true}"
                    ref={(r) => this.csvLink = r}
                    target="_blank" />

            </div>
        );
    }
}

export default ExportCSV;