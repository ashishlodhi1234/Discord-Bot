// Dependencies
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports.run = async (bot, message, args, emojis, settings) => {
	const username = args.join(' ');
	// Checks to see if a username was provided
	if (!username) return message.channel.send({ embed:{ color:15158332, description:`${emojis[0]} Please use the format \`${bot.commands.get('instagram').help.usage.replace('${PREFIX}', settings.prefix)}\`.` } }).then(m => m.delete({ timeout: 5000 }));
	const r = await message.channel.send('Gathering account details...');
	// Gather data from database
	const url = `https://instagram.com/${username}/?__a=1`;
	const res = await fetch(url).then(info => info.json()).catch(err => {
		// An error occured when looking for account
		if (bot.config.debug) bot.logger.error(`${err.message} - command: instagram.`);
		message.delete();
		message.channel.send('That Instagram account does not exist.').then(m => m.delete({ timeout: 3500 }));
		return;
	});
	if (res.size == 0) {
		r.delete();
		return;
	}
	// Checks to see if a username in instagram database
	if (!res.graphql.user.username) {
		r.delete();
		return message.channel.send('I couldn\'t find that account.');
	}
	// Displays Data
	const account = res.graphql.user;
	const embed = new MessageEmbed()
		.setColor(0x0099ff)
		.setTitle(account.full_name)
		.setURL(`https://instagram.com/${username}`)
		.setThumbnail(account.profile_pic_url)
		.addField('Username:', account.username)
		.addField('Full Name:', account.full_name)
		.addField('Biography:', (account.biography.length == 0) ? 'None' : account.biography)
		.addField('Posts:', account.edge_owner_to_timeline_media.count, true)
		.addField('Followers:', account.edge_followed_by.count, true)
		.addField('Following:', account.edge_follow.count, true)
		.addField('Private Account:', account.is_private ? 'Yes :x:' : 'No :white_check_mark:', true)
		.addField('Verified account:', account.is_verified ? 'Yes' : 'No', true);
	r.delete();
	message.channel.send(embed);
};

module.exports.config = {
	command: 'instagram',
	aliases: ['insta'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
};

module.exports.help = {
	name: 'Instagram',
	category: 'Searcher',
	description: 'Get information on an Instagram account.',
	usage: '${PREFIX}instagram <user>',
};
