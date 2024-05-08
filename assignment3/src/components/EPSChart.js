import React, { useEffect,useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

const EPSChart = ({data}) => {

    var estimate = [];
    var actual = [];
    var time = [];
    var surprise = [];
    data.forEach((earn) => {
        if (earn.estimate == null) {
            estimate.push(0);
        } else {
            estimate.push(earn.estimate);
        }
        actual.push(earn.actual);
        time.push(earn.period + "<br>" + "Surprise: " + earn.surprise);
    });
    const surpriseOptions = {
        chart:{
            type:'line',

            backgroundColor: '#Ccc',
        },
        title: {
            text: 'Historical EPS Surprises'
        },
        
        yAxis: {
            min:0,
            tickAmount: 8,
            title: {
                text: 'Quarterly EPS'
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'black',
                zIndex: 5
            },
        ],
        
        },
        tooltip:{
            shared:true
        },
        xAxis: {
            categories: time,
        },
        plotOptions:{

        },
        legend: {
            verticalAlign: 'bottom'
        },
        series: [ {
            name: 'Actual',
            type: 'line',
            color: '#6AA0C9',
            data: actual
        },{
            name: 'Estimate',
            type: 'line',
            color: '#534D95',
            data: estimate
        },],

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 300
                },
                chartOptions: {
                    legend: {
                        layout: 'horizontal',
                        align: 'center',
                        verticalAlign: 'bottom'
                    }
                }
            }]
        },
    };
  return (
    <HighchartsReact className='chart-indicator' highcharts={Highcharts} options={surpriseOptions}/>
  )
}

export default EPSChart;