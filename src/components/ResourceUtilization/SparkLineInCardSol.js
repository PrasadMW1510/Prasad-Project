import React, { Component } from 'react';
import SvgIcon from '@nokia-csf-uxr/csfWidgets/SvgIcon';
import {CardCollection} from '@nokia-csf-uxr/csfWidgets';
import Card from '@nokia-csf-uxr/csfWidgets/Card';
import SparkLines, { SparkLinesLabel } from '@nokia-csf-uxr/ccht/SparkLines';
import '@nokia-csf-uxr/ccht/ccht.css';

class SparkLinesInCardCollectionSource extends Component {
  state = {
    problems: [
      {
        id: 1,
        problemName: 'E2E call setup success 1',
        problemTrend: [1800, 1900, 2300, 2000, 2200, 2530]
      },
      {
        id: 2,
        problemName: 'E2E call setup success 2',
        problemTrend: [1800, 1500, 1000, 2000, 3520, 1120]
      },
      {
        id: 3,
        problemName: 'E2E call setup success 3',
        problemTrend: [1800, 1500, 1000, 2000, 1500, 730]
      },
      {
        id: 4,
        problemName: 'E2E call setup success 4',
        problemTrend: [400, 150, 310, 220, 135, 313]
      },
      {
        id: 5,
        problemName: 'E2E call setup success 5',
        problemTrend: [120, 150, 150, 200, 135, 194]
      }
    ]
  };

  render() {
    const { problems } = { ...this.state };
    const rows = [];
    // eslint-disable-next-line array-callback-return
    problems.map((problem) => {
      if (problem.problemTrend[5] > problem.problemTrend[4]) {
        rows.push({
          id: problem.id,
          options:
          {
            series: [{ data: problem.problemTrend }],
            plotOptions: { series: { enableMouseTracking: true } }
            
          },
          leftLabels: [
            <SparkLinesLabel key="label-1" id="label-1" label={rows.length + 1} />,
            <SparkLinesLabel
              key="label-2"
              id="label-2"
              label={problem.problemName}
            />
          ],
          rightLabels: [
            <SparkLinesLabel
              key={`trend_${problem.id}`}
              id={`trend_${problem.id}`}
              value={problem.problemTrend[5]}
              icon="ic_arrow_upward"
              color="#D9070A"
            />
          ]
        });
      } else {
        rows.push({
          id: problem.id,
          options:
          {
            series: [{ data: problem.problemTrend }],
            plotOptions: { series: { enableMouseTracking: true } }
          },
          leftLabels: [
            <SparkLinesLabel key="label-1" id="label-1" label={rows.length + 1} />,
            <SparkLinesLabel
              key="label-2"
              id="label-2"
              label={problem.problemName}
            />
          ],
          rightLabels: [
            <SparkLinesLabel
              key={`trend_${problem.id}`}
              id={`trend_${problem.id}`}
              value={problem.problemTrend[5]}
              icon="ic_arrow_downward"
              color="#124191"
            />
          ]
        });
      }
    });
    const topProblems = (
      <div>
        <div style={{ width: '500px', textAlign: 'center' }}>
          <SparkLines
            header={{
              leftLabelsTitles: [
                // eslint-disable-next-line react/jsx-key
                <div style={{ textAlign: 'right' }}>
                  <SvgIcon
                    key="problem_view_icon"
                    id="problem_view_icon"
                    icon="ic_warning_alert"
                    iconColor="#FF7900"
                    iconHeight="36px"
                    iconWidth="36px"
                  />
                </div>,
                // eslint-disable-next-line react/jsx-key
                <div style={{ padding: '0px', textAlign: 'center' }}>Top Problems</div>
              ],
              rightLabelsTitles: [
                <SvgIcon
                  key="problem_view_open_in_new"
                  id="problem_view_open_in_new"
                  icon="ic_open_in_new"
                  iconColor="#757575"
                  iconHeight="24px"
                  iconWidth="24px"
                />
              ],
              chartTitle: ''
            }}
            columnsStyle={[
              {
                width: 60,
                padding: 0
              },
              {
                width: 200
              },
              {
                width: '100%'
              },
              {
                width: 80
              }
            ]}
            rows={rows}
          />
        </div>
      </div>
    );

    const card1 = (
      <Card
        id="TopProblemsCard"
        key="card3"
        className="card"
        css={{
          background: '#FFF',
          height: 384,
          width: 'auto',
          padding: 0
        }}
        selectable={false}
        dataTest="cardcollection-card1"
      >
        {topProblems}
      </Card>
    );
    const layout = [
      {
        x: 0,
        y: 1,
        w: 1,
        h: 1,
        i: '0'
      },
      {
        x: 0,
        y: 1,
        w: 1,
        h: 1,
        i: '1'
      },
      {
        x: 1,
        y: 1,
        w: 1,
        h: 1,
        i: '2'
      }
    ];
    return (
      <CardCollection
        id="actionviewcardcollection"
        dynamicWidth
        cols={3}
        rowHeight={400}
        margin={[20, 20]}
        padding={[5, 5]}
        layout={layout}
        minCardWidth={500}
      >
        {[card1]}
      </CardCollection>
    );
  }
}

export default SparkLinesInCardCollectionSource;