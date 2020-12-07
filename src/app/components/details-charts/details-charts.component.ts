import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import * as Highcharts from "highcharts/highstock";
import { Options } from "highcharts/highstock";
import { ActivatedRoute } from '@angular/router';

import IndicatorsCore from "highcharts/indicators/indicators";
import vbp from 'highcharts/indicators/volume-by-price';

IndicatorsCore(Highcharts);
vbp(Highcharts);

@Component({
  selector: 'app-details-charts',
  templateUrl: './details-charts.component.html',
  styleUrls: ['./details-charts.component.css']
})
export class DetailsChartsComponent implements OnInit {

  ticker: string;
  chartOptions: Options;
  Highcharts: typeof Highcharts = Highcharts;
  curDetail: any;
  ohlc:[];
  volume:[];
  constructor(private searchService: SearchService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
        this.ticker = params['ticker'];
      });
  
    this.searchService.getHistory(this.ticker).subscribe(details => {
        this.curDetail = details;
        this.ohlc = this.curDetail.ohlc;
        this.volume = this.curDetail.volume;

        this.chartOptions =  {

            rangeSelector: {
                selected: 2
            },
      
            title: {
                text: `${this.ticker} Historical`
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
      
            series: [{
                type: 'candlestick',
                name: this.ticker,
                id: this.ticker,
                zIndex: 2,
                data: this.ohlc
            }, {
                type: 'column',
                name: 'Volume',
                id: 'volume',
                data: this.volume,
                yAxis: 1
            }, {
                type: 'vbp',
                linkedTo: this.ticker,
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
                linkedTo: this.ticker,
                zIndex: 1,
                marker: {
                    enabled: false
                }
            }]
          };
        
    });
  }



   

}
