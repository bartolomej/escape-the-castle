import { Handler } from '@netlify/functions'
import fetch from "node-fetch";

export const handler: Handler = async (event, context) => {
  const { artistId } = event.queryStringParameters

  const artist = await fetchArtist(artistId);

  return {
    statusCode: 200,
    body: JSON.stringify(artist),
  }
}

async function fetchArtist (id: number | string) {
  const url = `https://api.deezer.com/artist/${id}`;
  const artist = await get(url);
  const trackListUrl = artist.tracklist;
  const trackList = await get(trackListUrl);
  return {
    ...artist,
    trackList: trackList.data
  }
}

async function get (url: string): Promise<any> {
  return fetch(url).then(res => res.json());
}
