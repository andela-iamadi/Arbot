
var Slack = require('slack-client');
 
var token = 'xoxb-6103676707-IVR4RQx4iWLuaIkhTNNRuc4w';
 
var slack = new Slack(token, true, true);
 
slack.on('open', function () {
    var channels = Object.keys(slack.channels)
        .map(function (k) { return slack.channels[k]; })
        .filter(function (c) { return c.is_member; })
        .map(function (c) { return c.name; });
 
    var groups = Object.keys(slack.groups)
        .map(function (k) { return slack.groups[k]; })
        .filter(function (g) { return g.is_open && !g.is_archived; })
        .map(function (g) { return g.name; });
 
    console.log('Hi there! Welcome to Slack. You are ' + slack.self.name + ' of ' + slack.team.name);
 
    if (channels.length > 0) {
        console.log('You are in: ' + channels.join(', '));
    }
    else {
        console.log('You are not in any channels.');
    }
 
    if (groups.length > 0) {
       console.log('As well as: ' + groups.join(', '));
    }
    //console.log('Would you like to hire me as your personal Accountant? \n\nSend me a "Yes" if you love the idea. \n\nOr a "help" to get started');
});
 
slack.login();


slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
 
    if (isDirect(slack.self.id, message.text) && message.type === 'message' || message.type === 'edit') {  
        var trimmedMessage = message.text.substr(makeMention(slack.self.id).length).trim();
        
        var onlineUsers = getOnlineHumansForChannel(channel)
            .filter(function(u) { return u.id != user.id; })
            .map(function(u) { return makeMention(u.id); });
        
        channel.send(onlineUsers.join(', ') + '\r\n' + user.real_name + 'said: ' + trimmedMessage);
    }
});

var makeMention = function(userId) {
    return '<@' + userId + '>';
};
 
var isDirect = function(userId, messageText) {
    var userTag = makeMention(userId);
    return messageText &&
           messageText.length >= userTag.length &&
           messageText.substr(0, userTag.length) === userTag;
};

var getOnlineHumansForChannel = function(channel) {
    if (!channel) return [];
     return (channel.members || [])
        .map(function(id) { return slack.users[id]; }
        .filter(function(user) { return !!user && !user.is_bot && user.presence === 'active'; })
    );
};