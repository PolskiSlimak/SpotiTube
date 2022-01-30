import { Component, Input, OnInit, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogChooseTrackComponent } from 'src/app/core/dialogs/dialog-choose-track/dialog-choose-track.component';
import { ItemTrack } from 'src/app/core/models/item-track.interface';
import { TrackInfo } from 'src/app/core/models/track-info.interface';
import { DetailsYoutubeService } from 'src/app/core/services/details-youtube.service';
import { DetailsService } from 'src/app/core/services/details.service';
import { SortService } from 'src/app/core/services/sort.service';
import { SpotifyService } from 'src/app/core/services/spotify.service';
import { YoutubeService } from 'src/app/core/services/youtube.service';

@Component({
  selector: 'app-playlist-result-page',
  templateUrl: './playlist-result-page.component.html',
  styleUrls: ['./playlist-result-page.component.scss']
})
export class PlaylistResultPageComponent implements OnInit {
  @Input() trackList: ItemTrack[];
  @Output() trackListChange = new EventEmitter<ItemTrack[]>();
  @Input() activeTrackList: any;
  @Output() activeTrackListChange = new EventEmitter<any>();

  @Input() itemTrack: ItemTrack;
  selectedTracksInfo: TrackInfo[] = [];
  tracksInfo: TrackInfo[];
  @ViewChild (NgSelectComponent) ngSelectComponent: NgSelectComponent;
  isClearedItem: boolean;
  innerWidth: number;

  constructor(private youtubeService: YoutubeService,
              private spotifyService: SpotifyService,
              public detailsService: DetailsService,
              public dialog: MatDialog,
              private sortService: SortService,
              private detailsYoutubeService: DetailsYoutubeService) { }

  ngOnInit(): void {
    this.detailsService.refreshTracksInfo$.subscribe((tracksInfo : TrackInfo[]) => {
      this.tracksInfo = tracksInfo;
      this.tracksInfo = [...this.tracksInfo];
      this.selectedTracksInfo = [];
      for (let trackInfo of this.tracksInfo) {
        if (this.checkIfExistInPlaylist(this.itemTrack, trackInfo)) {
          this.selectedTracksInfo = [...this.selectedTracksInfo, trackInfo];
        }
      }
    });
    this.resizeListener();
  }

  @HostListener('window:resize', ['$event'])
  resizeListener() {
    this.innerWidth = window.innerWidth;
  }

