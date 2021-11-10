import { AlbumInfo } from "./album-info.interface";
import { ArtistsInfo } from "./artists-info.interface";

export class TrackData {
  id: string;
  uri: string;
  name: string;
  artists: ArtistsInfo[];
  album:  AlbumInfo;
}
