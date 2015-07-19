var hapi = require('hapi'),
      app = new hapi.Server(),
      colors = require('colors'),
      port = 80;

app.connection({ port: port });

app.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: __dirname
        }
    }
});

app.start(function() {
    console.log('Server running at\n  => ' + colors.green('http://localhost:' + port) + '\nCTRL + C to shutdown');
});

var io = require('socket.io').listen(app.listener);
var users = new Object();
var connections = 0;

io.sockets.on('connection', function(socket){
    var me = false;

    for (var k in users){
            socket.emit('newusr', users[k]);
    };

    connections++;
    io.sockets.emit('numusr', connections);

    // Login
    socket.on('login', function(user){
       me = user;
       socket.emit('logged', socket.id);
       users[socket.id] = me;
       io.sockets.emit('newusr', me);
       console.log('New user :' + colors.cyan(me.name));
    });

    // Invitation
    socket.on('invite', function(dest){
        io.sockets.connected[dest.id].emit('game-asked', me);
    });

    socket.on('game-accepted', function(game){
            // Set starter
            if (setStarter() == '1'){
              game.playerone.mark = 'x'
              game.playertwo.mark = 'o'
            }else{
              game.playerone.mark = 'o'
              game.playertwo.mark = 'x'
            }
            io.sockets.connected[game.playerone.id].emit('game-accepted', game);
            io.sockets.connected[game.playertwo.id].emit('game-accepted', game);
    });

    socket.on('game-click', function(game){
            io.sockets.connected[game.oppenent.id].emit('game-click', game.sq);
            io.sockets.connected[game.sender.id].emit('game-click', game.sq);
    });


    // Set starter
    var setStarter =function () {
        var chars = '12';
        var stringLength = 1;
        var randomstring = '';
        for(var i = 0; i < stringLength; i++) {
          var rnum = Math.floor(Math.random() * chars.length);
          randomstring += chars.substring(rnum, rnum + 1);
        }

        return randomstring;
    }

    // Disconnect
    socket.on('disconnect', function(){
        connections = connections - 1;
        io.sockets.emit('numusr', connections);
        if(!me){
            return false;
        }
       delete users[me.id];
       console.log('Disconnect user :' + colors.blue(me.name));
       io.sockets.emit('disusr', me);
    });


});
