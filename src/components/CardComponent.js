import React, { Component } from 'react';
import {Card,SvgIcon} from '@nokia-csf-uxr/csfWidgets';

const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const PORTAL_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_virtual_machine" iconColor="rgb(82, 102, 117)" />;
const ERROR_ICON = <SvgIcon key="icon-error" iconWidth="30" icon="ic_error_alert" iconColor="rgb(199, 47, 33)" />;

class RenderCards extends Component{

    constructor(){
        super()
    }

    
    render(){        
     
        return(
                                       
           <Card
              id="card1"
              key="card1"
              className="card"
              css={{height: 70, width: 1260, backgroundColor: "#FFF"}}
              autoResize={false}
              selectable={false}
              singleSelection={false}
              selectableCardSizeNotChanged={false}
              onClick={this.onCardClick}
              onCardChangeState={e => console.log(e, 'onCardChangeState card10')}
              dataTest="cardcollection-card1"
            >     
        
          </Card>

          
       ); 
    }

}


export default RenderCards;
