import React, { Component } from 'react';
import{Button,Card,SvgIcon} from '@nokia-csf-uxr/csfWidgets';
import '../../Styles/ApplicationConfig.css';

const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const ERROR_ICON = <SvgIcon key="icon-warning" iconWidth="20" icon="ic_warning" iconColor="rgb(199, 47, 33)" />;



class ApplicationScope extends Component{
    constructor(props){
        super(props);
    }

    render(){

        const renderApplicationScope=(
            <div id="AppSCopeContainer">            
            <div className="AppText">Application Scope </div>                                 
            <div className="nodesContainer" style={{marginTop:"10px"}}>
            <div className="AppRowContainer">
            <span className="alignContent">Services in Scope</span>
            <span className="alignValue">Voice,SMS {"&"}Data</span>
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Network in Scope</span>
            <span className="alignValue">A{"&"}IuCS</span>
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Dimesion Feed</span>
            <span className="alignValue">CRM</span>
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Component List</span>
            <span className="alignValue">Portal</span>  
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Component List</span>
            <span className="alignValue">Portal 1</span>   
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Component List</span>
            <span className="alignValue">Portal 2</span>   
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Component List</span>
            <span className="alignValue">Portal 3</span>   
            </div>
            <div id="editBtn" className="AppRowContainer">
                <Button id="edit" text="EDIT" aria-label="Edit" isCalltoAction />
            </div>          
            </div>
            </div>
        );

        const renderPortalNode=(
            <div className="nodesContainer">
            <div className="AppRowContainer">
            <span className="alignContent">Portal Name</span>
            <span className="alignValue">MDA360</span>   
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Portal URL</span>
            <span className="alignValue">https://MDA360</span>   
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Host Name</span>
            <span className="alignValue">Nokia</span>   
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Private IP</span>
            <span className="alignValue">120.0.0.9</span>   
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Private IP</span>
            <span className="alignValue">120.0.1.8</span>   
            </div>
            <div>{SUCCESS_ICON}</div>
            </div>
        );

        const renderEdgeNode=(
            <div className="nodesContainer">            
            <div className="AppRowContainer">
            <span className="alignContent">Host Name</span>
            <span className="alignValue">Nokia</span>   
            </div>
            <div className="AppRowContainer">
            <span className="alignContent">Private IP</span>
            <span className="alignValue">120.0.0.9</span>   
            </div>   
            <div className="AppRowContainer">
            <span className="alignContent">Public IP</span>
            <span className="alignValue">120.0.0.9</span>   
            </div>   
            <div>{ERROR_ICON}</div>                  
            </div>
        );
       

        return(
            <div>                
                <div style={{marginTop:"-20px"}}>
                    <Card
                    id="card1"
                    key="card1"
                    className="card"
                    css={{height: 110, width: 1010, backgroundColor: "#FFF"}}
                    autoResize={false}
                    selectable={false}
                    singleSelection={false}
                    selectableCardSizeNotChanged={false}
                    onClick={this.onCardClick}
                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                    dataTest="cardcollection-card1"
                    > 
                    {[renderApplicationScope]}
                    </Card>
                </div>
                <div className="portalNodeContainer" style={{marginTop:"20px"}}>
                <div>Portal nodes</div>
                <div id="userCredsContainer">
                <div className="AppRowContainer">
                <span className="alignContent">User name</span>
                <span className="alignValue">NokiaNokiaNokia</span>
                </div>
                <div className="AppRowContainer">
                <span className="alignContent">Password</span>
                <span className="alignValue">Password</span>
                </div>
                </div>

                <div style={{marginTop:"10px"}}>
                    <Card
                    id="card1"
                    key="card1"
                    className="card"
                    css={{height: 60, width: 1010, backgroundColor: "#FFF"}}
                    autoResize={false}
                    selectable={false}
                    singleSelection={false}
                    selectableCardSizeNotChanged={false}
                    onClick={this.onCardClick}
                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                    dataTest="cardcollection-card1"
                    > 
                    {[renderPortalNode]}
                    </Card>
                </div>
                </div>

                <div className="EdgeNodeContainer" style={{marginTop:"20px"}}>
                <div>Edge nodes</div>
                <div id="userCredsContainer">
                <div className="AppRowContainer">
                <span className="alignContent">User name</span>
                <span className="alignValue">NokiaNokiaNokia</span>
                </div>
                <div className="AppRowContainer">
                <span className="alignContent">Password</span>
                <span className="alignValue">Password</span>
                </div>
                </div>

                <div style={{marginTop:"10px"}}>
                    <Card
                    id="card1"
                    key="card1"
                    className="card"
                    css={{height: 60, width: 1010, backgroundColor: "#FFF"}}
                    autoResize={false}
                    selectable={false}
                    singleSelection={false}
                    selectableCardSizeNotChanged={false}
                    onClick={this.onCardClick}
                    //onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
                    dataTest="cardcollection-card1"
                    > 
                    {[renderEdgeNode]}
                    </Card>
                </div>
                </div>

            </div>
        );
    }

}
export default ApplicationScope;