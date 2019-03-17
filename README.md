# Albumversary

###### Get a custom calendar with your favorite albums' birthdays!

Albumversary is a CalDAV server that retrieves users' favorite albums from Spotify and then creates calendar events for those albums' birthdays.

Users first log in on the Albumversary website, then their Spotify refresh token is stored in a MongoDB database and a calendar link is made available to them.

The calendar will work in any calendaring app/application/website on iOS, Android, macOS, Windows, Web, and more.

### TODO:
- Display artist, release year, and Spotfy link in each event.
- Add some form of security so that a user can't add another user's calendar to their own calendaring application.
- Allow users to delete/hide/filter albums.
- Allow users to set reminders.
- Speed up calendar generation (cache?).

Pull requests welcome!
