const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const GuildInfo = require("../models/GuildInfo")

module.exports = {
	data: new SlashCommandBuilder().setName("help").setDescription("Shows information about the commands"),
	run: async ({ client, interaction }) => {

		// Create the embed
		const embed = new MessageEmbed()

		GuildInfo.findOne({ guildId: interaction.guildId }, (err, info) => {
			if (err) {
				console.error(err)
				return
			}

			if (!info) {
				info = new GuildInfo({
					guildId: interaction.guildId,
					channelId: "",
					tracking: [],
					status: false,
				})

				info.save(err => {
					if (err) {
						console.error(err)
						return
					}
				})
			}
		})

		// TODO: MAKE THE CALLBACK SHIT WORK

		const channel = interaction.guild.channels.cache.get()
		const channelName = channel ? channel.name : 
		
		const tracking = .tracking.join(", ")
		console.log(channel)
		console.log(tracking)

		const desc = `This bot is an unofficial bot that posts rust\n bans from the Rust Hack Report twitter account`
		const commandsDesc = '`/help`	Displays this message\n`/channel`	Set the channel to send bans\n`/status`   Turn the bans ON or OFF\n`/track`   Get alerted when a spesific player gets banned'
		let statusDesc = .status ? '<:ON:978364950340853901> : `Status ON`\n' : '<:OFF:978364973065580604> : `Status OFF`\n';
		let channelsDesc = .channelId ? '<:ON:978364950340853901> : `Channel ' + channelName +'`\n' : '<:OFF:978364973065580604> : `No channel set`\n';
		let trackingDesc = .tracking !== [] ? '<:ON:978364950340853901> : `Tracking ' + tracking +'`\n' : '<:OFF:978364973065580604> : `Tracking no one`\n';

		// Combine the descriptions
		const infoDesc = statusDesc + channelsDesc + trackingDesc

		// Configuring the embed
		await interaction.reply({
			embeds: [embed
            .setThumbnail("https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png")
            .setTitle("Rust Ban Bot")
			.setDescription(desc)
			.setColor("#ce412b")
			.addFields(
				{name: 'Commands', value: commandsDesc },
				{name: 'Server Info', value: infoDesc }
			)
        ], ephemeral: true,
		})
	},
}