import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AppToolbar, Button } from '@nokia-csf-uxr/csfWidgets';
import Landingscreen from './LandingScreenContent';
import history from './History';
import overview from './Overview';
import { withRouter } from 'react-router-dom';
import Constants from '../assets/Constants.json'

class AppToolbarBreadcrumbsContainer extends Component {
  constructor(props) {
    super(props);
    const homeBcItem = {
      id: 'integratedView',
      title: 'Integrated View',
      onClick: () => {
        this.goTo(0);
      },
    };
    this.state = {
      bcItems: [homeBcItem]
    };
  }
  componentDidMount() {
    this.pushBCItem();
  }
  componentWillUpdate() {
    return (
      <div>
        <Landingscreen cards={this.state.systemSelectedValue} />
      </div>
    );
  }

  goTo = (index) => {
    this.setState({
      bcItems: this.state.bcItems.slice(0, index + 1),
    });
     this.props.history.push(Constants.Routerpath.Dashboard);
  }

  pushBCItem = () => {
    const itemsLength = this.state.bcItems.length;
    this.setState({
      bcItems: [...this.state.bcItems, ...[{
        id: this.props.breadCrumbLabel,
        title: this.props.breadCrumbLabel,
        onClick: () => {
          this.goTo(itemsLength);
        }
      }]]
    });
  };



  render() {
    const {
      bcItems
    } = this.state;

    const breadcrumbs = {
      items: bcItems
    }
    return (
      <div>
        <AppToolbar
          id={this.props.breadCrumbLabel}
          breadcrumbs={breadcrumbs}
        />

      </div>
    );
  }
}
export default withRouter(AppToolbarBreadcrumbsContainer);