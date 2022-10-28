import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../firebase.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  pagesList: never | any = [];
  pageContent: never | any = '<style> p { text-align: center; } p.logo { font-size: 16em; } i.bi { color: #369; } p.label { font-size: 5em; color: #c00; } </style> <p class="logo"><i class="bi bi-exclamation-diamond"></i></p><p class="label">Page not found</p>';
  resume = false;

  constructor(private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.getPage('Contact');
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
