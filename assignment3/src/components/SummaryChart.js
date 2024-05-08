import React, { useEffect,useState } from 'react';
import Highcharts from 'highcharts/highstock';

const SummaryChart = ({ trend,chartData }) => {

    useEffect(() => {
        try{
        console.log('this is chart data', chartData);
        if (chartData === null ) {
            return;
        } else {
            const prices = [];
            const dates = [];
            const volumes = [];
            for (let i = 0; i < chartData.results.length; i++) {
                const item = chartData.results[i];
                prices.push(item.c);
                dates.push(item.t);
                volumes.push(item.v);
            }
            
            const priceData = [];
            for (let i = 0; i < dates.length; i++) {
                priceData.push([dates[i], prices[i]]);
            }

        Highcharts.chart('myChartSummary', {
            chart: {
                type: 'line',
                
            },
            title: {
                text: `<span style="color: #ccc; font-size: 18px">${chartData.ticker} Hourly Price Valuation</span>`
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    hour: '%H:%M'
                }
            },
            yAxis: [{
                title: {
                    text: ''
                },
            }, {
                title: {
                    text: ''
                },
                opposite: true
            }],
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    return `<span style="color:' + this.series.color + '">\u25CF</span> ${chartData.ticker}: ` + this.y;
                }
            },
            plotOptions: {
                series: {
                    marker: {
                        enabled: false
                    },
                    color: trend>0?'#90ed7d':'#f15c80'
                }
            },
            series: [{
                name: 'Price',
                data: priceData,
                yAxis: 1
            }]
        });
    };
}catch(e){
    console.log('error in chart',e);
}
    }, [chartData]);
    return (
        <div id="myChartSummary" />
    );
    }
export default SummaryChart;