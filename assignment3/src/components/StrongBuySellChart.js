import React, { useEffect,useState } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

const StrongBuySellChart = ({ data }) => {

       const options = {
            chart: {
              type: 'column',
              backgroundColor: '#ccc',
              accessibility: {
                enabled: null
            }
            },
            title: {
              text: 'Recommendation Trends',
              align: 'center'
            },
            xAxis: {
              categories: [data[0]['period'], data[1]['period'], data[2]['period'], data[3]['period']]
            },
            yAxis: {
              min: 0,
              title: {
                text: '#Analysis'
              },
              stackLabels: {
                enabled: true
              }
            },
            legend: {
              verticalAlign: 'bottom',
            },
            plotOptions: {
              column: {
                stacking: 'normal',
                dataLabels: {
                  enabled: true
                },
              }
            },
            series: [{
              name: 'Strong Buy',
              type: 'column',
              color: '#205c34',
              data: [data[0]['strongBuy'], data[1]['strongBuy'], data[2]['strongBuy'], data[3]['strongBuy']]
            }, {
              name: 'Buy',
              type: 'column',
              color: '#28ac54',
              data: [data[0]['buy'], data[1]['buy'], data[2]['buy'], data[3]['buy']]
            }, {
              type: 'column',
              name: 'Hold',
              color:'#b07c2c' ,
              data: [data[0]['hold'], data[1]['hold'], data[2]['hold'], data[3]['hold']]
            }, {
              type: 'column',
              name: 'Sell',
              color: '#f45454',
              data: [data[0]['sell'], data[1]['sell'], data[2]['sell'], data[3]['sell']]
            }, {
              type: 'column',
              name: 'Strong Sell',
            color: '#752d2d',
              data: [data[0]['strongSell'], data[1]['strongSell'], data[2]['strongSell'], data[3]['strongSell']]
            }]
          };
        return(
            <HighchartsReact highcharts={Highcharts} options={options} />
        );
}


export default StrongBuySellChart;