import { Component, OnInit } from '@angular/core';
import { PlaylistInfo } from '../core/models/playlist-info.interface';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';
import { YoutubeService } from '../core/services/youtube.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {
  phraseValue: any;
  // optionsForFrom = [
  //   { name: 'track' },
  //   { name: 'album' }
  // ];
  // selectedOption: string = this.optionsForFrom[0].name;
  showProfile = false;
  pictureUrl = "https://i1.wp.com/similarpng.com/wp-content/plugins/userswp/assets/images/no_profile.png?ssl=1";
  isLoggedToYoutube: boolean;

  constructor(private spotifyService: SpotifyService,
              private detailsService: DetailsService,
              private youTubeService: YoutubeService) { }

  ngOnInit(): void {
    this.onProfileLoad();
    let isLogged = sessionStorage.getItem("isLoggedToYoutube");
    this.isLoggedToYoutube = isLogged !== null && isLogged !== '' ? JSON.parse(isLogged) : false;
  }

  onLoginToYoutube(): void {
    this.youTubeService.youtubeAuth();
  }

  onSearchForPhrase(): void {
    let formattedPhrase = this.phraseValue.replace(" ", "+");
    this.spotifyService.searchForPhrase(formattedPhrase, "track").subscribe((data: any) => {
      // let searchedType = "track" + "s";
      this.phraseValue = "";
      this.putTracks(data["tracks"].items);
      this.detailsService.isSearchPhrase = true;
      this.setAllPlaylistsActive();
    });
  }

  onProfileLoad(): void {
    this.spotifyService.getUserData().subscribe((data: any) => {
      this.detailsService.userIdn = data.id;
      let images = data.images;
      if (images.length > 0) {
        this.pictureUrl = images[0].url;
      }
    });
  }

  onShowProfile(): void {
    this.showProfile = !this.showProfile;
  }

  onGetShowProfile(): boolean {
    return this.showProfile;
  }

  onLogout(): void {
    this.spotifyService.logout();
  }

  onLogoutFromYoutube(): void {
    this.isLoggedToYoutube = false;
    sessionStorage.setItem("isLoggedToYoutube", "false");
    this.youTubeService.logout();
  }

  putTracks(items: any): any {
    this.detailsService.trackList.length = 0;
    this.detailsService.activeTrackList.length = 0;
    items.forEach((item: any) => {
      this.detailsService.trackList.push({track: item})
      if (this.detailsService.activeTrackList.length < this.detailsService.pageSize) {
        this.detailsService.activeTrackList.push({track: item})
      }
    });
  }

  setAllPlaylistsActive(): void {
    this.clearHtmlSelected();
    this.clearTracksInfo();
    let playlists = this.detailsService.playlistInfo;
    playlists.forEach((element: PlaylistInfo) => {
      this.detailsService.setTracksInfo(element);
    });
  }

  clearHtmlSelected(): void {
    let childrens = this.detailsService.getPlaylistsDOM();
    for (let children of childrens) {
      children.childNodes[0].className = children.childNodes[0].className.replace("clicked-btn", "hover-btn");
    }
  }

  clearTracksInfo(): void {
    this.detailsService.tracksInfo.length = 0;
    this.detailsService.updateLocalStorage();
  }
}
