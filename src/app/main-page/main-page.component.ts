import {Component, OnInit} from '@angular/core';
import {SpotifyService} from '../core/services/spotify.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  constructor(private router: Router,
              private spotifyService: SpotifyService) {
  }

  ngOnInit(): void {
    this.checkRefreshToken();
  }

  onPlay(): void {
    this.spotifyService.play().subscribe((data: any) => {
    });
  }

  onPause(): void {
    this.spotifyService.pause().subscribe((data: any) => {
    });
  }

  logout(): void {
    this.spotifyService.logout();
  }


  private checkRefreshToken(): void {
    if (this.spotifyService.refreshToken == null) {
      this.router.navigate(['./']);
    }
  }

}
