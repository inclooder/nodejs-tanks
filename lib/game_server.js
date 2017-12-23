var _ = require('underscore')
var Vector = require('./vector')
var math = require('./math')
var process = require('process')


var getTimeMs = function(){
    var NS_PER_SEC = 1e9
    var time = process.hrtime() 
    return (time[0] * NS_PER_SEC + time[1]) / 1000000
}

module.exports = function(io) {
    var players = [];

    io.on('connection', function(client){
        var id = client.id;
        var log = function(msg){
            console.log("[" + id + "] " + msg);
        }
        log('player joined');
        var player = {
            client: client,
            pos: new Vector(500, 500),
            speed: 1,
            rotation: 0,
            aim: {
                x: 0,
                y: 0
            },
            gun: {
                rotation: 0
            },
            keysTable: {},
        };
        players.push(player);
        client.on('disconnect', function(){
            log('player disconnected');
        });
        client.on('key_pressed', function(key){
            player.keysTable[key] = true;
            log("key pressed: " + key);
        });
        client.on('key_released', function(key){
            player.keysTable[key] = false;
            log("key released: " + key);
        });
        client.on('mouse_position', function(position){
            player.aim.x = position.x;
            player.aim.y = position.y;
        });
        client.on('set_name', function(playerName){
            player.name = playerName;
        });
    });

    var forwardSpeedFactor = 0.3
    var backwardSpeedFactor = 0.1
    var oldClientData = {};
    var lastClientUpdate = getTimeMs()

    var updateServer = function(){
        players = _.filter(players, function(player){
            return player.client.connected;
        });
        _.each(players, function(player, i){
            var directionVector = new Vector(0, -1).normalize().rotate(player.rotation);
            var keysTable = player.keysTable;

            if(keysTable['ArrowUp'] || keysTable['w']) {
                player.pos = player.pos.add(directionVector.mul(forwardSpeedFactor));
            } 
            if(keysTable['ArrowDown'] || keysTable['s']) {
                player.pos = player.pos.add(directionVector.negate().mul(backwardSpeedFactor));
            } 
            if(keysTable['ArrowRight'] || keysTable['d']) {
                player.rotation += 0.1;
            } 
            if(keysTable['ArrowLeft'] || keysTable['a']) {
                player.rotation -= 0.1;
            } 
            player.gun.rotation = math.getAngleBetweenTwoPoints(player.pos, player.aim);
        });

        var clientData = _.map(players, function(player){
            var data = {
                id: player.client.id,
                x: player.pos.x,
                y: player.pos.y,
                name: player.name,
                rotation: player.rotation,
                gun: player.gun
            }
            return JSON.parse(JSON.stringify(data))
        });
        if(!_.isEqual(oldClientData, clientData)) {
            var timeDiff = getTimeMs() - lastClientUpdate
            if(timeDiff > 30) {
                io.emit('update_client', clientData)
                lastClientUpdate = getTimeMs()
                oldClientData = clientData;
            }
        }
    }

    setInterval(updateServer, 1);
}
