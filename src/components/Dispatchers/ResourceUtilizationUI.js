import React from 'react';
import { withRouter } from 'react-router-dom';
import AllMenusWrapper from '../Appbanner';
import ResourceUtilizationTabs from '../ResourceUtilization/ResourceUtilizationTabs';



class OnboardUI extends React.Component{

    render() {
        return (
            
            <React.Fragment>
              
            <AllMenusWrapper/>    
            <div style={{marginLeft:"80px"}}>
            <ResourceUtilizationTabs/>
            </div>
            </React.Fragment>
        );
    }

}

export default withRouter(OnboardUI);