import React, { useEffect,useState } from 'react';
import Highcharts from 'highcharts/highstock';


const StockChartComponent = ({ ticker,chartData }) => {
    useEffect(() => {
        try{
        if (chartData === null ) {
            return;
        } else {
            const ohlc = [];
            const volume = [];
            
            const dataLength = chartData.results.length;
            const groupingUnits = [
                ['week', [1]],
                ['month', [1, 2, 3, 4, 6]]
            ];

            for (let i = 0; i < dataLength; i += 1) {
                ohlc.push([
                    chartData.results[i]['t'], // the date
                    chartData.results[i]['o'], // open
                    chartData.results[i]['h'], // high
                    chartData.results[i]['l'], // low
                    chartData.results[i]['c'] // close
                ]);

                volume.push([
                    chartData.results[i]['t'], // the date
                    chartData.results[i]['v'] // the volume
                ]);
            }

            const options = {
                    rangeSelector: {
                        selected: 2
                    },
                    title: {
                        text: `${ticker} Historical`
                    },
                    subtitle: {
                        text: 'With SMA and Volume by Price technical indicators'
                    },
                    yAxis: [{
                        startOnTick: false,
                        endOnTick: false,
                        labels: {
                            align: 'right',
                            x: -3
                        },
                        title: {
                            text: 'OHLC'
                        },
                        height: '60%',
                        lineWidth: 2,
                        resize: {
                            enabled: true
                        }
                    }, {
                        labels: {
                            align: 'right',
                            x: -3
                        },
                        title: {
                            text: 'Volume'
                        },
                        top: '65%',
                        height: '35%',
                        offset: 0,
                        lineWidth: 2
                    }],
                    tooltip: {
                        split: true
                    },
                    plotOptions: {
                        series: {
                            dataGrouping: {
                                units: groupingUnits
                            }
                        }
                    },
                    series: [{
                        type: 'candlestick',
                        name: 'AAPL',
                        id: 'aapl',
                        zIndex: 2,
                        data: ohlc
                    }, {
                        type: 'column',
                        name: 'Volume',
                        id: 'volume',
                        data: volume,
                        yAxis: 1
                    }, {
                        type: 'vbp',
                        linkedTo: 'aapl',
                        params: {
                            volumeSeriesID: 'volume'
                        },
                        dataLabels: {
                            enabled: false
                        },
                        zoneLines: {
                            enabled: false
                        }
                    }, {
                        type: 'sma',
                        linkedTo: 'aapl',
                        zIndex: 1,
                        marker: {
                            enabled: false
                        }
                    }]
            };

            Highcharts.stockChart('myChart', options);
        }
    }catch(e){
        console.log('error in chart',e);
    }
    }, [chartData, ticker]);
    return (
        <div id="myChart" />
    );
}

export default StockChartComponent;