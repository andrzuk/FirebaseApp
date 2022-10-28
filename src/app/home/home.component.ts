import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  pagesList: never | any = [];
  pageContent: never | any = '<style> p.logo { font-size: 16em; } i.bi { color: #369; } p.label { font-size: 5em; color: #c00; } </style> <p class="logo"><i class="bi bi-server"></i></p><p class="label">My Firebase Application</p>';
  resume = false;

  constructor(private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.getPage('Index');
  }

  getPage(type: string) {
    this.resume = false;
    this.firebase.getPages().then((snapshot) => {
      this.pagesList = [];
      const pages = snapshot.exportVal();
      for (const key in pages) {
        this.pagesList.push({ key: key, value: pages[key] });
      }
      this.pagesList.forEach((page: any) => {
        if (page.value.type == type) {
          this.pageContent = page.value.content;
        }
      });
      this.resume = true;
    }).catch((error) => {});
  }
}
