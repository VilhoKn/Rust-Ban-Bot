# Rust Ban Bot
This is a discord bot that i made for fun with discord.js.
It gets the bans from the rusthackreport twitter and sends them to a channel.
The ban channel is supposed to be muted if you dont want spam.
You can also set a name in tracking if you want to track a specific user if they get banned.
# Permissions
The bot only needs permissions to send messages and manage webhooks.
The ban messages are sent by creating and storing the webhook data in a database
and then sending the ban message to all the webhooks.