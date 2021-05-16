import React from 'react';
import { Button } from '@nokia-csf-uxr/csfWidgets';

 
import * as XLSX from 'xlsx';


   
 
const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
var fileExtension = '.xlsx';
var fileName="myFIle";
  
 var output=[];
 var output1=[];
 var today = new Date(),

Curtime = today.toString();
var fileName= `SystemReport_${today.getFullYear()+"_"+(today.getMonth() + 1)+"_"+today.getDate()+"_"+today.toTimeString()}.xlsx`;
//formating variables
            var errorCount=[];
            var warningCount=[];
            var normalCount=[];
            var serviceNameArr=[];

 
class ExportEXCEL extends React.Component {
 
      myfun= ( ) => {
        console.log("inside myFun func chk1");

            fetch("http://localhost:8080/summary/NCI").then(response => response.json()).then(jsonRes => {
            console.log("inside myFun func chk2");
            // NOKIA - MDA360
            // System: NCI
            // Report generated on: Thu Jan 07 2021 10:34:53 GMT+0530 (India Standard Time)
            // Last refreshed: Thu Jan 07 2021 10:34:53 GMT+0530 (India Standard Time)
            // Normal :  350 
            // Warning : 60 
            // Error : 180
            

         

            

        for(let layer in jsonRes.listOfLayers){
          // layerNameArr.push(jsonRes.listOfLayers[layer].layerName);
         
          for(let item in jsonRes.listOfLayers[layer].listOfItems){
            //console.log(jsonRes.listOfLayers[layer].listOfItems[item].serviceName);
            let itemtemp = jsonRes.listOfLayers[layer].listOfItems[item];
             output.push(itemtemp);
             errorCount.push(itemtemp.error);
            
             warningCount.push(itemtemp.warning);
            
            normalCount.push(itemtemp.normal);
            
             serviceNameArr.push(itemtemp.serviceName);
             
             
                      }
        }
        ////
        var cntNormal=0;
        var cntWarning=0;
        var cntError=0;
  
        for(var i =0 ; i <serviceNameArr.length; i++){
            cntNormal = cntNormal+normalCount[i];
            cntWarning=cntWarning+warningCount[i];
            cntError=cntError+errorCount[i];
     }
        ///
      
        output1.push({"NOKIA - MDA360":"System: NCI"}, {"NOKIA - MDA360":`Report generated on: ${Curtime}`},
        {"NOKIA - MDA360":`Last refreshed:  ${Curtime}`} ,
        {"NOKIA - MDA360":`Normal : ${cntNormal}`},{"NOKIA - MDA360":`Warning : ${cntWarning} `}  ,{"NOKIA - MDA360":`Error : ${cntError}`}       
        ); 
        
        
        

        var ws = XLSX.utils.json_to_sheet(output1);
        // XLSX.utils.sheet_add_json(output);
         XLSX.utils.sheet_add_json(ws, output, {header:["serviceName","normal","warning","error"], origin: "A10"});

        
        
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };

         
          XLSX.writeFile(wb,(fileName));

        // const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // const data = new Blob([excelBuffer], {type: fileType});

        // FileSaver.saveAs(data, fileName + fileExtension);
        
     
      });

              

    }
    
         
    render() {
        return <div>
                                     
            <div>
                <Button id="ExportExcelFile" text="Export to Excel" onClick={()=>this.myfun() }>
                    Myfun
                    </Button>
                    </div>
             
        </div>
    }
}

export default ExportEXCEL;