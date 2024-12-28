const axios = require('axios');

module.exports.config = {
  name: 'gemini',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['astro', 'zodiac'],
  description: "A Gemini API command",
  usage: "Gemini [query]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "[ Gemini ]\n\nPlease provide a query after 'gemini'. Example: 'gemini Tell me about Gemini.'",
      event.threadID,
      event.messageID
    );
    return;
  }

  api.sendMessage(
    "[ Gemini ]\n\nPlease wait...",
    event.threadID,
    (err, info) => {
      if (err) return;

      axios
        .get(`https://kaiz-apis.gleeze.com/api/gpt-4o?q=${input}&uid=${event.senderID}`)
        .then(({ data }) => {
          const response = data.response;

          api.editMessage(
            "[ Gemini ]\n\n" + response,
            info.messageID
          );
        })
        .catch(() => {
          api.editMessage(
            "[ Gemini ]\n\nAn error occurred while processing your request.",
            info.messageID
          );
        });
    }
  );
};
