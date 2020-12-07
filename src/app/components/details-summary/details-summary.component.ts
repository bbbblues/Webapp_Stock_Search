import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import * as Highcharts from "highcharts/highstock";
import { Options } from "highcharts/highstock";
import { ActivatedRoute } from '@angular/router';

import IndicatorsCore from "highcharts/indicators/indicators";
import IndicatorZigzag from "highcharts/indicators/zigzag";
IndicatorsCore(Highcharts);
IndicatorZigzag(Highcharts);

@Component({
  selector: 'app-details-summary',
  templateUrl: './details-summary.component.html',
  styleUrls: ['./details-summary.component.css']
})
export class DetailsSummaryComponent implements OnInit {

  ticker: string;
  curDetail: any;
  price: any;
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Options;
  chartColor: string;
  constructor(private searchService: SearchService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.ticker = params['ticker'];
    });

    this.searchService.getSummary(this.ticker).subscribe(details => {
      this.curDetail = details;
      this.price = this.curDetail.price;

      if (this.price.last - this.price.prevClose < 0) {
        this.chartColor = 'red';
      } else {
        this.chartColor = 'green';
      }
  
      this.chartOptions = {
        title: {
          text: this.price.ticker
        },
        chart: {
          zoomType: null
        },
        rangeSelector: {
          enabled: false
        },
        series: [
          {
            name: this.price.ticker,
            type: "line",
            color: this.chartColor,
            id: "base",
            pointInterval: 3600 * 1000,
            data: this.curDetail.dailyChart
          }
        ]
      };
    });
    
    // this.price = {
    //   askPrice: null,
    //   askSize: null,
    //   bidPrice: null,
    //   bidSize: null,
    //   high: 116.93,
    //   last: 115.32,
    //   lastSaleTimestamp: "2020-10-29T20:00:00+00:00",
    //   lastSize: null,
    //   low: 112.2,
    //   mid: null,
    //   open: 112.37,
    //   prevClose: 111.2,
    //   quoteTimestamp: "2020-10-29T20:00:00+00:00",
    //   ticker: "AAPL",
    //   timestamp: "2020-10-29T20:00:00+00:00",
    //   tngoLast: 115.32,
    //   volume: 146129173
    // };

  }

  // ionViewDidLoad(): void {
  //   this.createChart();
  // }

  

}
