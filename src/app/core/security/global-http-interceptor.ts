import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {SpotifyService} from '../services/spotify.service';
import {TokenResponse} from '../models/token-response.interface';
import { YoutubeService } from '../services/youtube.service';

@Injectable()
export class GlobalHttpInterceptor   implements HttpInterceptor {

  constructor(private _spotifyService: SpotifyService,
              private _youtubeService: YoutubeService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        switch (error.status) {
          case 401:
            //sprawdzic co dac do if
            if (true) {
              this._spotifyService.spotifyRefreshToken().subscribe((data: TokenResponse) => {
                if (data.refresh_token) {
                  this._spotifyService.refreshToken = data.refresh_token;
                }
                if (data.access_token) {
                  this._spotifyService.accessToken = data.access_token;
                }
                return next.handle(req);
              });
            } else {
              this._youtubeService.youtubeRefreshToken().subscribe((data: TokenResponse) => {
                if (data.refresh_token) {
                  this._youtubeService.refreshToken = data.refresh_token;
                }
                if (data.access_token) {
                  this._youtubeService.accessToken = data.access_token;
                }
                return next.handle(req);
              });
              break;
            }
        }
        return throwError(error.message);
      })
    );
  }
}
