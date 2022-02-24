import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {
  private counter = 5;

  constructor(private router: Router) { }

  ngOnInit(): void {
    setInterval(this.redirectToMainPage.bind(this), 2000);
  }

  private redirectToMainPage(): void {
    if (this.counter <= 0) {
      this.router.navigate(['./']);
    }
    this.counter -= 1;
  }
}
