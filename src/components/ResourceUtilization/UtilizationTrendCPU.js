import React, { PureComponent } from 'react';
import Highcharts from 'highcharts';

import {
  ChartComponent,
  ChartContainer,
  ChartTitle
} from '@nokia-csf-uxr/ccht';
import '@nokia-csf-uxr/ccht/ccht.css';

const TITLE_HEIGHT = 58;

const percentStackedOptions = {
    isModalable:true,
  yAxis: {
    labels: {
      format: '{value} %',
      lineWidth: 1,
    }
  },
  xAxis: {
    categories: ['1750', '1800', '1850', '1900', '1950', '1999', '2050', '2150'],
    title: {
      text: '-------Threshold ------------Average'
    }
  },
  plotOptions: {
    area: {
      stacking: 'number',
      lineColor: 'transparent',
      lineWidth: 1,
      marker: {
        lineWidth: 1,
        lineColor: '#666666'
      }
    },
    series: {
      events: {
        legendItemClick(e) {
          let numberNotVisible = 0;
          Highcharts.each(this.chart.series, (p) => {
            if (!p.visible) {
              numberNotVisible += 1;
            }
          });
          const numberInSeries = e.target.chart.options.series.length;
          // do not allow to turn off last dataset, but allow to turn on any
          if ((numberInSeries - 1 === numberNotVisible) && e.target.visible === true) {
            return false;
          }
          return true;
        }
      }
    }
  },
  series: [
//       {
//     name: 'Data series one',
//     data: [3.002, 4.34, 3.122, 3.344, 4.56, 5.67, 3.21, 2.4555]
//   }, {
//     name: 'Data series two',
//     data: [8.22, 6.445, 4.4, 4.21, 5.45, 7.5544, 7.3, 9.001]
// //   }, 
// {
//     name: 'Data series three',
//     data: [9.001, 7.1, 5.32, 5.009, 6.9, 8.12, 9.2344, 11.23]
//   },
//  {
//     name: '',
//     data: [10.334, 8.134, 7.223, 6.2, 7.001, 9.233, 11.324, 13.33]
//   }, 
  {
     name: '',
    data: [15.334, 18.134, 12.223, 12.2, 17.001, 11.233, 11.324, 23.33]
  }],
  
  chart: {
    height: 400,
    type: 'area'
  }
};

const title = {
  title: 'CPU Utilization',
  subtitle: '',
};

const modalTitle = {
  title: 'Percentage Stacked AreaChart in Modal Mode',
  subtitle: 'Chart subtitle',
};

const expansionButtonConfig = {
  tooltip: {
    text: 'Expand the chart',
    balloon: true
  }
};

const modalButtonConfig = {
  tooltip: {
    text: 'Close the modal',
    balloon: true
  }
};

/** AreaChartResponsiveContainer is a component that is made for Storybook only for demonstrating AreaChart usage. */
class AreaChartResponsiveContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      height: undefined,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  resize = () => {
    this.setState({
      height: this.wrapperRef.clientHeight - TITLE_HEIGHT,
    });
  }

  render() {
    return (
      <div ref={(ref) => { this.wrapperRef = ref; }} style={{ minHeight: '100%', maxHeight: '100%', minWidth: '100%' }}>
        <ChartContainer
          id='prasad'
          multipleLinesConfigured={false}
          expansionButton={expansionButtonConfig}
          closeButton={modalButtonConfig}
          renderTitle={props => <ChartTitle {...props} {...title} />}
          renderModalTitle={props => <ChartTitle {...props} {...modalTitle} />}
          renderChart={props => <ChartComponent {...props} options={{ ...percentStackedOptions, chart: { ...percentStackedOptions.chart, height: this.state.height } }} />}
        />
      </div>
    );
  }
}
export default AreaChartResponsiveContainer;