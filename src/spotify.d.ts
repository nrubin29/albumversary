interface SimpleArtist {
  name: string;
}

interface Album {
  id: string;
  uri: string;
  name: string;
  release_date: string;
  release_date_precision: string;
  artists: SimpleArtist[];
}
