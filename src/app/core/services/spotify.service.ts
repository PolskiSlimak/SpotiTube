import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {TokenResponse} from '../models/token-response.interface';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import { YoutubeService } from './youtube.service';

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
              private router: Router,
              private youtubeService: YoutubeService) {
    this.initializeTokenRefresher();
  }

  spotifyAuth(): void {
    const scopes = this.scopes.join('%20');
    const redirectUri = this.redirectUri.replace('/', '%2F').replace(':', '%3A');
    const url = 'https://accounts.spotify.com/authorize?client_id=' + this.clientId + '&response_type=code&redirect_uri='
      + redirectUri + '&scope=' + scopes;
      // + '&show_dialog=true';
    window.open(url, '_self');
  }

  refreshTokens(): void {
    this.spotifyRefreshToken().subscribe((data: TokenResponse) => {
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }
      if (data.access_token) {
        this.accessToken = data.access_token;
      }
    });
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
    return this.http.get(url, this.getHeader());
  }

  getTracks(playlistId: string): Observable<any> {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    return this.http.get(url, this.getHeader());
  }

  addTrackToPlaylist(playlistId: string, trackUris: any): Observable<any> {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    let body = {
      uris: [trackUris]
    };
    return this.http.post(url, body, this.getHeader());
  }

  deleteTrackFromPlaylist(playlistId: string, trackUris: any): Observable<any> {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    let options = this.getHeader();
    options.body = {
      tracks: [trackUris]
    }
    return this.http.delete(url, options);
  }

  searchForPhrase(phrase: string, type: string): Observable<any> {
    const url = "https://api.spotify.com/v1/search?q=" + phrase + "&type=" + type;
    return this.http.get(url, this.getHeader());
  }

  createPlaylist(userIdn: string, playlistName: string, description: string, isPublic: boolean): Observable<any> {
    const url = "https://api.spotify.com/v1/users/" + userIdn + "/playlists";
    let body = {
      name: playlistName,
      description: description,
      public: isPublic
    };
    return this.http.post(url, body, this.getHeader());
  }

  deletePlaylist(playlistIdn: string): Observable<any> {
    const url = "https://api.spotify.com/v1/playlists/" + playlistIdn + "/followers";
    return this.http.delete(url, this.getHeader());
  }

  modifyPlaylistInfo(playlistIdn: string, playlistName: string, description: string, isPublic: boolean): Observable<any> {
    const url = "https://api.spotify.com/v1/playlists/" + playlistIdn;
    let body = {
      name: playlistName,
      description: description,
      public: isPublic
    };
    return this.http.put(url, body, this.getHeader());
  }

  logout(): void {
    this.accessToken = '';
    this.refreshToken = '';
    localStorage.setItem('playlists', "");
    this.router.navigate(['./']);
  }

  getUserData(): Observable<any> {
    const url = "https://api.spotify.com/v1/me";
    return this.http.get(url, this.getHeader());
  }

  private initializeTokenRefresher(): void {
    setInterval(() => {
      this.refreshTokens();
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
