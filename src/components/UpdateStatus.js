import react,{Component} from 'react';
import {SvgIcon} from '@nokia-csf-uxr/csfWidgets';

const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="20" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const WARNING_ICON = <SvgIcon key="icon-warning" iconWidth="20" icon="ic_warning" iconColor="rgb(232, 157, 0)" />;
const ERROR_ICON = <SvgIcon key="icon-error" iconWidth="20" icon="ic_exclude" iconColor="rgb(199, 47, 33)" />;


class UpdateOverAllStatus extends Component{
constructor(props){
super(props);
this.state={

};
}

render(){
    return(
        <div>
            <div className={(this.props.Normal)?'Normal':''} id="Normal" style={{float:"left"}} onClick={this.props.StatusClick}>
            <span style={{marginRight:"4px"}}>{SUCCESS_ICON}</span>
            <span id="normalLabel" className={(this.props.Normal)?'textColor':''}>SUCCESS({this.props.normal})</span>
          </div>          
           
          <div className={this.props.Warning?'Warning':''} id="Warning" style={{display:"inline-flex"}} onClick={this.props.StatusClick}>
          <span style={{marginRight:"4px"}}> {WARNING_ICON}</span>
            <span id="warningLabel" className={this.props.Warning?'textColor':''}>WARNING({this.props.warning})</span>
          </div>         

          <div className={this.props.Error?'Error':''} id="Error" style={{float:"right"}} onClick={this.props.StatusClick}>
          <span style={{marginRight:"4px"}}> {ERROR_ICON}</span>
            <span id="errorLabel" className={this.props.Error?'textColor':''}>ERROR({this.props.error})</span>
          </div>
          
        </div>
    );
}

}

export default UpdateOverAllStatus;