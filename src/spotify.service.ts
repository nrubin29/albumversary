import request = require('request');
import {CoreOptions} from "request";
import {UserDao} from "./user.dao";
import environment from './environment';

export class SpotifyService {
  static instance = new SpotifyService();

  async getUserAlbums(username: string): Promise<Album[]> {
    const user = await UserDao.getUser(username);

    if (!user) {
      throw new Error('Invalid user.');
    }

    const res = await this.requestPromise('https://accounts.spotify.com/api/token', {
      form: {grant_type: 'refresh_token', refresh_token: user.spotifyRefreshToken},
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(environment.clientId + ':' + environment.clientSecret).toString('base64')
      }
    });

    const accessToken = res.access_token;

    let albumNames = new Set<string>();
    let albums = [];
    let url = `https://api.spotify.com/v1/me/tracks?limit=50`;

    while (url) {
      const res = await this.requestPromise(url, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      });

      const albs: Album[] = res.items.map(item => item.track.album).filter(album => album.release_date_precision === 'day');

      for (let alb of albs) {
        if (!albumNames.has(alb.name)) {
          albums.push(alb);
          albumNames.add(alb.name);
        }
      }

      // albums.push(...res.items.map(item => item.track.album).filter(album => album.release_date_precision === 'day'));
      url = res.next;
    }

    return albums;
  }

  // async getUserAlbums(username: string): Promise<Album[]> {
  //   let albums = [];
  //   let url = `https://api.spotify.com/v1/me/albums?limit=50`;
  //
  //   while (url) {
  //     const res = await this.requestPromise(url, {
  //       headers: {
  //         Authorization: 'Bearer ' + this.users[username]
  //       }
  //     });
  //
  //     albums.push(...res.items.map(item => item.album).filter(album => album.release_date_precision === 'day'));
  //     url = res.next;
  //   }
  //
  //   return albums;
  // }

  private requestPromise(uri: string, options: CoreOptions): Promise<any> {
    return new Promise<Album[]>((resolve, reject) => {
      request(uri, options, (err, sRes, body) => {
        if (err) {
          reject(err);
        }

        else {
          resolve(JSON.parse(body));
        }
      });
    });
  }

  handleCallback(host: string, code: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      request('https://accounts.spotify.com/api/token', {
        form: {grant_type: 'authorization_code', code, redirect_uri: host + '/callback'},
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(environment.clientId + ':' + environment.clientSecret).toString('base64')
        }
      }, (err, sRes, body) => {
        const {access_token, refresh_token} = JSON.parse(body);

        request('https://api.spotify.com/v1/me', {
          headers: {
            Authorization: 'Bearer ' + access_token
          }
        }, (err, sRes, body) => {
          const userId = JSON.parse(body).id;

          UserDao.addUser(userId, refresh_token).then(() => {
            resolve(userId);
          }).catch(e => reject(e));
        });
      });
    })
  }
}
