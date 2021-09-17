import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {TokenResponse} from '../models/token-response.interface';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Injectable()
export class SpotifyService {

  private readonly clientId: string = '187375d4092045fda10e5378ade942c7';
  private readonly clientSecret: string = '2efb20536e7d480481dbd3566095a1dc';
  private readonly redirectUri: string = 'http://localhost:4200/callback/';
  private readonly scopes: string[] = [
    'ugc-image-upload',
    'user-read-recently-played',
    'user-top-read',
    'user-read-playback-position',
    'user-read-playback-state',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'app-remote-control',
    'streaming',
    'playlist-modify-public',
    'playlist-modify-private',
    'playlist-read-private',
    'playlist-read-collaborative',
    'user-follow-modify',
    'user-follow-read',
    'user-library-modify',
    'user-library-read',
    'user-read-email',
    'user-read-private'
  ];

  private _refreshToken: string;
  private _accessToken: string;

  get accessToken(): string {
    if (this._accessToken != null) {
      return this._accessToken;
    } else {

      return localStorage.getItem('accessToken') as string;
    }
  }

  set accessToken(value: string) {
    localStorage.setItem('accessToken', value);
    this._accessToken = value;
  }

  set refreshToken(value: string) {
    localStorage.setItem('refreshToken', value);
    this._refreshToken = value;
  }

  get refreshToken(): string {
    if (this._refreshToken != null) {
      return this._refreshToken;
    } else {
      return localStorage.getItem('refreshToken') as string;
    }
  }

  constructor(private http: HttpClient,
              private router: Router) {
    this.initializeTokenRefresher();
  }

  spotifyAuth(): void {
    const scopes = this.scopes.join('%20');
    const redirectUri = this.redirectUri.replace('/', '%2F').replace(':', '%3A');
    const url = 'https://accounts.spotify.com/authorize?client_id=' + this.clientId + '&response_type=code&redirect_uri='
      + redirectUri + '&scope=' + scopes;
    window.open(url, '_self');
  }

  spotifyRefreshToken(): Observable<TokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const isRefreshTokenPresent = this.refreshToken !== '' && this.refreshToken != null;
    const payload = new HttpParams()
      .append('redirect_uri', this.redirectUri)
      .append('client_id', this.clientId)
      .append('client_secret', this.clientSecret)
      .append('grant_type',
        isRefreshTokenPresent ? 'refresh_token' : 'authorization_code')
      .append(isRefreshTokenPresent ? 'refresh_token' : 'code',
        isRefreshTokenPresent ? this.refreshToken : this.accessToken);

    const options = {headers};
    const url = 'https://accounts.spotify.com/api/token';

    return this.http.post<TokenResponse>(url, payload.toString(), options);
  }

  getPlaylists(): Observable<any> {
    const url = 'https://api.spotify.com/v1/me/playlists';
    const options = this.getHeader();

    return this.http.get(url, options);
  }

  getTracks(playlistId: string): Observable<any> {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const options = this.getHeader();

    return this.http.get(url, options);
  }

  logout(): void {
    this.accessToken = '';
    this.refreshToken = '';
    this.router.navigate(['./']);
  }

  private initializeTokenRefresher(): void {
    setInterval(() => {
      this.spotifyRefreshToken().subscribe((data: TokenResponse) => {
        this.refreshToken = data.refresh_token;
        this.accessToken = data.access_token;
      });
    }, 1000 * 3000);
  }

  private getHeader(): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`
    });
    return {headers};
  }

}
