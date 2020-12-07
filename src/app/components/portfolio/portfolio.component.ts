import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {

  stocklist: any[] = [];
  buylist: any[] = [];
  tickerlist: string[];
  hasBuylist: boolean;
  qtBuyForm;
  qtSellForm;
  rmvInd: number = -1;
  isWait: boolean = true;
  constructor(private searchService: SearchService,
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder) {
      this.qtBuyForm = this.formBuilder.group({
        qtBuy: 0
      });
      this.qtSellForm = this.formBuilder.group({
        qtSell: 0
      });
    }


  ngOnInit(): void {
    var listStorage = localStorage.getItem('buylist');
    if (listStorage == null || listStorage == '[]') {
      this.hasBuylist = false;
      this.isWait = false;
    } else {
      this.buylist = JSON.parse(listStorage);
      if (this.buylist.length != 0) {
        this.hasBuylist = true;
      }
      // this.buylist.sort((a, b) => a.ticker >= b.ticker ? 1:0);
      for (let i = 0; i < this.buylist.length; ++i) {
        let curstock = this.buylist[i];
        let curticker = curstock.ticker;
        this.searchService.getDetails(curticker).subscribe(details => {
          let curD = <any> details;
          let name = curD.companyDes.name;
          let curPrice = curD.price.last;
          this.stocklist.push({
            ticker: curticker,
            name: name,
            quantity: curstock.quantity,
            avgCost: curstock.avgCost.toFixed(2),
            totalCost: curstock.totalCost.toFixed(2),
            change: (curPrice - curstock.avgCost).toFixed(2),
            curPrice: curPrice.toFixed(2),
            marketValue: (curPrice * curstock.quantity).toFixed(2)
          });

          if (i == this.buylist.length-1) {
            this.stocklist.sort((a, b) => a.ticker >= b.ticker ? 1:0);
            this.isWait = false;
          }
        });
      }
    }
  }


  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }


  openDetails(ticker:string) {
    this.router.navigate(['details/' + ticker]);
  }


  onBuyFormSubmit(quantity, ticker:string) {
    let qb = quantity.qtBuy;
    // var targetPrice = 0.0;
    for (let i  = 0; i < this.stocklist.length; ++i) {
      let curstock = this.stocklist[i];
      this.searchService.getDetails(curstock.ticker).subscribe(details => {
        var curD = <any> details;
        var curPrice = curD.price.last;
        curstock.curPrice = curPrice.toFixed(2);
        curstock.change = (curPrice - Number(curstock.avgCost)).toFixed(2);
        curstock.marketValue = (curPrice * curstock.quantity).toFixed(2);

        if (curstock.ticker == ticker) {
          var targetPrice = curPrice;
          curstock.quantity += qb;
          curstock.totalCost = (Number(curstock.totalCost) + qb * curPrice).toFixed(2);
          curstock.avgCost = (Number(curstock.totalCost) / curstock.quantity).toFixed(2);
          curstock.change = (curPrice - Number(curstock.avgCost)).toFixed(2);
          curstock.marketValue = (curPrice * curstock.quantity).toFixed(2);

          for (let i  = 0; i < this.buylist.length; ++i) {
            if (this.buylist[i].ticker == ticker) {
              this.buylist[i].quantity += qb;
              this.buylist[i].totalCost += qb * targetPrice;
              this.buylist[i].avgCost = this.buylist[i].totalCost / this.buylist[i].quantity;
              break;
            }
          }
          localStorage.setItem('buylist', JSON.stringify(this.buylist));
        }
      });   
    }
    this.modalService.dismissAll('Dismissed after saving data');
  }


  onSellFormSubmit(quantity, ticker:string) {
    let qb = quantity.qtSell;
    // var targetPrice = 0.0;
    for (let i  = 0; i < this.stocklist.length; ++i) {
      if (i >= this.stocklist.length) { break; }
      let curstock = this.stocklist[i];
      this.searchService.getDetails(curstock.ticker).subscribe(details => {
        var curD = <any> details;
        var curPrice = curD.price.last;
        curstock.curPrice = curPrice.toFixed(2);
        curstock.change = (curPrice - Number(curstock.avgCost)).toFixed(2);
        curstock.marketValue = (curPrice * curstock.quantity).toFixed(2);

        if (curstock.ticker == ticker) {
          var targetPrice = curPrice;
          curstock.quantity -= qb;
          if (curstock.quantity == 0) {
            // this.rmvInd = i;
            this.stocklist.splice(i, 1);
          } else {
            curstock.totalCost = (Number(curstock.totalCost) - qb * curPrice).toFixed(2);
            curstock.avgCost = (Number(curstock.totalCost) / curstock.quantity).toFixed(2);
            curstock.change = (curPrice - Number(curstock.avgCost)).toFixed(2);
            curstock.marketValue = (curPrice * curstock.quantity).toFixed(2);
          }

          for (let j = 0; j < this.buylist.length; ++j) {
            if (this.buylist[j].ticker == ticker) {
              this.buylist[j].quantity -= qb;
              if (this.buylist[j].quantity == 0) {
                this.buylist.splice(j, 1);
                if (this.buylist.length == 0) {
                  this.hasBuylist = false;
                }
                break;
              }
              this.buylist[j].totalCost -= qb * targetPrice;
              this.buylist[j].avgCost = this.buylist[j].totalCost / this.buylist[j].quantity;
              break;
            }
          }

          localStorage.setItem('buylist', JSON.stringify(this.buylist));

        }
      });   
    }
    this.modalService.dismissAll('Dismissed after saving data');

    // if (this.rmvInd != -1) {
    //   this.stocklist.splice(this.rmvInd, 1);
    //   this.rmvInd = -1;
    //   console.log('after sell:');
    //   console.log(this.stocklist);
    // } 



  }

}
