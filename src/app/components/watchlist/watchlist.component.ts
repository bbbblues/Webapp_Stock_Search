import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  hasWatchlist: boolean;
  tickerlist: string[];
  watchlist: any[] = [];
  isWait: boolean = true;
  constructor(private searchService: SearchService,
    private router: Router) { }
  
  ngOnInit(): void {
    var watchlistStorage = localStorage.getItem('watchlist');
    // var watchlistStorage = " GOOG WMG";
    if (watchlistStorage == null || watchlistStorage == '[]') {
      this.hasWatchlist = false;
      this.isWait = false;
    } else {
      this.tickerlist = JSON.parse(watchlistStorage);
      if (this.tickerlist.length != 0) {
        this.hasWatchlist = true;
      }
      this.tickerlist.sort();
      // console.log(this.tickerlist);
      for (let i = 0; i < this.tickerlist.length; ++i) {
        let ticker = this.tickerlist[i];
        this.searchService.getDetails(ticker).subscribe(details => {
          let curD = <any> details;
          let name = curD.companyDes.name;
          let price = curD.price;
          let changeOri = price.last - price.prevClose;
          let change = changeOri.toFixed(2);
          let changePercentage = (changeOri * 100 / price.prevClose).toFixed(2);
          this.watchlist.push({
            ticker: ticker,
            name: name,
            price: price.last,
            change: change,
            changePercentage: changePercentage
          });

          if (i == this.tickerlist.length-1) {
            this.watchlist.sort((a,b) => a.ticker > b.ticker ? 1:0);
            this.isWait = false;
          }
        });
      }
      
    }
  }

  delete(tickerToD: string): void {
    for (let i = 0; i < this.watchlist.length; ++i) {
      if (tickerToD == this.watchlist[i].ticker) {
        this.watchlist.splice(i, 1);
        break;
      }
    }

    for (let i = 0; i < this.tickerlist.length; ++i) {
      if (tickerToD == this.tickerlist[i]) {
        this.tickerlist.splice(i, 1);
        break;
      }
    }

    localStorage.setItem("watchlist", JSON.stringify(this.tickerlist));
  }

  openDetails(ticker: string): void {
    this.router.navigate(['details/' + ticker]);
  }

}
