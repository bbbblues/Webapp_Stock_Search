import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit {

  navs = [
    {name: 'Search', link: '', active: true},
    {name: 'Watchlist', link: 'watchlist', active: false},
    {name: 'Portfolio', link: 'portfolio', active: false}
  ]

  public isMenuCollapsed = true;

  constructor() { }
 
  ngOnInit(): void {
  }

  activate(navItem) {
    this.navs.forEach(nav => {
      nav.active = false;
    });
    navItem.active = true;
  }
}
