import React, {Component} from 'react';
import { AppBanner } from '@nokia-csf-uxr/csfWidgets';
import {BrowserRouter, Route, Link, NavLink, Switch} from 'react-router-dom';
import AllMenusWrapper from './Appbanner';

class Overview extends Component{
    render(){
        return(
            <AllMenusWrapper />             
        );
    }
}

export default Overview;