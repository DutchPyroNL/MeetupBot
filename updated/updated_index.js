const Discord = require('discord.js');
const client2 = new Discord.Client();
const config2 = require('./config2.json');
const fs = require("fs");
let db = JSON.parse(fs.readFileSync("./database.json", "utf8"));
let cooldown = new Set();
let cdseconds = 60; 

client2.on('message', message => {
    if(message.author.bot) return;
    if(message.content.toLowerCase().startsWith(`${config2.prefix}help`)){
        message.delete();
      const helpembed = new Discord.MessageEmbed()
      .setTitle('Help')
      .setColor('#00FF00')
      .setTimestamp()
      .setDescription("**Commands:**\n !help - Get this message.\n !level - See what level someone is at.\n !meetup - Get the link for the next meetup.\n !submit [link] - Submit resources.")
  
      message.author.send(helpembed);
    }
});

client2.on("message", message => {
    if (message.author.bot) return; 
    // if the user is not on registered yes add the user and set xp to 0
    if (!db[message.author.id]) db[message.author.id] = {
        xp: 0,
        level: 0
      };
    
    if(!cooldown.has(message.author.id)){
        db[message.author.id].xp++;
        cooldown.add(message.author.id);
    }
    let userInfo = db[message.author.id];
    let xpNeeded = 5 * (userInfo.level ^ 2) + 50 * userInfo.level + 100;
    if(userInfo.xp > xpNeeded) {
        userInfo.level++
        userInfo.xp = 0
        message.reply("Congratulations, you level up")
    }
    const args = message.content.slice(config2.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if(cmd === "level") {
        let userInfo = db[message.author.id];
        let member = message.mentions.members.first();
        let embed = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .addField("Level", userInfo.level)
        .addField("XP", userInfo.xp+"/"+xpNeeded);
        if(!member) return message.channel.send(embed)
        let memberInfo = db[member.id]
        let embed2 = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .addField("Level", memberInfo.level)
        .addField("XP", memberInfo.xp+"/100")
        message.channel.send(embed2)
    }
    fs.writeFile("./database.json", JSON.stringify(db), (x) => {
        if (x) console.error(x)
      });

    setTimeout(() => {
        cooldown.delete(message.author.id)
    }, cdseconds * 1000)
})

client2.on('message', message => {
    if(message.author.bot) return;
    if(message.content.toLowerCase().startsWith(`${config2.prefix}meetup`)){
        message.delete();
        const meetupEmbed = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .setDescription(config2.meetupdescription)
        message.channel.send(meetupEmbed);
    }
})

client2.on('message', message => {
    if(message.author.bot) return;
    const channel = client2.channels.cache.find(ch => ch.name === 'logs');
    if (!channel) return;
    if(message.content.toLowerCase().startsWith(`${config2.prefix}submit`)){
        message.delete();
        let args = message.content.toLowerCase().substring(8);
        let author = message.author.username;
        const submitEmbed = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .setTitle("new resource")
        .setDescription("submitted by : @" + author)
        .addField('Link', `${args}`, true)
        channel.send(submitEmbed);
    }
});


client2.login(config2.token)
