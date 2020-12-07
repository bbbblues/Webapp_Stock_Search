import { Component, OnInit } from '@angular/core';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { SearchService } from '../../services/search.service';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, switchMap, tap, finalize } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Company } from '../../models/company.class'


@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  searchIcon = faSearch;
  options: Company[] = [];
  control = new FormControl();
  isLoading = false;

  constructor(
    private searchService:SearchService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    // console.log(this.getOptions('aapl'));
    // this.options = this.control.valueChanges.pipe(
    //   // startWith('goog'),
    //   debounceTime(300),
    //   map(value => this.getOptions(value))
    // );

    this.control.valueChanges.pipe(
      debounceTime(500),
      tap(() => this.isLoading = true),
      switchMap(value => 
        this.searchService.getAutoComplete(value).pipe(
          finalize(() => this.isLoading = false)
        )
      )
    ).subscribe(results => {
      this.options = results;
    });
  }


  onSubmit(tickerData: string) {
    this.router.navigate(['details/' + tickerData]);
  }

  getOptions(text: string): Company[] {
    console.log(`text: ${text}`);
    var tickerAndNames:Company[] = [];

    if (text == '') {
      return tickerAndNames;
    }

    this.searchService.getAutoComplete(text).subscribe(results => {
      let cresults = <any[]> results;
      for (let comp of cresults) {
        tickerAndNames.push({
          ticker: comp.ticker,
          name: comp.name
        });
      }
      console.log(tickerAndNames);
      return tickerAndNames;
    });
  }

}
