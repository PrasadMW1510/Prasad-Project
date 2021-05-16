import React from 'react';
import { withRouter } from 'react-router-dom';
import AllMenusWrapper from '../Appbanner';
import IframeComponent from '../IframeComponent';




class IframeUI extends React.Component{

    render() {
        return (
            
            <React.Fragment>
              
                                 <AllMenusWrapper/>    
                                 <div style={{margin:"250px", marginLeft:"500px"}}>
          {/* <IframeComponent/> */}
          Page is under development
            </div>
            </React.Fragment>
        );
    }

}

export default withRouter(IframeUI);