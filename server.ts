import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import axios from 'axios';
import fs from 'fs';
import {
	bothImagesAreSame,
	deleteAFile,
	downloadAnImage,
} from './utility_functions';
dotenv.config();

const app: Express = express();
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
const PORT = process.env.PORT || 3000;

const USERNAME = 'deependu__';

// console.log("telegram bot token: ", process.env.TELEGRAM_BOT_TOKEN);
// console.log("telegram bot token: ", process.env.RAPID_API_KEY   );

const options = {
	method: 'GET',
	url: 'https://instagram28.p.rapidapi.com/user_info',
	params: { user_name: USERNAME },
	headers: {
		'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
		'X-RapidAPI-Host': 'instagram28.p.rapidapi.com',
	},
};

// method for invoking start command

bot.command('start', (ctx) => {
	// console.log('this is my ctx: ', ctx);
	// console.log('this is my ctx.from: ', ctx.from);
	bot.telegram.sendMessage(
		ctx.chat.id,
		'hello there from Insta Stalker😻! You will now be receiving the profile pic of the person whenever he/she updates there dp.',
		{}
	);

	// run once and then again every 30 seconds
	getUpdatedDp(ctx);

	setInterval(() => {
		getUpdatedDp(ctx);
	}, 30000);
});

const getUpdatedDp = (ctx: any) => {
	const prevDpPATH = './images/prevDp.png';
	const currDpPATH = './images/currDp.png';

	axios
		.request(options)
		.then(async function (response) {
			// console.log('the response is: ');
			// console.log(response.data.data.user.profile_pic_url_hd);

			const profilePicURL = response.data.data.user.profile_pic_url_hd;
			try {
				downloadAnImage(profilePicURL, currDpPATH, async function () {
					if (await bothImagesAreSame(prevDpPATH, currDpPATH)) {
						// delete the curr dp image
						fs.unlinkSync(currDpPATH);
					} else {
						// delete the previous dp image
						fs.unlinkSync(prevDpPATH);
						// rename the curr dp image to prevDP.png
						fs.renameSync(currDpPATH, prevDpPATH);
						// send the curr dp image to the user
						bot.telegram.sendMessage(ctx.chat.id, 'DP updated 💃🎊', {});
						bot.telegram.sendPhoto(ctx.chat.id, {
							source: prevDpPATH,
						});
					}
				});
			} catch (err: any) {
				console.log('Error occurred in downloading image: ', err);
			}
		})
		.catch(function (error) {
			console.log('error occurred');
			console.error(error);
		});
};

bot.launch();
