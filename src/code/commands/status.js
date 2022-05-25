const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const GuildInfo = require("../models/GuildInfo")

module.exports = {
	data: new SlashCommandBuilder().setName("status").setDescription("Toggle the status of the ban messages")
			.addStringOption(option =>
			option.setName('mode')
			.setDescription('The mode to set the status')
			.setRequired(true)
			.addChoices({
				'name': 'ON',
				'value': 'ON'
			})
			.addChoices({
				'name': 'OFF',
				'value': 'OFF'
			})),
	run: async ({ client, interaction }) => {

		const embed = new MessageEmbed()

		const choice = interaction.options.getString("mode");

		const status = choice === "ON" ? true : false;

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
			
			info.status = status;

			info.save(err => {
				if (err) {
					console.error(err)
					return
				}
			})

			const channel = interaction.guild.channels.cache.get(info.guildId)
			const channelName = channel ? channel.name : info.guildId
			
			const tracking = info.tracking.join(", ")

			const desc = `Server status set to ${choice}`
			let statusDesc = status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
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