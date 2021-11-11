import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenResponse } from '../models/token-response.interface';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  private readonly redirectUri: string = 'http://localhost:4200/callback-youtube/';
  private readonly scopes: string[] = [
    'readonly'
  ];
  private readonly clientId: string = "23424263580-df273m69ddu6f0a602vc6l5rceb9tpcv.apps.googleusercontent.com";
  private readonly clientSecret: string = "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";
  private readonly apiKey: string = environment.apiKey;
  private _refreshToken: string;
  private _accessToken: string;

  constructor(private http: HttpClient,
              private router: Router) {

  }

  get accessToken(): string {
    if (this._accessToken != null) {
      return this._accessToken;
    } else {
      return localStorage.getItem('accessTokenYt') as string;
    }
  }

  set accessToken(value: string) {
    localStorage.setItem('accessTokenYt', value);
    this._accessToken = value;
  }

  set refreshToken(value: string) {
    localStorage.setItem('refreshTokenYt', value);
    this._refreshToken = value;
  }

  get refreshToken(): string {
    if (this._refreshToken != null) {
      return this._refreshToken;
    } else {
      return localStorage.getItem('refreshTokenYt') as string;
    }
  }

  youtubeAuth(): void {
    const scopes = this.scopes.join('%20');
    const redirectUri = this.redirectUri.replace('/', '%2F').replace(':', '%3A');
    const url = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=' + this.clientId + '&response_type=code&redirect_uri='
      + redirectUri + '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube' + '&state=state_parameter_passthrough_value' +'&access_type=offline';
    window.open(url, '_self');
  }

  youtubeRefreshToken(): Observable<TokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    // const isRefreshTokenPresent = this.refreshToken !== '' && this.refreshToken != null;
    const payload = new HttpParams()
      .append('redirect_uri', this.redirectUri)
      .append('client_id', this.clientId)
      .append('client_secret', this.clientSecret)
      .append('grant_type', 'authorization_code')
      .append('code', this.accessToken);
    const options = { headers };
    const url = 'https://oauth2.googleapis.com/token';
    // https://accounts.google.com/o/oauth2/token
    return this.http.post<TokenResponse>(url, payload.toString(), options);
  }

  logout(): void {
    this.accessToken = '';
    this.refreshToken = '';
    window.location.reload();
  }

  getPlaylists(): Observable<any> {
    const url = "https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50";
    return this.http.get(url, this.getHeader());
  }

  getTracks(playlistId: string): Observable<any> {
    const url = "https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" + playlistId;
    return this.http.get(url, this.getHeader());
  }

  createPlaylist(playlistName: string, description: string, isPublic: boolean): Observable<any> {
    const url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&key=" + this.apiKey;
    let isPublicString = String(isPublic);
    let body = {
      snippet: {
        title: playlistName,
        description: description
      },
      // status: {
      //   privacyStatus: isPublicString
      // }
    };
    return this.http.post(url, body, this.getHeader());
  }

  deletePlaylist(playlistIdn: string): Observable<any> {
    const url = "https://www.googleapis.com/youtube/v3/playlists?id=" + playlistIdn + "&key=" + this.apiKey;
    return this.http.delete(url, this.getHeader());
  }

  searchForPhrase(phrase: string): Observable<any> {
    const url = "https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&order=viewCount&type=video&q=" + phrase;
    return this.http.get(url, this.getHeader());
  }

  private getHeader(): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`
    });
    return {headers};
  }
}
