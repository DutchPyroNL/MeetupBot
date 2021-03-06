// Define variables
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const fs = require("fs");
const jsonfile = require('jsonfile');
const random = require('random');

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
            message.channel.send("<@" + message.user.id + ">" + ' has reached level ' + userStats.level);
        }

        jsonfile.writeFileSync('stats.json', stats);

        // console.log(message.author.username + ' now has ' + userStats.xp);
        // console.log(xpToNextLevel + ' XP needed for next level.');
    }

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if(message.content.toLowerCase().startsWith(`${config.prefix}level`)) {
        let member = message.mentions.members.first();
        
        if(typeof member !== 'undefined'){ 
            let memberInfo = guildStats[member.user.id];
            let nextXp = 5 * Math.pow(memberInfo.level, 2) + 50 * memberInfo.level + 100;
            let embed = new Discord.MessageEmbed()
            .setTitle("Stats\n" + member.user.tag)
            .setColor("#00FF00")
            .addField("Level", memberInfo.level)
            .addField("XP", memberInfo.xp+"/"+nextXp);
            return message.channel.send(embed)
        }else{
            let memberInfo = guildStats[message.author.id];
            let embed = new Discord.MessageEmbed()
            .setTitle("Stats\n" + message.member.user.tag)
            .setColor("#00FF00")
            .addField("Level", memberInfo.level)
            .addField("XP", memberInfo.xp + "/" + xpToNextLevel);
            message.channel.send(embed);
        } 
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


client.on("ready", async () => {
    console.log(client.user.username + ' is now online and working!');
    client.user.setActivity('HTB meetup discord!', {type: 'WATCHING'})
    .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
    .catch(console.error);
});

client.login(config.token);