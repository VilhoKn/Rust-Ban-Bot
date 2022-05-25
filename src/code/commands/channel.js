const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const GuildInfo = require("../models/GuildInfo")

module.exports = {
	data: new SlashCommandBuilder().setName("channel").setDescription("Set the ban channel")
			.addChannelOption(option =>
			option.setName('channel')
			.setDescription('The channel to send the bans')
			.setRequired(true))
			.addStringOption(option =>
			option.setName('remove')
			.setDescription('Set this is you want to remove the channel')
			.addChoices({
				'name': 'ON',
				'value': 'ON'
			})),
	run: async ({ client, interaction }) => {

		const embed = new MessageEmbed()

		const choice = interaction.options.getChannel("channel");
		const remove = interaction.options.getString("remove") === "ON" ? true : false

		GuildInfo.findOne({ guildId: interaction.guildId }, (err, info) => {
			if (err) {
				console.error(err)
				return
			}
	
			if (!info) {
				info = new GuildInfo({
					guildId: interaction.guildId,
					channelId: "",
					tracking: new Array,
					status: false,
				})
			}
			

			info.channelId = remove === false ? choice.id : "";

			info.save(err => {
				if (err) {
					console.error(err)
					return
				}
			})

			let channel = client.channels.cache.get(info.channelId)

			const channelName = channel ? channel.name : info.channelId
			
			const tracking = info.tracking.join(", ")

			const desc = remove === false ? `Ban channel set to ${channel}` : "Removed channel"
			let statusDesc = info.status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
			let channelsDesc = info.channelId ? '<:ON:978364950340853901> : `Channel ' + channelName +'`\n' : '<:OFF:978364973065580604> : `No channel set`\n';
			let trackingDesc = info.tracking.length !== 0 ? '<:ON:978364950340853901> : `Tracking ' + tracking +'`\n' : '<:OFF:978364973065580604> : `Tracking no one`\n';

			// Combine the descriptions
			const infoDesc = statusDesc + channelsDesc + trackingDesc

			// Configuring the embed
			interaction.reply({
				embeds: [embed
				.setThumbnail("https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png")
				.setTitle("Rust Ban Bot")
				.setDescription(desc)
				.setColor("#ce412b")
				.addFields(
					{name: 'Server Info', value: infoDesc },
				)
			], ephemeral: true,
			})
		})
	},
}