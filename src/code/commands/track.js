const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const GuildInfo = require("../models/GuildInfo")

module.exports = {
	data: new SlashCommandBuilder().setName("track").setDescription("Set people to track for bans")
			.addSubcommand(sc => sc
				.setName("add")
				.setDescription("Add people to the tracking list")
				.addStringOption(option => option
					.setRequired(true)
					.setName("name")
					.setDescription("The name to track")))
			.addSubcommand(sc => sc
				.setName("remove")
				.setDescription("Remove people or all the people from the tracking list")
				.addStringOption(option => option
					.setName("name")
					.setDescription("The name to remove")
					.setRequired(true))),
	run: async ({ client, interaction }) => {

		// Create the embed
		const embed = new MessageEmbed()

		// Get the selected name
		const choice = interaction.options.getString("name");

		// Try finding the guild id in the database
		GuildInfo.findOne({ guildId: interaction.guildId }, (err, info) => {
			// Output the possible error
			if (err) {
				console.log(err)
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

			// Initialize a variable to indicate if on remove the name was found
			let found = false;

			// Change the tracking array depending on the subcommands
			if (interaction.options.getSubcommand() === "add") {
				const name = choice.toLowerCase()
				const userId = interaction.member.id

				info.tracking.push({ name, userId })
			}
			else if (interaction.options.getSubcommand() === "remove" && choice.toLowerCase() !== "all") {
				for (i=0; i<info.tracking.length; i++) {
					if (info.tracking[i].name === choice.toLowerCase()) {
						info.tracking.splice(i, 1)
						found = true
						break;
					}
				}
			}
			else if (interaction.options.getSubcommand() === "remove" && choice.toLowerCase() === "all") {
				info.tracking = []
			}

			// Save to the database
			info.save(err => {
				if (err) {
					console.log(err)
					return
				}
			})

			// Prepare the values to show in the embed
			const channel = client.channels.cache.get(info.channelId)
			const channelName = channel ? channel.name : info.guildId
			const tracking = info.tracking.join(", ")

			// Prepare the descriptions
			// Change the descriptions depending if the name was found
			const title = !found ? "Server tracking unchanged" : "Server tracking changed"
			const desc = !found ? "Name was not found in the tracking list" : "Removed the name from tracking"
			let statusDesc = info.status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
			let channelsDesc = info.channelId ? '<:ON:978364950340853901> : `Channel ' + channelName +'`\n' : '<:OFF:978364973065580604> : `No channel set`\n';
			let trackingDesc = info.tracking.length !== 0 ? '<:ON:978364950340853901> : `Tracking ' + tracking +'`\n' : '<:OFF:978364973065580604> : `Tracking no one`\n';

			// Combine the descriptions
			const infoDesc = statusDesc + channelsDesc + trackingDesc

			// Configuring the embed
			interaction.reply({
				embeds: [embed
				.setTitle(title)
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