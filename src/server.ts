import path = require('path');
import express = require('express');
import mongoose = require('mongoose');
import mustacheExpress = require('mustache-express');

import {SpotifyService} from "./spotify.service";

const app = express();

app.enable('trust proxy');

app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');

app.use(express.static(path.join('.', 'img')));

// TODO: Clean up this file.

function albumToCalendar(album: Album) {
  // const date = '2019' + album.release_date.substring(4).replace(/-/g, '');
  const day = album.release_date.split('-')[2];

  return `BEGIN:VEVENT
CREATED:${album.release_date.replace(/-/g, '')}
UID:${album.id}
RRULE:FREQ=YEARLY;BYMONTHDAY=${day}
DTEND;VALUE=DATE:${album.release_date.replace(/-/g, '')}
TRANSP:OPAQUE
SUMMARY:${album.name}
LAST-MODIFIED:${album.release_date.replace(/-/g, '')}
DTSTAMP:${album.release_date.replace(/-/g, '')}
DTSTART;VALUE=DATE:${album.release_date.replace(/-/g, '')}
SEQUENCE:0
END:VEVENT
`
}

app.get('/cal/:username', (req, res) => {
  console.log(req.params.username);

  SpotifyService.instance.getUserAlbums(req.params.username).then(albums => {
    console.log(albums.length);

    let output = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Albumversary//Albumversary//EN
X-WR-CALNAME:Albumversary
CALSCALE:GREGORIAN
`;

    for (let album of albums) {
      output += albumToCalendar(album);
    }

    output += 'END:VCALENDAR';

    res.setHeader("Content-Type", "text/calendar");
    res.send(output);
    console.log('sent');
  }).catch(e => res.sendStatus(500));
});

app.get('/callback', (req, res) => {
  if ('code' in req.query) {
    SpotifyService.instance.handleCallback(req.protocol + '://' + req.get('Host'), req.query.code).then(userId => {
      res.render('calendar', {userId, host: req.get('Host')});
    }).catch(e => res.sendStatus(500));
  }

  else {
    res.sendStatus(403);
  }
});

app.get('/', (req, res) => {
  res.render('index', {host: (req.secure ? 'https' : 'http') + '://' + req.get('Host')});
});

app.get('*', (req, res) => {
  res.sendStatus(404);
});

mongoose.connect('mongodb://localhost/albumversary', {useNewUrlParser: true}).then(() => {
  console.log('Connected to MongoDB');

  app.listen(4200, () => {
    console.log('Listening on http://localhost:4200');
  });
});
