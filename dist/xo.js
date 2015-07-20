#!/usr/bin/env node
'use strict';
var hapi = require('hapi'),
      app = new hapi.Server(),
      colors = require('colors'),
      program = require('commander'),
      pkg = require('./package.json'),
      port = 7776;

program
  .version(pkg.version)
  .option('-p, --port [number]', 'specified the port')
  .parse(process.argv);

app.connection({ port: port });

app.route({
    method: 'GET',
    path: '/vendor/{param*}',
    handler: {
        directory: {
            path: __dirname + '/vendor/'
        }
    }
});

app.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.file(__dirname + '/index.html');
    }
});


app.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: function (request, reply) {
        reply.file(__dirname + '/favicon.ico');
    }
});

app.start(function() {
    require('check-update')({packageName: pkg.name, packageVersion: pkg.version, isCLI: true}, function(err, latestVersion, defaultMessage){
        if(!err){
            console.log(defaultMessage);
        }
    });
    console.log('Server running at\n  => ' + colors.green('http://localhost:' + port) + '\nCTRL + C to shutdown');
});

var io = require('socket.io').listen(app.listener),
      users = {},
      connections = 0;

io.sockets.on('connection', function(socket){
    var me = false;

    for (var k in users){
            socket.emit('newusr', users[k]);
    }

    connections++;
    io.sockets.emit('numusr', connections);

    socket.on('login', function(user){
       me = user;
       socket.emit('logged', socket.id);
       users[socket.id] = me;
       io.sockets.emit('newusr', me);
    });

    socket.on('invite', function(dest){
        io.sockets.connected[dest.id].emit('game-asked', me);
    });

    socket.on('game-accepted', function(game){
            // Set starter
            if (Math.random() < 0.5){
              game.playerone.mark = 'x';
              game.playertwo.mark = 'o';
            }else{
              game.playerone.mark = 'o';
              game.playertwo.mark = 'x';
            }
            io.sockets.connected[game.playerone.id].emit('game-accepted', game);
            io.sockets.connected[game.playertwo.id].emit('game-accepted', game);
    });

    socket.on('game-click', function(game){
            io.sockets.connected[game.oppenent.id].emit('game-click', game.sq);
            io.sockets.connected[game.sender.id].emit('game-click', game.sq);
    });

    socket.on('disconnect', function(){
        connections--;
        io.sockets.emit('numusr', connections);
        if(!me){
            return false;
        }
       delete users[me.id];
       io.sockets.emit('disusr', me);
    });


});
