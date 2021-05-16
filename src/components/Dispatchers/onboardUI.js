import React from 'react';
import { withRouter } from 'react-router-dom';
import AllMenusWrapper from '../Appbanner';
import ConfigurationTabs from '../Configuration/ConfigurationTabs';



class OnboardUI extends React.Component{

    render() {
        return (
            
            <React.Fragment>
              
                                 <AllMenusWrapper/>    
                                 <div style={{marginLeft:"80px"}}>
            <ConfigurationTabs/>
            </div>
            </React.Fragment>
        );
    }

}

export default withRouter(OnboardUI);