  onAdd(selectedTrack: TrackInfo): void {
    let isSpotifyPlaylist = this.detailsService.isSpotifyPlaylist(selectedTrack);
    let trackSpotify: any;
    let trackYoutube: any;
    let callbackYoutube = (trackInfo: TrackInfo, data: any): void => {
      let isAddedNewSongToPlaylist = trackInfo.items.length !== data.items.length;
      trackInfo.items = this.detailsYoutubeService.convertItemTrack(data.items);
      let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
        return trackInfoAdded.playlistId === trackInfo.playlistId;
      });
      this.tracksInfo[indexOfTrackInfo] = trackInfo;
      this.detailsService.tracksInfo = this.tracksInfo;
      if (isAddedNewSongToPlaylist && trackYoutube !== undefined) {
        this.addNewTrackToListYoutube(trackInfo, trackYoutube);
      }
    };
    let callbackSpotify = (trackInfo: TrackInfo, data: any): void => {
      let isAddedNewSongToPlaylist = trackInfo.items.length !== data.items.length;
      trackInfo.items = data.items;
      let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
        return trackInfoAdded.playlistId === trackInfo.playlistId;
      });
      this.tracksInfo[indexOfTrackInfo] = trackInfo;
      this.detailsService.tracksInfo = this.tracksInfo;
      if (isAddedNewSongToPlaylist && trackSpotify !== undefined) {
        this.addNewTrackToList(trackInfo, trackSpotify);
      }
    };
    if (this.itemTrack.isYoutubeResource && !isSpotifyPlaylist) {
      this.youtubeService.addTrackToPlaylist(selectedTrack.playlistId, this.itemTrack.track.id).subscribe(() => {
        this.refreshTracksInfo(selectedTrack, true, callbackYoutube);
      });
    } else if (!this.itemTrack.isYoutubeResource && isSpotifyPlaylist) {
      this.spotifyService.addTrackToPlaylist(selectedTrack.playlistId, this.itemTrack.track.uri).subscribe(() => {
        this.refreshTracksInfo(selectedTrack, false, callbackSpotify);
      });
    } else if (this.itemTrack.isYoutubeResource && isSpotifyPlaylist) {
      let formattedPhrase = this.getFormattedValueForSearch().toLowerCase();
      this.spotifyService.searchForPhrase(formattedPhrase, "track").subscribe((data: any) => {
        let trackNameConverted = this.formatTrackNameForFit(this.itemTrack.track.name).toLowerCase();
        let foundIndex = data["tracks"].items.findIndex((item:any) => {
          return item.name.toLowerCase().includes(trackNameConverted);
        });
        trackSpotify = foundIndex !== -1 ? data["tracks"].items[foundIndex] : data["tracks"].items[0];
        const dialogRef = this.dialog.open(DialogChooseTrackComponent, {
          width: '40rem',
          disableClose: true,
          data: {
            track: trackSpotify,
            playlistName: selectedTrack.playlistName
          }
        });
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed === true) {
            this.spotifyService.addTrackToPlaylist(selectedTrack.playlistId, trackSpotify.uri).subscribe(() => {
              this.refreshTracksInfo(selectedTrack, false, callbackSpotify);
            });
          }
        });
      });
      this.clearJustAddedTrack(selectedTrack);
    } else if (!this.itemTrack.isYoutubeResource && !isSpotifyPlaylist) {
      let formattedPhrase = this.getFormattedValueForSearch();
      this.youtubeService.searchForPhrase(formattedPhrase).subscribe((data: any) => {
        trackYoutube = this.detailsYoutubeService.convertItemTrackFromSearched(data.items[0]).track;
        const dialogRef = this.dialog.open(DialogChooseTrackComponent, {
          width: '40rem',
          disableClose: true,
          data: {
            track: trackYoutube,
            playlistName: selectedTrack.playlistName
          }
        });
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed === true) {
            this.youtubeService.addTrackToPlaylist(selectedTrack.playlistId, trackYoutube.id).subscribe(() => {
              this.refreshTracksInfo(selectedTrack, true, callbackYoutube);
            });
          }
        });
      });
      this.clearJustAddedTrack(selectedTrack);
    }
  }

  getFormattedValueForSearch(): string {
    let phraseValue: any = this.itemTrack.track.artists[0].name.trim() + " " + this.itemTrack.track.name.trim();
    let phraseValueWithoutBrackets = phraseValue.replaceAll(/\(.*?\)/g, "").replaceAll(/\[.*?\]/g, "");
    return phraseValueWithoutBrackets.trim().replaceAll(/[^A-Za-z0-9\s]/g, "");
  }

  formatTrackNameForFit(name: any): string {
    let phraseValueWithoutBrackets = name.replaceAll(/\(.*?\)/g, "").replaceAll(/\[.*?\]/g, "");
    return phraseValueWithoutBrackets.trim().replaceAll(/[^A-Za-z0-9\s]/g, "");
  }

  addNewTrackToList(selectedTrack: TrackInfo, trackSpotify: any): void {
    let newItemTrack = selectedTrack.items.find((itemTrack: ItemTrack) => {
      return trackSpotify.uri === itemTrack.track.uri;
    });
    this.refreshTrackList(newItemTrack);
  }

  addNewTrackToListYoutube(selectedTrack: TrackInfo, trackYoutube: any): void {
    let newItemTrack = selectedTrack.items.find((itemTrack: ItemTrack) => {
      return trackYoutube.id === itemTrack.track.id;
    });
    this.refreshTrackList(newItemTrack);
  }

  clearJustAddedTrack(selectedTrack: TrackInfo): void {
    this.isClearedItem = true;
    this.ngSelectComponent.clearItem(selectedTrack);
    this.ngSelectComponent.close();
  }

  onRemove(event: any): void {
    if (!this.isClearedItem) {
      let removedTrackInfo: TrackInfo = event.value;
      let trackUri = this.reciveTrackUri(removedTrackInfo);
      if (this.itemTrack.isYoutubeResource) {
        this.processDeleteTrackInfoAndList(true, removedTrackInfo, trackUri);
      } else {
        this.processDeleteTrackInfoAndList(false, removedTrackInfo, trackUri);
      }
    } else {
      this.isClearedItem = true;
    }
  }

  onClear(): void {
    for (let removedTrackInfo of this.tracksInfo) {
      let trackUri = this.reciveTrackUri(removedTrackInfo);
      if (this.itemTrack.isYoutubeResource) {
        this.processDeleteTrackInfoAndList(true, removedTrackInfo, trackUri);
      } else {
        this.processDeleteTrackInfoAndList(false, removedTrackInfo, trackUri);
      }
    }
  }

  reciveTrackUri(trackInfoToFetchUri: TrackInfo): string {
    for (let itemTrack of trackInfoToFetchUri.items) {
      let track = itemTrack.track
      if (track.id === this.itemTrack.track.id) {
        return track.uri;
      }
    }
    return "";
  }

  processDeleteTrackInfoAndList(isYoutube: boolean, removedTrackInfo: TrackInfo, trackUri: string): void {
    if (isYoutube) {
      let callbackYoutube = (trackInfo: TrackInfo, data: any): void => {
        trackInfo.items = this.detailsYoutubeService.convertItemTrack(data.items);
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
        this.detailsService.tracksInfo = this.tracksInfo;
        if (!this.checkIfExistInMorePlaylists(this.itemTrack) && !this.detailsService.isSearchPhrase) {
          this.refreshTrackList(this.itemTrack);
        }
      };
      this.youtubeService.deleteTrackFromPlaylist(trackUri).subscribe(() => {
        this.refreshTracksInfo(removedTrackInfo, true, callbackYoutube);
      });
    } else {
      let callbackSpotify = (trackInfo: TrackInfo, data: any): void => {
        trackInfo.items = data.items;
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
        this.detailsService.tracksInfo = this.tracksInfo;
        if (!this.checkIfExistInMorePlaylists(this.itemTrack) && !this.detailsService.isSearchPhrase) {
          this.refreshTrackList(this.itemTrack);
        }
      };
      this.spotifyService.deleteTrackFromPlaylist(removedTrackInfo.playlistId, {uri:trackUri}).subscribe(() => {
        this.refreshTracksInfo(removedTrackInfo, false, callbackSpotify);
      });
    }
  }

  refreshTracksInfo(trackInfo: TrackInfo, isYoutube: boolean, callback: (trackInfo: TrackInfo, data: any) => void): void {
    if (isYoutube) {
      this.youtubeService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
        callback(trackInfo, data)
      });
    } else {
      this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
        callback(trackInfo, data);
      });
    }
  }

  refreshTrackList(track: ItemTrack): void {
    let index = this.trackList.findIndex((alreadyAddedTrack: ItemTrack) => {
      return alreadyAddedTrack.track.id === track.track.id;
    });
    if (index != -1) {
      this.trackList.splice(index, 1);
      this.trackListChange.emit(this.trackList);
    } else {
      this.trackList.push(track);
      this.sortService.chooseSortingTypeForSongs(this.trackList);
      this.trackListChange.emit(this.trackList);
    }
    let indexOFActive = this.activeTrackList.findIndex((alreadyAddedTrack: ItemTrack) => {
      return alreadyAddedTrack.track.id === track.track.id;
    });
    if (indexOFActive != -1) {
      this.activeTrackList.splice(indexOFActive, 1);
      if (this.trackList.length >= this.detailsService.pageSize) {
        this.activeTrackList.push(this.trackList[this.detailsService.pageSize - 1]);
      }
      this.activeTrackListChange.emit(this.activeTrackList);
    }
    this.detailsService.trackList = this.trackList;
    this.detailsService.refreshTrackList$.next(this.trackList);
  }

  checkIfExistInPlaylist(item: ItemTrack, trackInfo: TrackInfo): boolean {
    let exists = false;
    exists = trackInfo.items.some((song: ItemTrack) => {
      return song.track.id === item.track.id;
    });
    return exists;
  }

  checkIfExistInMorePlaylists(track: ItemTrack): boolean {
    let records: ItemTrack[] = [];
    let elements = 0;
    this.tracksInfo.forEach((info: TrackInfo) => {
      records = info.items.filter((alreadyAddedTrack: ItemTrack) => {
        return alreadyAddedTrack.track.id === track.track.id;
      });
      elements = elements + records.length;
    });
    return elements > 0;
  }
}
