import React, { Component } from "react";
// import CommonEnums from "@nokia-csf-uxr/ccht/utils/CommonEnums";
import { SparkLines} from "@nokia-csf-uxr/ccht";
import "@nokia-csf-uxr/ccht/ccht.css";

const options ={
series:
[
  {
    "name": "Data series one",
    "data": [
      12,
      35,
      10,
      130,
      300,
      190,
      220,
      290,
      20,
      160,
      18,
      150,
      10,
      20,
      135,
      160,
      20,
      160,
      18,
      150,
      10,
      20,
      135,
      160
    ],
    "marker": {
      "enabled": false
    }
  }
],
plotOptions:
{
  "area": {},
  "line": {
    "lineWidth": 1,
    "lineColor": "transparent",
    "fillOpacity": 0,
    "marker": {
      "lineWidth": 1,
      "lineColor": "#666666",
      "enabled": true
    }
  },
  "spline": {
    "color": "#FF9C45"
  }
},
xAxis:
{
  "type": "line",
  "animation": true,
  "paddingTop": 0,
  "paddingLeft": 0,
  "paddingRight": 0,
  "marginLeft": 8,
  "marginRight": 8,
  "marginTop": 0,
  "height": 40,
  "style": {
    "overflow": "visible"
  },
  "accessibility": {
    "enabled": true,
    "keyboardNavigation": {
      "enabled": true
    }
  }
}

}

// const chart = Highcharts.chart('container',{
//   xAxis:{
//     visible:false
//   },

//   title:{
//     text:''
//   },
//   yAxis:{
//     visible:false
//   },
//   plotOptions:{
//     line:{
//       marker:{
//         enabled:false
//       }
//     }
//   },
//   series:[{
//     data:[29.9,71.5,106.4,129.2,144.0,176.0,135.6,148.5,216.4,194.1,95.6,54.4],
//     showlnLegend:false
//   }]
//  });

class SparkLine extends Component {
  render() {
    return (
        <div style={{margin: 20}}>
        <div className="storybook__charts-container">
            <div className="storybook__chart-container--fixed-size">
                <SparkLines columnsStyle={[{width: 70}, {width: 60}, {width: "100%"}]}
                   rows= {[{id: "row-1", 
                   options: {
                    series: [
                      18,
                      150,
                      10,
                      20,
                      135,
                      160,
                      20,
                      160,
                    ],
                    }
                      
                      }]} 
                />
                <p>prasad</p>
            </div>
        </div>
    </div>
     );
  }
}

export default SparkLine;


