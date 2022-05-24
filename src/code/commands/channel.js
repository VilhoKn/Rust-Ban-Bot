const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder().setName("channel").setDescription("template"),
	run: async ({ client, interaction }) => {
		
	},
}