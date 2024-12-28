const axios = require('axios');

module.exports.config = {
  name: 'bot',
  version: '1.0.0',
  role: 0,
  hasPrefix: false,
  aliases: ['claude', 'bot'],
  description: "A Claude Conversation API command",
  usage: "bot [query]",
  credits: 'Developer',
  cooldown: 3,
};

module.exports.run = async function({ api, event, args }) {
  const input = args.join(' ');

  if (!input) {
    api.sendMessage(
      "[ bot ]\n\nPlease provide a query after 'bot'. Example: 'bot Tell me about Open Ai.'",
      event.threadID,
      event.messageID
    );
    return;
  }

  api.sendMessage(
    "[ Bot ]\n\nPlease wait...",
    event.threadID,
    (err, info) => {
      if (err) return;

      axios
        .get(`https://kaiz-apis.gleeze.com/api/gpt-4o?q=${input}&uid=${event.senderID}`)
        .then(({ data }) => {
          const response = data.response;

          api.editMessage(
            "[ Bot ]\n\n" + response,
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
