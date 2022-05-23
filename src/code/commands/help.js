const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder().setName("help").setDescription("Shows information about the commands"),
	run: async ({ client, interaction }) => {

		const embed = new MessageEmbed()

		const desc = `This bot is an unofficial bot that posts rust\n bans from the Rust Hack Report twitter account`
		const commandsDecs = '`/help`	Displays this message\n`/`	'

		await interaction.reply({
			embeds: [new MessageEmbed()
            .setThumbnail("https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png")
            .setTitle("Rust Ban Bot")
			.setDescription(desc)
			.setColor("#ce412b")
			.addFields(
				{name: 'Commands', value: commandsDecs }
			)
        ], ephemeral: true,
		})
	},
}