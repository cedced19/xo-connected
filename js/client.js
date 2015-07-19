(function($) {

    var socket = io.connect(window.location.host);
    var currentusr = {ongame: false};
    var xo = 'x';
    var currentopponent = {id: false};

    // Square
    var one = $('#sq-1'),
     two = $('#sq-2'),
     three = $('#sq-3'),
     four = $('#sq-4'),
     five = $('#sq-5'),
     six = $('#sq-6'),
     seven = $('#sq-7'),
     eight = $('#sq-8'),
     nine = $('#sq-9');

    // Login
     $('#loginform').submit(function(event) {
         event.preventDefault();

         if($('#name').val() == '') {
          displayError('You must enter a name');
         }else{
           socket.emit('login', {name: $('#name').val(), id: socket.id});
           noneError();
         };
         return false;
    });

     // Logged
     socket.on('logged', function(id) {
          currentusr.name = $('#name').val();
          currentusr.id = id;
          $('#table-player').css('display', 'block');
          $('#jumbotron-login').remove();
     });

     socket.on('newusr', function(user) {
          var item = $('<tr>').attr('id', user.id);

          if (user.name == currentusr.name) {

              $('<td>').text('Me').appendTo(item);
              $('<td>').appendTo(item);

          }else{

              // Ask btn
              $('<td>').text(user.name).appendTo(item);
              var askContainer  = $('<td>');
              var ask = $('<button>').text('Invite').addClass('btn btn-primary').attr('type', 'button').attr('id', user.id + '-ask').appendTo(askContainer);
              askContainer.appendTo(item);

              ask.click(function() {
                if (currentusr.ongame) {
                  displayError('You are on game!');
                }else{
                  noneError();
                  ask.css('display', 'none');
                  socket.emit('invite', {id: user.id});
                }
              });
          }

          $('<td>').attr('id',  user.id + '-acceptcontainer').appendTo(item);

          item.appendTo('#players');
     });

     //Invitation
     socket.on('game-asked', function(oppenent) {
            var accept = $('<button>').text('Accept').addClass('btn btn-accept').attr('id', oppenent.id+'-accept').attr('type', 'button');
            accept.appendTo('#'+oppenent.id+'-acceptcontainer');

            accept.click(function() {
              if (currentusr.ongame) {
                displayError('You are on game!');
              }else{
                  $('#'+oppenent.id+'-accept').remove();
                  socket.emit('game-accepted', {playerone: oppenent,playertwo: currentusr});
              }
            });
      });




      socket.on('game-accepted', function(game) {
        noneError();
          $('#jumbotron-play').css('display',  'block');
          currentusr.ongame = true;
          // Set starter
          if (currentusr.id == game.playerone.id) {
            currentusr.mark = game.playerone.mark;
            currentopponent = game.playertwo;
          }else{
            currentusr.mark = game.playertwo.mark;
            currentopponent = game.playerone;
          }
          if (currentusr.mark == xo) {
            displayInfo("It's your turn and you have 'X'.");
          }else{
            displayInfo("It's not your turn and you have 'O'.");
          }
      });


     // Disconnection
     socket.on('disusr', function(user) {
            $('#'+user.id).remove();
            if (user.id == currentopponent.id) {
                displayError('Your oppenent has left.');
                noneInfo();
                reset();
            }
     });

     // Error reception
      socket.on('logerr', function(error) {
          displayError(error);
      });


     // Display error
     function displayError(error) {
      if (error != '[object HTMLParagraphElement]') {
       $("#error").text(error);
      }
     }

     // Clean error
     function noneError() {
       $("#error").text('');
     }

    // Display info
     function displayInfo(info) {
      if (info != '[object HTMLParagraphElement]') {
       $("#info").text(info);
      }
     }

     // Clean info
     function noneInfo() {
       $("#info").text('');
     }

    // Display number of users actualy on this page
    socket.on('numusr', function(number) {
        if(number == 1) {
            $('#users').text("You're alone!");
        }else{
            $('#users').text('There are ' + number + ' users on this page!');
        }
    });



    // Mark reception
    socket.on('game-click', function(sq) {
      sq = $('#sq-' + sq);
        if(xo == 'x') {
          sq.text('X');
          xo = 'o';
          sq.css('color','#27ae60');
        }else{
          sq.text('O');
          sq.css('color','#f1c40f');
          xo = 'x';
        }
        if (currentusr.mark == xo) {
            displayInfo("It's your turn and you have '" + currentusr.mark.toUpperCase() +"'.");
            noneError();
        }else{
            displayInfo("It's not your turn.");
        }
        if(checkWin('O')) {
            if (currentusr.mark  == 'o') {
                displayInfo('You are the winner!');
            }else{
                displayInfo('You are the loser!');
            }
            reset();
        }
        if(checkWin('X')) {
            if (currentusr.mark  == 'x') {
                displayInfo('You are the winner!');
            }else{
                displayInfo('You are the loser!');
            }
            reset();
        }
        if (checkCompleted()) {
            displayInfo('There are no winner.');
            reset();
        }

    });

    //Mark
    function mark(sq) {
      if(currentusr.mark != xo) {
         displayError("It's not your turn.");
      }else{
        if($('#sq-' + sq).text() == '') {
          socket.emit('game-click', {sq: sq, oppenent: currentopponent, sender: currentusr});
          noneError();
        }else{
          displayError('Invalid move.');
        }
      }
  }

  one.click(function() {
    mark('1');
  });
  two.click(function() {
    mark('2');
  });
  three.click(function() {
    mark('3');
  });
  four.click(function() {
    mark('4');
  });
  five.click(function() {
    mark('5');
  });
  six.click(function() {
    mark('6');
  });
  seven.click(function() {
    mark('7');
  });
  eight.click(function() {
    mark('8');
  });
  nine.click(function() {
    mark('9');
  });



  // Check Win
  var checkWin = function (mark) {
      if (one.text() == mark && two.text() == mark && three.text() == mark) {
        return true;
      }
      if (four.text() == mark && five.text() == mark && six.text() == mark) {
        return true;
      }
      if (seven.text() == mark && eight.text() == mark && nine.text() == mark) {
        return true;
      }
      if (one.text() == mark && four.text() == mark && seven.text() == mark) {
        return true;
      }
      if (two.text() == mark && five.text() == mark && eight.text() == mark) {
        return true;
      }
      if (three.text() == mark && six.text() == mark && nine.text() == mark) {
        return true;
      }
      if (one.text() == mark && five.text() == mark && nine.text() == mark) {
        return true;
      }
      if (three.text() == mark && five.text() == mark && seven.text() == mark) {
        return true;
      }
      return false;
  }

  // Reset
  var reset = function () {
    $('#playzone > *').text('');
    $('#'+currentopponent.id+'-accept').remove();
    $('#'+currentopponent.id+'-ask').css('display', 'block');
    currentopponent = '';
    currentusr.ongame = false;
    $('#jumbotron-play').css('display', 'none');
    xo = 'x';
  }

  // Grid completed
  var checkCompleted = function () {
    if (one.text() != '' && two.text() != '' && three.text() != '' && four.text() != '' && five.text() != '' && six.text() != '' && seven.text() != '' && eight.text() != '' && nine.text() != '') {
        return true;
      }
    return false;
  }

})(jQuery);
