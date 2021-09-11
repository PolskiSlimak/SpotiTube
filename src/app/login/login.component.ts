import {Component, OnInit} from '@angular/core';
import {SpotifyService} from '../core/services/spotify.service';
import {Router} from '@angular/router';
import {Animations} from '../core/animations/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [Animations.buttonSize]
})
export class LoginComponent implements OnInit {

  isHover = false;

  constructor(private spotifyService: SpotifyService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.checkRefreshToken();
  }

  spotifyAuth(): void {
    this.spotifyService.spotifyAuth();
  }

  onMouseOver(): void {
    this.isHover = true;
  }

  onMouseLeave(): void {
    this.isHover = false;
  }

  private checkRefreshToken(): void {
    if (this.spotifyService.refreshToken != null && this.spotifyService.refreshToken !== '') {
      this.router.navigate(['./main']);
    }
  }

}
