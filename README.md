# Facebook Chat Archiver
This project is meant to download an entire Facebook Messenger thread's history into a sqlite database. This allows you to have a complete history (something which is hard to see in Facebook's UI), and allows you to do some statistics on you and your friend's data.

## Instructions

`npm install`

`cp config.json.example config.json`

Edit `config.json` to have each of the fields that you want, including your Facebook username and password. Since Facebook doesn't support chat downloading natively, we have to mock HTTP sessions to get this data, so you need a real user account. This also currently only downloads a thread at a time, so make sure to grab a thread id.

`./create_db.sh`

`node index.js`

It will spit out timestamps as it's chugging along, so you can see the time that it's currently downloading.

Here's the schema that's extracted by default (feel free to change it by editing `create_db.sh` and the sql insert statement in `index.js`):
* `thread_id`
* `author` --  as a name, such as "Mark Zuckerberg"
* `timestamp` -- as an epoch timestamp
* `text` -- this will be different depending on the message type:
  * Regular messages -- The message text
  * Images -- the large preview url
  * Stickers -- the preview url
  * Videos -- the video url
  * Share -- the link url
  * All other events (group photo change, entering/exiting chat, payments) -- nothing. The messages aren't getting logged because I didn't care about them for my use case
