import { Component, OnDestroy, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit, OnDestroy {

  ticker: string;
  curDetail: any;
  companyDes: any;
  price: any;
  starFilled:boolean = false;
  curTime:string;
  isOpen:boolean;
  qtForm;
  successMessage:string = '';
  dangerMessage:string = '';
  buyMessage: string = '';
  watchlist: string[];
  buylist: any[];
  valid: boolean = true;
  isWait: boolean = true;
  interval;

  private subscription: Subscription = new Subscription();

  private _success = new Subject<string>();
  private _danger = new Subject<string>();
  private _buy = new Subject<string>();

  constructor(
    private searchService: SearchService, 
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute) { 
      this.qtForm = this.formBuilder.group({
        qt: 0
      });
  }


  ngOnInit(): void {

    this.activatedRoute.params.subscribe(params => {
      this.ticker = params['ticker'];
    });

    let watchlistSt = localStorage.getItem('watchlist');
    if (watchlistSt == null) {
      this.watchlist = [];
    } else {
      this.watchlist = JSON.parse(watchlistSt);
      this.starFilled = this.watchlist.includes(this.ticker);
    }

    let buylistSt = localStorage.getItem('buylist');
    if (buylistSt == null) {
      this.buylist = [];
    } else {
      this.buylist = JSON.parse(buylistSt);
    }

    this.refreshData();
    this.interval = setInterval(() => {
      this.refreshData();
    }, 15* 1000)
  
    
    this._success.subscribe(message => this.successMessage = message);
    this._success.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = '');

    this._danger.subscribe(message => this.dangerMessage = message);
    this._danger.pipe(
      debounceTime(5000)
    ).subscribe(() => this.dangerMessage = '');

    this._buy.subscribe(message => this.buyMessage = message);
    this._buy.pipe(
      debounceTime(5000)
    ).subscribe(() => this.buyMessage = '');
  }

  
  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearInterval(this.interval);
  }


  refreshData() {
    this.subscription.add(
      this.searchService.getDetails(this.ticker).subscribe(details => {

        this.curDetail = details;
        if ('errormsg' in this.curDetail == true) {
          this.valid = false;
          this.isWait = false;
          return;
        }
  
        this.isOpen = this.curDetail.isOpen;
        this.companyDes = this.curDetail.companyDes;
        this.price = this.curDetail.price;
        this.price.change = (this.price.last - this.price.prevClose).toFixed(2);
        this.price.changePercentage = (this.price.change * 100 / this.price.prevClose).toFixed(2);
  
        let curTimeOri = new Date();
        let offset = curTimeOri.getTimezoneOffset();
        let curISO = new Date(curTimeOri.getTime() - (offset*60*1000)).toISOString();
        this.curTime = curISO.slice(0, 10) + ' ' + curISO.slice(11, 19);
  
        let timestamp = new Date(this.price.timestamp);
        let tOffset = timestamp.getTimezoneOffset();
        let timestampISO = new Date(timestamp.getTime() - (tOffset*60*1000)).toISOString();
        this.price.timestamp = timestampISO.slice(0, 10) + ' ' + timestampISO.slice(11, 19);
  
        this.isWait = false;
      })
    );
    
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }

  onSubmit(quantity) {
    // console.log(quantity.qt);
    var inList = false;
    for (let i = 0; i < this.buylist.length; ++i) {
      let curstock = this.buylist[i];
      if (curstock.ticker == this.ticker) {
        inList = true;
        curstock.quantity += quantity.qt;
        curstock.totalCost += quantity.qt * this.price.last;
        curstock.avgCost = curstock.totalCost / curstock.quantity;
        break;
      }
    }

    if (!inList) {
      let newStock = {
        ticker: this.ticker,
        quantity: quantity.qt,
        totalCost: quantity.qt * this.price.last,
        avgCost: quantity.qt * this.price.last / quantity.qt
      };
      this.buylist.push(newStock);
    }

    localStorage.setItem('buylist', JSON.stringify(this.buylist));
    this.modalService.dismissAll('Dismissed after saving data');

    this._buy.next(`${this.companyDes.ticker} bought successfully!`);
    // console.log(JSON.stringify(this.buylist));
  }

  updateWatchlist() {
    if (this.starFilled) {
      this._success.next(`${this.companyDes.ticker} added to Watchlist`);
      this.watchlist.push(this.ticker);
    } else {
      this._danger.next(`${this.companyDes.ticker} removed from Watchlist`);
      for (let i = 0; i < this.watchlist.length; i++) {
        if (this.watchlist[i] == this.ticker) {
          this.watchlist.splice(i, 1);
        }
      }
    }

    localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
  }

}
