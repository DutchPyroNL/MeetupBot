const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const fs = require("fs");
let db = JSON.parse(fs.readFileSync("./database.json", "utf8"));

client.on("message", message => {
    if (message.author.bot) return; 

    // if the user is not on registered yes add the user and set xp to 0
    if (!db[message.author.id]) db[message.author.id] = {
        xp: 0,
        level: 0
      };
    db[message.author.id].xp++;
    let userInfo = db[message.author.id];
    if(userInfo.xp > 100) {
        userInfo.level++
        userInfo.xp = 0
        message.reply("Congratulations, you level up")
    }
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if(cmd === "info") {
        let userInfo = db[message.author.id];
        let member = message.mentions.members.first();
        let embed = new Discord.MessageEmbed()
        .setColor(0x4286f4)
        .addField("Level", userInfo.level)
        .addField("XP", userInfo.xp+"/100");
        if(!member) return message.channel.send(embed)
        let memberInfo = db[member.id]
        let embed2 = new Discord.MessageEmbed()
        .setColor(0x4286f4)
        .addField("Level", memberInfo.level)
        .addField("XP", memberInfo.xp+"/100")
        message.channel.send(embed2)
    }
    fs.writeFile("./database.json", JSON.stringify(db), (x) => {
        if (x) console.error(x)
      });
})

client.on('message', message => {
    if(message.author.bot) return;
    if(message.content.toLowerCase().startsWith(`${config.prefix}meetup`)){
        const meetupEmbed = new Discord.MessageEmbed()
        .setColor("RED")
        .setDescription("The next meetup will be Wednesday, June 17th from 6pm till 9pm.  Register here:\n https://www.meetup.com/hack-the-box-nl/events/270764287/")
        message.channel.send(meetupEmbed);
    }
})

client.login(config.token)