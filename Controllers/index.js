
const { handleMessage, handleURL, sendMessage } = require('./lib/Telegram');

async function handler(req) {
    try {
        const { body } = req;
        if (body.message.entities) {
            if (body.message.entities[0].type === "url") {
                const messageURL = body.message;
                sendMessage(messageURL, "🔃 Hold on, Sending your answer")
                const link = messageURL.text;
                if (link.includes("https://brainly.in/")) {
                    return await handleURL(messageURL);
                } else {
                    return sendMessage(messageURL, "Sorry brainly questions are only accepted")
                }
            }
        }
        if (body.message !== undefined) {
            const messageObj = body.message;
            await handleMessage(messageObj);
        }
        return;

    } catch (err) {
        console.log("Found Error in handler function", err.message);
    }
}

module.exports = { handler };