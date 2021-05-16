import React, { Component } from 'react';
import {BrowserRouter, Route} from 'react-router-dom';

export class Redirect extends Component {
    constructor( props ){
        console.log("this.props :"+props);
      super();
      this.state = { ...props };
    }
   /* componentWillMount(){
        
      window.location = this.state.route.loc;
      
    }*/
    render(){
      return (<Route exact path="/privacy-policy" component={ Redirect }
      loc="https://10.10.167.218:7183/cmf/home" />);
    }
  }
  
  export default Redirect;


