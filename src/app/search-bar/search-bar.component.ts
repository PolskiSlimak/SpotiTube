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
  optionsForFrom = [
    { name: 'track' },
    { name: 'artist' },
    { name: 'album' }
  ];
  selectedOption: string = this.optionsForFrom[0].name;
  showProfile = false;

  constructor(private spotifyService: SpotifyService,
              private detailsService: DetailsService) { }

  ngOnInit(): void {
  }

  onSearchForPhrase(): void {
    let formattedPhrase = this.phraseValue.replace(" ", "+");
    this.spotifyService.searchForPhrase(formattedPhrase, this.selectedOption).subscribe((data: any) => {
      let searchedType = this.selectedOption + "s";
      this.detailsService.itemsFound = data[searchedType].items;
      this.phraseValue = "";
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
}
