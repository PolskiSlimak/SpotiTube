import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailsYoutubeService } from 'src/app/core/services/details-youtube.service';
import { YoutubeService } from 'src/app/core/services/youtube.service';
import { NavBarComponent } from 'src/app/nav-bar/nav-bar.component';
import { TokenResponse } from '../../core/models/token-response.interface';

@Component({
  selector: 'app-callback-youtube',
  templateUrl: './callback-youtube.component.html',
  styleUrls: ['./callback-youtube.component.scss']
})
export class CallbackYoutubeComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private router: Router,
              private youtubeService: YoutubeService,
              private detailsYoutubeService: DetailsYoutubeService) { }

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error != null && error !== '') {
      this.router.navigate(['./error']);
    } else {
      this.youtubeService.accessToken = this.route.snapshot.queryParamMap.get('code') as string;
      this.youtubeService.youtubeRefreshToken().subscribe((data: TokenResponse) => {
        if (data.refresh_token) {
          this.youtubeService.refreshToken = data.refresh_token;
        }
        if (data.access_token) {
          this.youtubeService.accessToken = data.access_token;
        }
        this.router.navigate(['./main-page']);
        sessionStorage.setItem("isLoggedToYoutube", "true")
        this.detailsYoutubeService.onPlaylistLoadYoutube();
      });
    }
  }

}
