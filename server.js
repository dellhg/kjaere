const Discord = require("discord.js");
const client = new Discord.Client();

var Gamedig = require('gamedig');

var playerlist;
var prettyplayerlist = "";
var counter = 0;

var prefix = '!'; //command prefix

var alarmchannelid = '377456577998724957' //insert your alarm channel id here

var maxplayeralarm = 40;
var maxnightplayeralarm = 20;
var grieferalarm = 6;

function getState(){
Gamedig.query({
   type: 'arkse',
  host: '5.101.166.138', 
	port_query: '27017',  //27015 for port 7777..27019 for port 7781, 27017 for port 7779
	port: '7779' 
}).then((state) => {
	playerlist=state.players.slice(0);
}).catch((error) => {
});
}

client.login(process.env.TOKEN); //insert your bot token here.
var prettyplayerlist = "";
function printPlayerlist(){
  if (playerlist.length == 0){
    prettyplayerlist = "There are no players online";
  }
  else {
    prettyplayerlist = "```JavaScript\n";
    for (i = 0; i < playerlist.length; i++){
      prettyplayerlist += ("\"" + playerlist[i].name +"\"\t\t Online since " + Math.round(playerlist[i].time/60) + " Minutes. \n")
    }
    prettyplayerlist += "```";
  }
}

var griefercounter = 0;
function checkGriefer(){
  griefercounter = 0;
  for (i=0; i < playerlist.length; i++){
    if (playerlist[i].name == '123' && playerlist[i].time <= 1200) griefercounter++;
  }
  console.log(griefercounter);
}

//initial server state
getState();

//Loop every 5 minutes
var requestLoop = setInterval(function(){
  //refresh the server state
  getState();
  //check for playercount. If too many online, send an alarm.
  var date = new Date();
  var hour = date.getHours();
  //If daytime 
  if (2 < hour && hour < 8){
    if (playerlist.length >= maxnightplayeralarm){
      client.channels.get(alarmchannelid).send('@everyone Warning, its night and there are more than '+ maxnightplayeralarm + ' players online!');
    }                     
  }
  //if nighttime (3Uhr - 9Uhr)
  else {
    if (playerlist.length >= maxplayeralarm){
      client.channels.get(alarmchannelid).send('@everyone Alarm! More than ' + maxplayeralarm + ' players online!');
    }
  }
  //check griefer alarm
  checkGriefer();
  if (griefercounter >= grieferalarm){
      client.channels.get(alarmchannelid).send('@everyone Grieferalarm! There are ' + griefercounter + ' players with the name \"123\" in the past 15 Minutes.');
  }
  //increase the online counter by 5 minutes
  counter+=5;
}, 300000);

//Wait until the Bot is connected
client.on("ready", () => {
  client.user.setGame("Observing Dodo's!");
});

client.on("message", (message) => {
 //help
   if (message.content.startsWith(prefix + "help")) {
    message.author.send("\"!playercount\" sends the number of online players \n" +
    "\"!playerlist\" sends the list of online players \n" + 
    "\"!alarm\" shows the current alarm config \n" +
    "\"!setalarm X Y Z\" sets the alarm for: \n" +
    "X maximum Players at day. \n" +
    "Y maximum Players at night. \n" +
    "Z maximum Players with name \"123\" logged in the past 15 minutes."
  );
  }
  //Ping Pong
  if (message.content.startsWith(prefix + "ping")) {
     message.channel.send('pong.');
  }
  //PlayerCount
  if (message.content.startsWith(prefix + "playercount")) {
    message.channel.send('There are ' + playerlist.length + '/70 Players online.');
  }
  //PlayerList
  if (message.content.startsWith(prefix + "playerlist")) {
    printPlayerlist();
    message.channel.send('Current Players: \n' + prettyplayerlist);
  }
  //Configure Alarm
  if (message.content.startsWith(prefix + "setalarm")) {
    
      let [maxplayer, maxnightplayer, griefer] = message.content.split(/\s+/g).slice(1);
      if (maxplayer < 101 && maxnightplayer < 101 && griefer < 101){
      maxplayeralarm = maxplayer;
      maxnightplayeralarm = maxnightplayer;
      grieferalarm = griefer;
      message.channel.send('Daytime Alarm set to ' + maxplayer + ' Players.\nNighttime Alarm set to ' + maxnightplayer + ' Players.\nGriefer Alarm starts at ' + griefer + ' Players with name \"123\".' );
      } else {
        message.channel.send('Please type in a valid numbers (<100) e.g. !setalarm 15 5 3');
      }
    }
  
  //show Alarm Config
  if (message.content.startsWith(prefix + "alarm")) {
    message.channel.send('Current Daytime Alarm set to ' + maxplayeralarm + ' Players.\nNighttime Alarm set to ' + maxnightplayeralarm + ' Players.\nGriefer Alarm starts at ' + grieferalarm + ' Players with name \"123\".');
  }
});

