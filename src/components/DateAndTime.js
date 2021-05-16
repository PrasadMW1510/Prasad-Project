export const getCurrentDate = () => {
  let currentdate = new Date();    
 
  let date =  ( currentdate.getFullYear()) + "/"
  + ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "/" 
  + ("0" + currentdate.getDate()).slice(-2); 

  return date;
}

export const getETLCurrentDate = () => {
  let currentdate = new Date();    
 
  let date =  ( currentdate.getFullYear()) + "-"
  + ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-" 
  + ("0" + currentdate.getDate()).slice(-2); 

  return date;
}

export const getCurrentTime = () => {
  let currentdate = new Date(); 

  let time =  ("0" + currentdate.getHours()).slice(-2) + ":"  
  + ("0" + currentdate.getMinutes()).slice(-2) + ":" 
  + ("0" + currentdate.getSeconds()).slice(-2);      

  return time;
}
export const getPortalCurrentTime = () => {
  let currentdate = new Date(); 

  let time =  ("0" + currentdate.getHours()).slice(-2) + ":"  
  + ("0" + currentdate.getMinutes()).slice(-2);
   

  return time;
}

export const getExportCurrentDate = () => {
  let currentdate = new Date();  
  
  let date =  ("0"+currentdate.getDate()).slice(-2) + "-"
              + ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-" 
              + currentdate.getFullYear();

    return date;
}

export const getExportCurrentTime = () => {
  let currentdate = new Date(); 

  let time =  ("0" + currentdate.getHours()).slice(-2) + "-"  
  + ("0" + currentdate.getMinutes()).slice(-2) + "-" 
  + ("0" + currentdate.getSeconds()).slice(-2);      

  return time;
}

export const getLastSevenDays = () =>{  

  let currentdate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  let date =  ("0" + currentdate.getDate()).slice(-2) + "-"
  + ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-" 
  + currentdate.getFullYear() + "  "  

  return date;
 }



export const getYesterDay = () =>{
  let currentdate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);   

  let date =  ("0" + currentdate.getDate()).slice(-2) + "-"
  + ("0" + (currentdate.getMonth() + 1)).slice(-2)  + "-" 
  + currentdate.getFullYear() + "  "  

  return date;
}


