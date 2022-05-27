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

		// Create the embed
		const embed = new MessageEmbed()

		// Turning the choice in to a boolean
		const choice = interaction.options.getString("mode");
		const status = choice === "ON"

		// Try finding the guild id in the database
		GuildInfo.findOne({ guildId: interaction.guildId }, (err, info) => {
			// Output the possible error
			if (err) {
				console.error(err)
				return
			}
	
			// If the guild isn't in the database, make a new instance
			if (!info) {
				info = new GuildInfo({
					guildId: interaction.guildId,
					channelId: "",
					tracking: new Array,
					status: false,
					webhook: {
						id: "",
						token: "",
						url: "",
					},
				})
			}
			
			// Set the status to the new status
			info.status = status;

			// Save to the database
			info.save(err => {
				if (err) {
					console.error(err)
					return
				}
			})

			// Prepare the variables to show in the embed
			const channel = client.channels.cache.get(info.channelId)
			const channelName = channel ? channel.name : info.guildId
			const tracking = info.tracking.join(", ")

			// Prepare the descriptions
			const desc = `Server status set to ${choice}`
			let statusDesc = status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
			let channelsDesc = info.channelId ? '<:ON:978364950340853901> : `Channel ' + channelName +'`\n' : '<:OFF:978364973065580604> : `No channel set`\n';
			let trackingDesc = info.tracking.length !== 0 ? '<:ON:978364950340853901> : `Tracking ' + tracking +'`\n' : '<:OFF:978364973065580604> : `Tracking no one`\n';

			// Combine the descriptions
			const infoDesc = statusDesc + channelsDesc + trackingDesc

			// Configuring the embed
			interaction.reply({
				embeds: [embed
				.setTitle("Server status changed")
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