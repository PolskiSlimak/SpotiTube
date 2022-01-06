import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ItemTrack } from 'src/app/core/models/item-track.interface';
import { PlaylistInfo } from 'src/app/core/models/playlist-info.interface';
import { TrackInfo } from 'src/app/core/models/track-info.interface';
import { DetailsYoutubeService } from 'src/app/core/services/details-youtube.service';
import { DetailsService } from 'src/app/core/services/details.service';
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

  constructor(private youtubeService: YoutubeService,
              private spotifyService: SpotifyService,
              public detailsService: DetailsService,
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
    })
  }

  onAdd(selectedTrack: TrackInfo): void {
    if (this.itemTrack.isYoutubeResource) {
      let callbackYoutube = (trackInfo: TrackInfo, data: any): void => {
        trackInfo.items = this.detailsYoutubeService.convertItemTrack(data.items);
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
        this.detailsService.tracksInfo = this.tracksInfo;
      };
      this.youtubeService.addTrackToPlaylist(selectedTrack.playlistId, this.itemTrack.track.id).subscribe(() => {
        this.refreshTracksInfo(selectedTrack, true, callbackYoutube);
      });
    } else {
      let callbackSpotify = (trackInfo: TrackInfo, data: any): void => {
        trackInfo.items = data.items;
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
        this.detailsService.tracksInfo = this.tracksInfo;
      };
      this.spotifyService.addTrackToPlaylist(selectedTrack.playlistId, this.itemTrack.track.uri).subscribe(() => {
        this.refreshTracksInfo(selectedTrack, false, callbackSpotify);
      });
    }
  }

  onRemove(event: any): void {
    let removedTrackInfo: TrackInfo = event.value;
    let trackUri = this.reciveTrackUri(removedTrackInfo);
    if (this.itemTrack.isYoutubeResource) {
      this.processDeleteTrackInfoAndList(true, removedTrackInfo, trackUri);
    } else {
      this.processDeleteTrackInfoAndList(false, removedTrackInfo, trackUri);
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
