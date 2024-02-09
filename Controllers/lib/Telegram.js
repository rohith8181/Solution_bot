const axios = require('axios');
const MY_TOKEN = process.env.Telegram_Bot_Token;
const BASE_URL = `https://api.telegram.org/bot${MY_TOKEN}`;
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const formdata = require('form-data')
const User = require('../schema/UserSchema');

async function sendMessage(messageObj, messageText) {
    try {
        await axios.post(`${BASE_URL}/sendMessage`, {
            chat_id: messageObj.chat.id,
            text: messageText,
            parse_mode: 'HTML',
        })
    }
    catch (err) {
        console.log("Found Error in sendMessage Function", err);
    }
}
async function sendDocument(messageURL, DocPath) {
    try {
        const documentData = fs.readFileSync(DocPath);
        const documentBlob = new Blob([documentData], { type: 'text/html' });

        const formData = new FormData();
        formData.append('chat_id', messageURL.chat.id);
        formData.append('document', documentBlob, 'Answer.html');

        axios.post(`${BASE_URL}/sendDocument`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    } catch (err) {
        console.log("Internal Error in Sending Document function", err);
    }
}
async function sendPhoto(messageObj) {
    try {
        const imagepath = path.join(__dirname + "../../../Files/payment_qr.jpeg")
        const ImageData = fs.readFileSync(imagepath);
        const ImageBlob = new Blob([ImageData], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('chat_id', messageObj.chat.id);
        formData.append('photo', ImageBlob, 'QR.jpeg');

        axios.post(`${BASE_URL}/sendPhoto`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    } catch (err) {
        console.log("Internal Error in Sending Document function", err);
    }
}
async function handleMessage(messageObj) {

    try {
        const messageText = messageObj.text || "";
        if (messageText.charAt(0) === '/') {
            const person = await User.findOne({ AccountId: messageObj.from.id });
            const command = messageText.substr(1);
            switch (command) {
                case "start":
                    if (person) {
                        return sendMessage(messageObj, `Hello welcome <u>${messageObj.from.first_name}</u>!\n- Your Available Credits :${person.Credits}`);
                    }
                    else {
                        await User.create({
                            AccountId: messageObj.from.id,
                            Credits: 1,
                        })
                        return sendMessage(messageObj, `Hello welcome to ${process.env.BOT_NAME}!.\n- Your Account_id is ${messageObj.from.id}.\n\n- To Know how to use this bot type '/help' `)
                    }
                case "account":
                    return sendMessage(messageObj, `- Your AccountId is ${person.AccountId}`);
                case "balance":
                    return sendMessage(messageObj, `- Your balance Credits are : ${person.Credits}\n\n- To recharge type '/plan'`);
                case "changeformat":
                    if (person.AnswerFormat === "text") {
                        const updatedFormat = "htmlFile";
                        person.AnswerFormat = updatedFormat;
                    } else {
                        person.AnswerFormat = "text";
                    }
                    await person.save();
                    return sendMessage(messageObj, "- Format Changed Successfully!\n\n- you can check the current format by '/checkformat'")
                case "checkformat":
                    return sendMessage(messageObj, `- ${person.AnswerFormat}`);
                case "help":
                    return sendMessage(messageObj, `Hello welcome to solutions_bot!, We Provide Solutions for <u>brainly</u> website questions.\n\n✅ PROCESS FOR GETTING ANSWERS FROM BOT.\n\nSTEP 1️⃣: Type the exact question on google.\n\nSTEP 2️⃣: Verify whether the question is same in brainly.in and it has been solved by an expert.\n\nSTEP 3️⃣: Now, copy the exact link and paste it on @${process.env.BOT_NAME}.\n\nSTEP 4️⃣: Please avoid sending additional texts just before the brainly link you send to bot. Just copy the link from browser and paste it in bot.\n\nSTEP 5️⃣: You will get the answer in your selected response format by default it will be text you can change that to 'htmlFile' by  using '/changeformat'\n\nNOTE :<u> htmlFile response usally takes little more time than text response.</u>\n\nThank you.\n\n✅ PROCESS FOR ADDING CREDITS TO YOUR ACCOUNT.\n\n- Type '/plan' for recharge plans and process for adding credits to your account.\n\n✅	AVAILABLE COMMANDS FOR INTERACTING TO BOT AND ITS USES.\n\n- /start (welcome message)\n- /account (gets your account Id)\n- /help (Information about how to use the bot)\n- /plan (recharge plans and process for adding credits)\n- /changeformat (changes the response format)\n- /checkformat (gets your current response format)\n- /balance (gets your current balance)\n`);
                case "plan":
                    sendMessage(messageObj, `✅ RECHARGE PLANS FOR CREDITS POINTS In <u>Rupees</u>.\n\n 💰20  --> 15 points.\n 💰30  --> 20 points.\n 💰50  --> 40 points.\n 💰100 --> 75 points.\n\nPay to the upi id - peralarohith@fbl\n or use the Scanner below.\n\n✅<strong><u> IMPORTANT AFTER PAYMENT :</u></strong>\n\n- After making payment send the screenshot of the payment and your accountId (you can get this by typing '/account') to\n @Rohith_admin \n\n\nNote : Currently we are accepting maximum 100 rs per transaction. for more details contact Admin`);
                    return sendPhoto(messageObj);
                default:
                    return sendMessage(messageObj, "Don't know what you are talking about");
            }
        }
        else {
            return sendMessage(messageObj, "Sorry I don't have any answer for this right know");
        }
    }
    catch (err) {
        console.log("Found error in handleMessage", err);
    }

}
async function handleURL(messageURL) {
    try {
        const person = await User.findOne({ AccountId: messageURL.from.id });
        const response = await axios.get(messageURL.text, {
            method: 'GET',
            proxy: {
                host: 'proxy-server.scraperapi.com',
                port: 8001,
                auth: {
                    username: 'scraperapi',
                    password: process.env.ScrapperApi_Password
                },
                protocol: 'http'
            }
        })
        if (response.status === 403) {
            return sendMessage(messageURL, "Sorry, Bot is Under Maintanace try again later")
        } else if (response.status === 429) {
            return sendMessage(messageURL, "The bot is experiencing high demand currently, Please try again after 1-2 min")
        }
        else if (response.status === 500) {
            return sendMessage(messageURL, "Sorry the link is not responding please try again");
        }
        const responseData = response.data || "";
        const $ = cheerio.load(responseData);
        const answerElement = $('.js-answer-content');
        if (answerElement !== undefined && answerElement.length > 0) {

            if (person && person.AnswerFormat === "text") {
                let combinedAnswer = '';
                answerElement.each(function () {
                    combinedAnswer += $(this).text();
                    combinedAnswer += "<u><b>ANOTHER_USER_ANSWER</b></u>"
                })
                sendMessage(messageURL, combinedAnswer);
            }
            else {
                const answer = $('.js-react-answers').html();
                const filepath = path.join(__dirname + `../../../Files/${messageURL.chat.id}.html`);
                fs.writeFileSync(filepath, answer, 'utf-8');
                sendDocument(messageURL, filepath);
            }
        }
        else {
            sendMessage(messageURL, "Sorry, This Question is not Yet Answered");
        }
        let curr_credits = person.Credits;
        if (curr_credits > 0) {
            person.Credits = curr_credits - 1;
        } else {
            return sendMessage(messageURL, "Your Current Balance is 0, Recharge from here '/plan'")
        }
        await person.save();
    } catch (err) {
        console.log("Error in internal Server", err);
    }
}




module.exports = { handleMessage, handleURL, sendMessage, sendPhoto };