const login = require("facebook-chat-api");
const sqlite3 = require('sqlite3').verbose();
const conf = require('./config.json');

var db = new sqlite3.Database(conf.dbName);

login({email: conf.username, password: conf.password}, (err, api) => {
  if(err) return console.error(err);

  // This is the timestamp of the first message that will be fetched.
  // Undefined value means start from the current timestamp.
  // If your archive fails while running, put the last printed timestamp here and run again.
  var timestamp = "1445972709394";
  saveThreadHistory(api, db, conf.threadId, conf.batchSize, timestamp);
});

function saveThreadHistory(api, db, threadId, sliceSize, timestamp) {
  api.getThreadHistory(threadId, sliceSize, timestamp, (err, history) => {
    if (!history || history.length <= 1) {
      console.log("It looks to be done!");
      return;
    }
    console.log("Archiving messages starting at timestamp: " + timestamp);
    // Since the timestamp is from a previous loaded message,
    // that message will be included in this history so we can discard it unless it is the first load.
    if(timestamp != undefined) history.pop();

    // Save each message to the "history" table.
    history.forEach((message) => {
      // Attempt to save valuable information about each type, such as the text or the URL of the attachment.
      var text = "";
      if (message.body) text = message.body;
      if (message.attachments.length > 0) {
        var attachment = message.attachments[0];
        if (attachment.type == "photo") text = attachment.largePreviewUrl;
        if (attachment.type == "sticker") text = attachment.url;
        if (attachment.type == "animated_image") text = attachment.previewUrl;
        if (attachment.type == "share") text = attachment.facebookUrl;
        if (attachment.type == "video") text = attachment.url;
      }
      if (text) {
        db.run("insert into history values (?, ?, ?, ?)", threadId,
                                                          message.timestamp,
                                                          message.senderName,
                                                          text);
      }
    });

    timestamp = history[0].timestamp;
    saveThreadHistory(api, db, threadId, sliceSize, timestamp);
  });
}
