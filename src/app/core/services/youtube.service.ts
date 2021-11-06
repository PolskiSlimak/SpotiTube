import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenResponse } from '../models/token-response.interface';
import { Router } from '@angular/router';
import { PlaylistInfoYoutube } from '../models/playlist-info-youtube.interface';
@Injectable({
  providedIn: 'root'
})
export class YoutubeService {
  private readonly redirectUri: string = 'http://localhost:4200/callback-youtube/';
  private readonly scopes: string[] = [
    'readonly'
  ];
  private readonly apiKey: string = "AIzaSyDmvsT337KNBOFjuuveYkbfVIE3MLuq6IM";
  private readonly clientId: string = "23424263580-df273m69ddu6f0a602vc6l5rceb9tpcv.apps.googleusercontent.com";
  private readonly clientSecret: string = "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";
  private _refreshToken: string;
  private _accessToken: string;

  isLogged: boolean;
  playlistInfoYoutube: PlaylistInfoYoutube[] = [];
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
      + redirectUri + '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.' + scopes + '&state=state_parameter_passthrough_value' +'&access_type=offline';
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

  onPlaylistLoadYoutube(): void {
    this.getPlaylists().subscribe((data: any) => {
      data.items.forEach((element:any) => {
        let item = new PlaylistInfoYoutube();
        item.id = element.id;
        item.etag = element.id;
        item.kind = element.kind;
        item.title = element.snippet.title;
        this.playlistInfoYoutube.push(item);
      });
    });
  }

  getPlaylists(): Observable<any> {
    const url = "https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50";
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
