import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-details-news',
  templateUrl: './details-news.component.html',
  styleUrls: ['./details-news.component.css']
})
export class DetailsNewsComponent implements OnInit {

  ticker: string;
  curDetails: any;
  newsLeft: any[] = [];
  newsRight: any[] = [];
  news: any[] = [];
  twitterIcon = faTwitter;
  facebookIcon = faFacebook;

  constructor(private searchService: SearchService,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.ticker = params['ticker'];
    });

    this.searchService.getNews(this.ticker).subscribe(details => {
      this.curDetails = details;
      for (let i = 0; i < this.curDetails.news.length; ++i) {
        let curNews = this.curDetails.news[i];
        // let url = encodeURIComponent()
        if (i+1 < this.curDetails.news.length) {
          let nxtNews = this.curDetails.news[i+1];
          i += 1;

          this.news.push([curNews, nxtNews]);
        } else {
          this.news.push([curNews]);
        }
        // if (i % 2 == 0) {
        //   this.newsLeft.push(curNews);
        // } else {
        //   this.newsRight.push(curNews);
        // }
      }
    });
  }

  openNews(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }

  encode(str) {
    return encodeURIComponent(str);
  }

}
