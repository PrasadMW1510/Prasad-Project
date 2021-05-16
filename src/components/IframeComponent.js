import React from 'react';
import Iframe from 'react-iframe';
export default class IframeComponent extends React.Component {
  render() {
    return (
      <div>

<Iframe sandbox="allow-same-origin" url="https://reactjsexample.com/tag/iframe/"
        width="1200px"
        height="550px"
        display="initial"
        position="relative"
      />
        {/* <Iframe src={this.props.url}  height={this.props.height} width={this.props.width}
         display={this.props.display} position={this.props.position}/> */}
      </div>
    )
  }
}