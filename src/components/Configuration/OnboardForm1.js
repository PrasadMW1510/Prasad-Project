import React, { useState } from 'react';
import '../../Styles/Onboard.css';
import ReactDOM from 'react-dom';
import PropTypes from "prop-types";
import { text } from '@storybook/addon-knobs';
 import _ from 'react-props-noop';
 import { RadioButton, RadioButtonGroup, FormLayout,Dialog, FileUploader,VerticalStepWizard, SvgIcon, TextInput, Card, Button } from '@nokia-csf-uxr/csfWidgets';


const defaultUserModel = {
    selectedItemText: '',
    // uploadTemplate: '',
    form1Complete: false
  };
  
  let savedUserModel = defaultUserModel;
  let editUserModel = defaultUserModel;
  
  let formErrors = {};




class OnboardForm1 extends React.Component {
    static propTypes = {
      onValidate: PropTypes.func,
      onBack: PropTypes.func,
      handler: PropTypes.func,
      selectedItem: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      layout: PropTypes.string.isRequired,
      minWidth: PropTypes.number.isRequired,
      maxWidth: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired
    };
  
    
    
    static defaultProps = {
      onValidate: _.noop,
      onBack: _.noop,
      handler: _.noop
    };
  
    state = {
        applicationType: editUserModel.appType,
        defaultApplicationType:'',
        selectedAppTypeFlag:false
    };
  
    componentDidMount() {
      if (this.props.onValidate) {
        this.props.onValidate(this.validate);
      }
  
      if (this.props.onBack) {
        this.props.onBack(this.back);
      }
    }
  
    UNSAFE_componentWillReceiveProps(nextProps) {
      if (nextProps.onValidate) {
        nextProps.onValidate(this.validate);
      }
    }
  
    back = () => {
      // Back button was pressed
    };
  
    validate = () => {
      const validation = {
        errors: [],
        warnings: []
      };
  
      editUserModel.appType = (this.state.applicationType) ? this.state.applicationType.trim() : '';
      formErrors.appTypeError = '';
  
      if (!editUserModel.appType) {
        formErrors.appTypeError = 'application Type is required';
        validation.errors.push(formErrors.appTypeError);
      }
  
      this.forceUpdate();
  
      return validation;
    };
  
    render() {
      const {appTypeError } = formErrors;
  let a;
      return (
        <FormLayout>
                          <RadioButtonGroup
                                    id="csfkOrNoncsfk"
                                    disabled={false}
                                    selectedItem={this.state.applicationType}
                                    name="radiocolorgroup"
                                    label={'Select application type'}
                                    style={{ marginLeft: "-5px" }}
                                    onChange={(data) => {
                                        this.setState({ applicationType: data.value });
                                        // editUserModel.form1Complete = data.value.length >0;
                                       // this.props.handler(data.value);
                                        console.log("appType",data.value)
                                      }}
                                    layout='vertical'
                                    minWidth={this.props.minWidth}
                                    maxWidth={this.props.maxWidth}
                                    width={this.props.width}
                                >
                                    <RadioButton 
                                        label="CSFP"
                                        name="CSFP"
                                        value="CSFP"
                                        id="CSFP"
                                    />
                                   
                                    <RadioButton
                                        label="Non-CSFP"
                                        name="Non-CSFP"
                                        value="Non-CSFP"
                                        id="Non-CSFP"
                                    />
                                </RadioButtonGroup>
        </FormLayout>
      );
    }
  }
export default OnboardForm1;