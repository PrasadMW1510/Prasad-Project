import React from 'react';
import BreadCrumb from '../Breadcrumb';
import { withRouter } from 'react-router-dom';

import AllMenusWrapper from '../Appbanner';
import ETLcomponent from '../ETLComponent';
import TabsComponent from '../TabsComponent';



class ETLdispUI extends React.Component{

    render() {
        return (
            
            <React.Fragment>
              
                                 <AllMenusWrapper/>    
                                 <div style={{marginLeft:"80px"}}>
            <TabsComponent/>
            {/* <BreadCrumb breadCrumbLabel="ETL" boolvalue="true" />

            <ETLcomponent/> */}
            </div>
            </React.Fragment>
        );
    }

}

export default withRouter(ETLdispUI);