// Define variables
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const fs = require("fs");
const jsonfile = require('jsonfile');
const random = require('random');

let db = JSON.parse(fs.readFileSync("./database.json", "utf8"));
let cooldown = new Set();
let cdseconds = 60; 

// Level system start
var stats = {};
if (fs.existsSync('stats.json')) {
    stats = jsonfile.readFileSync('stats.json');
}

client.on('message', (message) => {
    if (message.author.id == client.user.id)
        return;

    if (message.guild.id in stats === false) {
        stats[message.guild.id] = {};
    }

    const guildStats = stats[message.guild.id];
    if (message.author.id in guildStats === false) {
        guildStats[message.author.id] = {
            xp: 0,
            level: 0,
            last_message: 0
        };
    }

    const userStats = guildStats[message.author.id];
    const xpToNextLevel = 5 * Math.pow(userStats.level, 2) + 50 * userStats.level + 100;
    if (Date.now() - userStats.last_message > 60000) {
        userStats.xp += random.int(15, 25);
        userStats.last_message = Date.now();

        
        if (userStats.xp >= xpToNextLevel) {
            userStats.level++;
            userStats.xp = userStats.xp - xpToNextLevel;
            message.channel.send(message.author + ' has reached level ' + userStats.level);
        }

        jsonfile.writeFileSync('stats.json', stats);

        console.log(message.author.username + ' now has ' + userStats.xp);
        console.log(xpToNextLevel + ' XP needed for next level.');
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if(message.content.toLowerCase().startsWith(`${config.prefix}level`)) {
        let member = message.mentions.members.first();
        let embed = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .addField("Level", userStats.level)
        .addField("XP", userStats.xp+"/"+xpToNextLevel);
        if(!member) return message.channel.send(embed)
        let memberInfo = guildStats[message.author.id]
        let embed2 = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .addField("Level", memberInfo.level)
        .addField("XP", memberInfo.xp+"/100")
        message.channel.send(embed2)
    }
});

// Level system ended

// Help command

client.on('message', message => {
    if(message.author.bot) return;
    if(message.content.toLowerCase().startsWith(`${config.prefix}help`)){
        message.delete();
      const helpembed = new Discord.MessageEmbed()
      .setTitle('Help')
      .setColor('#00FF00')
      .setTimestamp()
      .setDescription("**Commands:**\n !help - Get this message.\n !level - See what level someone is at.\n !meetup - Get the link for the next meetup.\n !submit [link] - Submit resources.")
  
      message.author.send(helpembed);
    }
});

/*
client.on("message", message => {
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
    
    fs.writeFile("./database.json", JSON.stringify(db), (x) => {
        if (x) console.error(x)
      });

    setTimeout(() => {
        cooldown.delete(message.author.id)
    }, cdseconds * 1000)
})
*/


// Meetup command
client.on('message', message => {
    if(message.author.bot) return;
    if(message.content.toLowerCase().startsWith(`${config.prefix}meetup`)){
        message.delete();
        const meetupEmbed = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .setDescription(config.meetupdescription)
        message.channel.send(meetupEmbed);
    }
})


// Submit command
client.on('message', message => {
    if(message.author.bot) return;
    const channel = client.channels.cache.find(ch => ch.name === 'logs');
    if (!channel) return;
    if(message.content.toLowerCase().startsWith(`${config.prefix}submit`)){
        message.delete();
        let args = message.content.toLowerCase().substring(8);
        let author = message.author.username;
        const submitEmbed = new Discord.MessageEmbed()
        .setColor("#00FF00")
        .setTitle("New resource " )
        .setDescription("submitted by : @" + author)
        .addField('Link', `${args}`, true)
        channel.send(submitEmbed);
    }
});


client.login(config.token);