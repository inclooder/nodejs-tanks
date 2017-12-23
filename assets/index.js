var onDocumentReady = function(fn){
    if(document.readyState === 'complete') {
        return fn();
    }
    document.addEventListener('DOMContentLoaded', fn, false);
}


onDocumentReady(function(){
    var playerName = prompt("What is your name?");
    if(playerName.length > 10 || playerName.length < 4) {
        alert("Not today!");
        playerName = prompt("What is your name?");
    }
    var socket = io();

    socket.emit('set_name', playerName);

    var whiteboard = document.getElementById('whiteboard');
    var canvas = whiteboard.querySelector('canvas');
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    var tank = {
        width: 20,
        height: 30
    }
    var aim;
    var players = {};

    var updateCanvasSize = function(){
        if(width != whiteboard.clientWidth || height != whiteboard.clientHeight) {
            width = whiteboard.clientWidth;
            height = whiteboard.clientHeight;
            canvas.width = width;
            canvas.height = height;
        }
    }

    setTimeout(updateCanvasSize, 500);

    var keysWhitelist = [
        'ArrowUp',
        'ArrowDown',
        'ArrowRight',
        'ArrowLeft',
        'w', 'a', 's', 'd'
    ];

    document.addEventListener('keydown', function(event){
        if(keysWhitelist.includes(event.key)) {
            socket.emit('key_pressed', event.key);
        }
    }, false);

    document.addEventListener('keyup', function(event){
        if(keysWhitelist.includes(event.key)){
            socket.emit('key_released', event.key);
        }
    }, false);

    canvas.addEventListener('mousemove', function(event){
        _.throttle(function(){
            socket.emit('mouse_position', {
                x: event.clientX,
                y: event.clientY
            });
        }, 500)();
        aim = {
            x: event.clientX,
            y: event.clientY
        }
    });

    socket.on('update_client', function(data){
        players = data;
    });

    var drawBackground = function(){
        ctx.fillStyle = '#385054';
        ctx.fillRect(0, 0, width, height);
    }

    var drawAimCross = function(aim){
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.arc(aim.x, aim.y, 20, 0, 2 * Math.PI);
        ctx.stroke();
    }

    var drawPlayerGun = function(player){
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.gun.rotation * Math.PI / 180);

        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        ctx.moveTo(0, 0);
        ctx.lineTo(20, 0);
        ctx.stroke();
        ctx.restore();
    }

    var drawPlayer = function(player){
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'orange';
        // ctx.arc(player.x, player.y, 5, 0, 2 * Math.PI);
        ctx.translate(player.x, player.y);
        ctx.rotate(player.rotation * Math.PI / 180);
        ctx.strokeRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);
        ctx.restore();


        //Draw player name
        ctx.fillStyle = "black";
        ctx.font = "bold 10px Arial";
        var text_width = ctx.measureText(player.name).width;
        ctx.fillText(player.name, player.x - (text_width / 2), player.y - 20);

        //Draw gun
        drawPlayerGun(player);
    }

    var render = function(){
        drawBackground();

        _.each(players, function(player){
            drawPlayer(player);
        });
        if(aim !== undefined) {
            drawAimCross(aim);
        }

//         ctx.beginPath();
//         ctx.moveTo(player.x, player.y);
//         ctx.lineTo(player.aim.x, player.aim.y);
//         ctx.strokeStyle = 'red';
//         ctx.stroke();

        requestAnimationFrame(render);
    }


    requestAnimationFrame(render);
});


