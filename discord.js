var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var request = require('request');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.Discord_token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var summonerName = args[1]

        args = args.splice(1);
        switch(cmd) {
            // !ping
            case '티어':
                getTier(summonerName,channelID);
                break;
            case '사용법':
                bot.sendMessage({to:channelID,message: " '!티어 소환사이름'을 입력하시면 소환사의 정보를 반환합니다. 아직 예외처리를 해 두지 않아 에러가 나면 중지됩니다."})
                break;
            // Just add any case commands if you want to..
         }
     }
});
var getTier = function(name,channelID)
{
    var temp_url = "https://kr.api.riotgames.com/lol/summoner/v3/summoners/by-name/"+name+"?api_key="+auth.riot_token;
    let url = encodeURI(temp_url)
    request(url,  (err, res, body) => {
      if(body == "[]")
      {
          bot.sendMessage({
              to: channelID,
              message : "Id 정보 API를 가져오는데 에러가 발생했습니다."
          });
      }else{
          let json = JSON.parse(body);
          let id = json.id
          console.log(json)
          let tmp_tierurl = "https://kr.api.riotgames.com/lol/league/v3/positions/by-summoner/"+id+"?api_key="+auth.riot_token;
          let tierurl = encodeURI(tmp_tierurl)
          request(tierurl,(err, res, body) =>{
            if(body =='[]'){
              bot.sendMessage({
                  to: channelID,
                  message : "티어 정보 API를 가져오는데 에러가 발생했습니다."
              });
            }else{
              let json_tier = JSON.parse(body)[0]
              console.log(json_tier)
              let tier = json_tier.tier
              let rank = json_tier.rank
              bot.sendMessage({
                  to: channelID,
                  message : "티어는 " + tier +" " + rank + " 입니다."});
            }
          });
      }
    });
}
