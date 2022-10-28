import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss']
})
export class PageComponent implements OnInit {

  routeParam: any;
  pagesList: never | any = [];
  pageContent: never | any = '<style> p { text-align: center; } p.logo { font-size: 16em; } i.bi { color: #369; } p.label { font-size: 5em; color: #c00; } </style> <p class="logo"><i class="bi bi-exclamation-diamond"></i></p><p class="label">Page not found</p>';
  resume = false;

  constructor(private activatedRoute: ActivatedRoute, private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.routeParam = params.get('id');
      this.getPage(this.routeParam);
    });
  }

  getPage(id: string) {
    this.resume = false;
    this.firebase.getPages().then((snapshot) => {
      this.pagesList = [];
      const pages = snapshot.exportVal();
      for (const key in pages) {
        this.pagesList.push({ key: key, value: pages[key] });
      }
      this.pagesList.forEach((page: any) => {
        if (page.key == id) {
          this.pageContent = page.value.content;
        }
      });
      this.resume = true;
    }).catch((error) => {});
  }
}
