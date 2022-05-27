const needle = require('needle')
const { BEARER } = require("./info.js")
const client = require("./index")
const GuildInfo = require("./models/GuildInfo")

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'

const rules = [{ value: 'from:rusthackreport' }]

// Set stream rules
async function setRules() {
  const data = {
    add: rules,
  }

  const response = await needle('post', rulesURL, data, {
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${BEARER}`,
    },
  })
  console.log(response.body)
  return response.body
}

function streamTweets() {
  const stream = needle.get(streamURL, {
    headers: {
      Authorization: `Bearer ${BEARER}`,
    },
  })

  stream.on('data', (data) => {
    try {
      const json = JSON.parse(data)
	  console.log(json)
	  sendEmbeds(json)
    } catch (error) {}
  })
}

function sendEmbeds(json) {
	GuildInfo.find({ channelId: { $ne: "" } }, (err, info) => {

		console.log(info)
		const text = json.data.text
		const words = text.split()
		const name = words.slice(0, -3).join(" ").toLowerCase()

		if (tracking.includes(name)) {
			const channel = client.channels.cache.get(info.channelId)
			channel.send(embeds[new MessageEmbed()
				.setTitle(`${name} was banned | Removed from tracking`)
				.setDescription(text)
				.setColor("#3bed44")
				.setTimestamp()
				.setFooter({ text: 'Rust Hack Report', iconURL: 'https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png' })
			])

			const index = info.tracking.indexOf(name)
			if (index !== -1) {
				info.tracking.splice(index, 1)
			}

			info.save(err => {
				if (err) {
					console.error(err)
					return
				}
			})
		}
		else if (info.status) {
			const channel = client.channels.cache.get(info.channelId)
			channel.send(embeds[new MessageEmbed()
				.setTitle(`${name} was banned`)
				.setDescription(text)
				.setColor("#ce412b")
				.setTimestamp()
				.setFooter({ text: 'Rust Hack Report', iconURL: 'https://pbs.twimg.com/profile_images/596978050559971328/Q9bkwxam_200x200.png' })
			])
		}
	})
}

streamTweets()