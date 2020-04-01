'use strict'
require('dotenv').config()
const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const bot = new Discord.Client()
const prefix = '!';
bot.login(process.env.TOKEN)

bot.on("guildMemberAdd", member => {
    member.send(process.env.MESSAGE_MEMBER_ADD)
})

var claudioBot = {
    title: 'Bot do Claudião',
    queue: [],
    using: false,
    channelId: null
}

bot.on('message', async message => {
    let content = message.content
    if (message.author.bot) return
    if (!content.startsWith(prefix)) return

    if (content.startsWith(`${prefix}play`)) {
        let args = content.split(" ")
        if (!args[1]) {
            message.channel.send("Desculpa não consegui compreender.")
            return
        }

        let ytb = await ytdl.getInfo(args[1].trim()).catch(() => {
            message.channel.send("Não consegui encontrar sua música.")
        })

        if (ytb) {
            claudioBot.queue.push({
                title: ytb.title,
                url: ytb.video_url
            })

            if (claudioBot.queue.length > 0) {
                message.channel.send(`${ytb.title} foi adicionado a fila`)
            }

            if (!claudioBot.using && claudioBot.channelId !== message.channel.id) {
                claudioBot.using = true       
                claudioBot.channelId = message.channel.id         
                    message.member.voice.channel.join().then(connection => {            
                        message.channel.send(`Venha escutar ${claudioBot.queue[0].title}`)
                        connection.play(ytdl(claudioBot.queue[0].url))
                        .on('finish', () => {
                            claudioBot.queue.shift()                            
                            if (claudioBot.queue.length > 0) {
                                message.channel.send(`Venha escutar ${claudioBot.queue[0].title}`)
                                connection.play(claudioBot.queue[0].url)
                            }                 
                        })            
                    })                
            } else {
                message.channel.send("Estou sendo utilizado em outro canal.")
            }
        } else {
            message.channel.send("Não consegui encontrar sua música.")
        }
    }
})