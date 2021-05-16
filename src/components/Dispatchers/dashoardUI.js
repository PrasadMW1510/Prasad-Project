import React from 'react';

import { withRouter } from 'react-router-dom';

import AllMenusWrapper from '../Appbanner';
import TabsComponent from '../TabsComponent';



class DashboardUI extends React.Component{

    render() {
        return (
            
            <React.Fragment>
              
                                 <AllMenusWrapper />    
                                 <div style={{marginLeft:"80px"}}>
            <TabsComponent/>
            </div>
            </React.Fragment>
        );
    }

}

export default withRouter(DashboardUI);