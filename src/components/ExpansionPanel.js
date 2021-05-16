
/* eslint-disable react/no-multi-comp */
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Card, SvgIcon, CardCollection, Button, CheckBox, TextInput, ToggleButton } from '@nokia-csf-uxr/csfWidgets';
import axios from "axios";
import ExpandedLayerHeader from './ExpandedLayerHeader';
import {
  ExpansionPanel,
  Label,
  SelectItem,
  Chips,
  AppBanner,
  AppToolbar,
  DataGrid,
} from '@nokia-csf-uxr/csfWidgets';

import '../Styles/Expansion.css';

import ETLInput from './ETLInputDirectoryStatistics';

const SUCCESS_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_completed_successful" iconColor="rgb(116, 170, 50)" />;
const EXPORT_ICON = <SvgIcon key="icon-success" iconWidth="30" icon="ic_import_file" iconColor="rgb(18, 65, 145)" />;
const ERROR_ICON = <SvgIcon key="icon-error" iconWidth="30" icon="ic_error_alert" iconColor="rgb(199, 47, 33)" />;

const layout = [
  {
    x: 0, y: 0, w: 4, h: 0, i: '0'
  }
];

const layout2 = [
  {
    x: 0, y: 0, w: 2, h: 0, i: '0'
  },
  {
    x: 2, y: 0, w: 2, h: 0, i: '1'
  }
];
const layout3 = [
  {
    x: 0, y: 0, w: 1, h: 1, i: '0'
  },
  {
    x: 1, y: 0, w: 1, h: 1, i: '1'
  },
  {
    x: 3, y: 0, w: 1, h: 1, i: '3'
  }
];
const layout4 = [
  {
    x: 0, y: 1, w: 1, h: 1, i: '0'
  },
  {
    x: 1, y: 1, w: 1, h: 1, i: '1'
  },
  {
    x: 2, y: 1, w: 1, h: 1, i: '2'
  },
  {
    x: 3, y: 1, w: 1, h: 1, i: '3'
  }
];
const layout6 = [
  {
    x: 0, y: 1, w: 1, h: 1, i: '0'
  },
  {
    x: 1, y: 1, w: 1, h: 1, i: '1'
  },
  {
    x: 2, y: 1, w: 1, h: 1, i: '2'
  },
  {
    x: 3, y: 1, w: 1, h: 1, i: '3'
  },
  {
    x: 4, y: 1, w: 1, h: 1, i: '4'
  }
];

const layout5 = [
  [
    {
      x: 0, y: 1, w: 1, h: 1, i: '0'
    }
  ],
  [
    {
      x: 0, y: 1, w: 1, h: 1, i: '0'
    },
    {
      x: 1, y: 1, w: 1, h: 1, i: '1'
    }
  ], [
    {
      x: 0, y: 1, w: 1, h: 1, i: '0'
    },
    {
      x: 1, y: 1, w: 1, h: 1, i: '1'
    },
    {
      x: 2, y: 1, w: 1, h: 1, i: '2'
    }
  ]
];





class BasicItem extends PureComponent {
  static propTypes = {
    isOpen: PropTypes.bool,
    title: PropTypes.string.isRequired,
    all: PropTypes.bool,
    togglePanel: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
    all: false,
    togglePanel: () => 0,
  };

  render() {
    const { isOpen, all, togglePanel } = this.props;
    if (isOpen) {
      return (
        <div className="csfWidgets expansion-panel-basic-item">
          <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="true">
            <ExpandedLayerHeader class={"showElement"} />
          </div>
          <div>
            <ETLInput />
          </div>
        </div>
      );
    }

    return (
      <div className="csfWidgets expansion-panel-basic-item">
        <div role="button" className="toggle-bar" onClick={togglePanel} tabIndex="0" onKeyDown={togglePanel} aria-expanded="false">
          <ExpandedLayerHeader class={"hideElement"} />
          <span className="chevron-indicator">
            <SvgIcon icon="ic_chevron_left" iconHeight="24px" iconWidth="24px" />
          </span>
        </div>
      </div>
    );
  }
}

const appBannerProps = {
  productFamily: 'Product',
  userAccountSummaryUsername: 'User Profile',
  userAccountSummaryLogoutButtonText: ' Sign Out',
  userAccountSummaryOnLogoutButtonClick() {
    console.log('Sign Out button clicked');
  },
};

class ExpansionPanelDemo extends Component {
  constructor(props) {
    super(props);
    this.state = { childPanels: [] };
    this.panelCount = 7;
  }

  iconButtonClick = () => {
    // add another BasicItem Panel
    this.setState({ childPanels: this.state.childPanels.concat('Basic Item') });
  }

  toggle = id => (event) => {
    if (event.type === 'click' || event.key === ' ' || event.key === 'Enter') {
      event.preventDefault(); // stop scroll down with space bar
      const panel = `${id}Expanded`;
      this.setState({ [panel]: !this.state[panel] });
    }
  }

  render() {
    const { childPanels } = this.state;
    return (
      <ExpansionPanel
        height={-1} /* automatically determine collapsed panel height */
        hideDefaultControl
        areBordersVisible={false}
        isShadowVisible={false}
      >

        <BasicItem all togglePanel={this.toggle('panel1')} isOpen={this.state.panel1Expanded} />

      </ExpansionPanel>

    );
  }
}

export default ExpansionPanelDemo;