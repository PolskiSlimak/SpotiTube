import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SpotifyService} from '../../core/services/spotify.service';
import {TokenResponse} from '../../core/models/token-response.interface';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss']
})
export class CallbackComponent implements OnInit {

  spinnerColor = "#e08214";

  constructor(private route: ActivatedRoute,
              private router: Router,
              private spotifyService: SpotifyService) {
  }

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error != null && error !== '') {
      this.router.navigate(['./error']);
    } else {
      this.spotifyService.accessToken = this.route.snapshot.queryParamMap.get('code') as string;
      this.spotifyService.spotifyRefreshToken().subscribe((data: TokenResponse) => {
        if (data.refresh_token) {
          this.spotifyService.refreshToken = data.refresh_token;
        }
        if (data.access_token) {
          this.spotifyService.accessToken = data.access_token;
        }

        this.router.navigate(['./main-page']);
      });
    }

  }

}
