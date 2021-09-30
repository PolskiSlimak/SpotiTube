import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../core/services/spotify.service';
import { DetailsService } from '../core/services/details.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  constructor(private router: Router,
              private spotifyService: SpotifyService,
              private detailsService: DetailsService) {
  }

  ngOnInit(): void {
    this.checkRefreshToken();
  }

  checkRefreshToken(): void {
    if (this.spotifyService.refreshToken == null) {
      this.router.navigate(['./']);
    }
  }

}
