import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ItemTrack } from 'src/app/core/models/item-track.interface';
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
      if (this.selectedTracksInfo.length > this.tracksInfo.length) {
        this.selectedTracksInfo = [];
      }
      for (let trackInfo of this.tracksInfo) {
        if (this.checkIfExistInPlaylist(this.itemTrack, trackInfo) && !this.isInSelectedTracks(trackInfo)) {
          this.selectedTracksInfo = [...this.selectedTracksInfo, trackInfo];
        }
      }
    })
  }

  isInSelectedTracks(trackInfo: TrackInfo): boolean {
    return this.selectedTracksInfo.some((trackInfo1: TrackInfo) => {
      return trackInfo1.playlistId === trackInfo.playlistId;
    })
  }

  onAdd(selectedTrack: TrackInfo): void {
    let trackUri = this.itemTrack.track.uri;
    if (this.itemTrack.isYoutubeResource) {
      this.youtubeService.addTrackToPlaylist(selectedTrack.playlistId, this.itemTrack.track.id).subscribe(() => {
        this.refreshTracksInfo(selectedTrack, true);
      });
    } else {
      this.spotifyService.addTrackToPlaylist(selectedTrack.playlistId, trackUri).subscribe(() => {
        this.refreshTracksInfo(selectedTrack, false);
      });
    }
  }

  onRemove(event: any): void {
    let removedTrackInfo: TrackInfo = event.value;
    let trackUri = this.itemTrack.track.uri;
    if (this.itemTrack.isYoutubeResource) {
      this.youtubeService.deleteTrackFromPlaylist(trackUri).subscribe(() => {
        this.refreshTracks(removedTrackInfo, true);
      });
    } else {
      this.spotifyService.deleteTrackFromPlaylist(removedTrackInfo.playlistId, {uri:trackUri}).subscribe(() => {
        this.refreshTracks(removedTrackInfo, false);
      });
    }
  }

  refreshTracks(removedTrackInfo: TrackInfo, isYoutube: boolean): void {
    this.refreshTracksInfo(removedTrackInfo, isYoutube);
    if (!this.checkIfExistInMorePlaylists(this.itemTrack)) {
      this.refreshTrackList(this.itemTrack);
    }
  }

  refreshTracksInfo(trackInfo: TrackInfo, isYoutube: boolean): void {
    if (isYoutube) {
      this.youtubeService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
        trackInfo.items = this.detailsYoutubeService.convertItemTrack(data.items);
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
        this.detailsService.tracksInfo = this.tracksInfo;
      });
    } else {
      this.spotifyService.getTracks(trackInfo.playlistId).subscribe((data: any) => {
        trackInfo.items = data.items;
        let indexOfTrackInfo = this.tracksInfo.findIndex((trackInfoAdded: TrackInfo) => {
          return trackInfoAdded.playlistId === trackInfo.playlistId;
        });
        this.tracksInfo[indexOfTrackInfo] = trackInfo;
        this.detailsService.tracksInfo = this.tracksInfo;
      });
    }
  }

  refreshTrackList(track: ItemTrack): void {
    let index = this.trackList.findIndex((alreadyAddedTrack: ItemTrack) => {
      return alreadyAddedTrack.track.id === track.track.id;
    });
    this.trackList.splice(index, 1);
    this.trackListChange.emit(this.trackList);
    let indexOFActive = this.activeTrackList.findIndex((alreadyAddedTrack: ItemTrack) => {
      return alreadyAddedTrack.track.id === track.track.id;
    });
    this.activeTrackList.splice(indexOFActive, 1);
    if (this.trackList.length >= this.detailsService.pageSize) {
      this.activeTrackList.push(this.trackList[this.detailsService.pageSize - 1]);
    }
    this.activeTrackListChange.emit(this.activeTrackList);
  }

  checkIfExistInPlaylist(item: ItemTrack, trackInfo: TrackInfo): boolean {
    let exists = false;
    exists = trackInfo.items.some((song: ItemTrack) => {
      return song.track.id === item.track.id;
    });
    return exists;
  }

  checkIfExistInMorePlaylists(track: ItemTrack): boolean {
    let records = [];
    let elements = 0;
    this.tracksInfo.forEach((info: TrackInfo) => {
      records = info.items.filter((alreadyAddedTrack: ItemTrack) => {
        return alreadyAddedTrack.track.id === track.track.id;
      });
      elements = elements + records.length;
    });
    return elements > 1;
  }
}
