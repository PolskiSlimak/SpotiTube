import { Component, OnInit } from '@angular/core';
import { DetailsService } from '../core/services/details.service';
import { SpotifyService } from '../core/services/spotify.service';

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

  constructor(private spotifyService: SpotifyService,
              private detailsService: DetailsService) { }

  ngOnInit(): void {
    this.onProfileLoad();
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

  putTracks(items: any): any {
    this.detailsService.trackList.length = 0;
    items.forEach((item: any) => {
      this.detailsService.trackList.push({track: item})
    });
  }

  setAllPlaylistsActive(): void {
    this.clearHtmlSelected();
    this.detailsService.tracksInfo.length = 0;
    let playlists = this.detailsService.playlistInfo;
    playlists.forEach((element: any) => {
      this.detailsService.setTracksInfo(element);
    });
  }

  clearHtmlSelected(): void {
    let childrens = document.getElementById("playlistsHtml")!.children;
    for (let children of childrens) {
      children.className = children.className.replace("clicked-btn", "hover-btn");
    }
  }
}
