import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {SpotifyService} from '../services/spotify.service';
import {TokenResponse} from '../models/token-response.interface';

@Injectable()
export class GlobalHttpInterceptor   implements HttpInterceptor {

  constructor(private spotifyService: SpotifyService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        switch (error.status) {
          case 401:
            this.spotifyService.spotifyRefreshToken().subscribe((data: TokenResponse) => {
              return next.handle(req);
            });
            break;
        }
        return throwError(error.message);
      })
    );
  }
}
