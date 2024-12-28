const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: 'ytmp3',
  version: '1.0.0',
  role: 0,
  hasPrefix: true,
  aliases: ['ytmp3', 'ytmusic'],
  description: "Downloading Music",
  usage: "ytmp3 music",
  credits: 'Joshua Apostol',
  cooldown: 5,
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;

  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "[ YTMP3 ]\n\nPlease provide a song title after 'ytmp3'. Example: 'ytmp3 love me for who I am'",
      threadID,
      messageID
    );
    return;
  }

  api.sendMessage(
    "Music is being sent, please wait...",
    threadID,
    (err, info) => {
      if (err) return;

      axios
        .post(`https://kaiz-apis.gleeze.com/api/ytsearch?q=${encodeURIComponent(input)}`)
        .then(async ({ data }) => {
          const info = data.items[0];
          const title = info.title;
          const url = info.url;

          axios
            .post(`https://kaiz-ytmp4-downloader.vercel.app/ytmp4?url=${url}`)
            .then(async ({ data }) => {
              const dlink = data.download_url;

              const audioPath = path.resolve(__dirname, 'song.mp3');
              const writer = fs.createWriteStream(audioPath);

              const responseStream = await axios({
                url: dlink,
                method: 'GET',
                responseType: 'stream',
              });

              responseStream.data.pipe(writer);

              writer.on('finish', () => {
                api.sendMessage(
                  {
                    body: `Title: ${title}\n`,
                    attachment: fs.createReadStream(audioPath),
                  },
                  threadID,
                  () => {
                    fs.unlinkSync(audioPath);
                    api.editMessage(
                      "[ YTMP3 ]\n\nMusic sent successfully!",
                      info.messageID
                    );
                  },
                  messageID
                );
              });

              writer.on('error', () => {
                api.editMessage(
                  "[ YTMP3 ]\n\nAn error occurred while processing the audio.",
                  info.messageID
                );
              });
            })
            .catch(() => {
              api.editMessage(
                "[ Youtube Downloader ]\n\nError fetching download API!",
                info.messageID
              );
            });
        })
        .catch(() => {
          api.editMessage(
            "[ Youtube Downloader ]\n\nError fetching search API!",
            info.messageID
          );
        });
    }
  );
};
