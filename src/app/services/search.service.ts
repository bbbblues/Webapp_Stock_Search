import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Company } from '../models/company.class'

@Injectable({
  providedIn: 'root'
})

export class SearchService {
  details:any;
  // private LOCAL_SERVER = "http://localhost:8080/";
  private LOCAL_SERVER = "";

  constructor(private http: HttpClient,
    private router: Router) { }

  getDetails(ticker: string) {
    // this.http.get(this.LOCAL_SERVER + '/details/' + ticker).subscribe(detailsData => {
    //   this.details = detailsData;
    //   // this.router.navigate(['details/' + ticker]);
    // });

    return this.http.get(this.LOCAL_SERVER + 'api/details/' + ticker).pipe(
      catchError((err: HttpErrorResponse) => {
        return throwError(err.message || 'server Error');
      })
    )
  }

  getSummary(ticker: string) {
    return this.http.get(this.LOCAL_SERVER + 'api/summary/' + ticker);
  }

  getNews(ticker: string) {
    return this.http.get(this.LOCAL_SERVER + 'api/news/' + ticker);
  }

  getHistory(ticker: string) {
    return this.http.get(this.LOCAL_SERVER + 'api/history/' + ticker);
  }

  getAutoComplete(ticker: string): Observable<Company[]> {
    if (ticker == '' || ticker == null) {
      console.log('null ticker');
      return this.http.get<Company[]>(this.LOCAL_SERVER + 'api/autocomplete/a');
    }
    return this.http.get<Company[]>(this.LOCAL_SERVER + 'api/autocomplete/' + ticker);
  }

}
