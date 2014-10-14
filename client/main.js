var app = {

  flipped: false,

  time: 0,

  storage: [],
  // connect to new firebase Database
  dB: new Firebase('https://blinding-torch-85.firebaseio.com/'),


  pickOutTask: function(time, callback) {
    // takes in time requirement and (eventually) whether deadlines are desired or not
    app.fetch(function(results){
    var found = false;

      for (var key in results) {

        if (parseInt(results[key].time) <= time) {
          callback(results[key]);
          found = true;
        }
      }
      if (!found) {
        console.log("sorry, we were unable to find the right task. try yoga")
        // then call something the deliver the news
      }
    });

  },

  getTask: function(time){
    app.pickOutTask(time, function(taskObj){
      if (app.flipped) {
        app.storage.push(taskObj);
      } else {
        //flip circle
        $('.circleStuff').toggle();
        $('.sugg').toggle();

        var task = "<h4 style='text-align: center;'>" + taskObj.task + "<p>" + "for " + taskObj.time + " minutes" + "</p>" + "</h4>";

        $('.suggestion').empty();
        $('.suggestion').append(task);
        app.flipped = true;
      }

    })
  },

  getAnother: function(){

    if (app.storage.length >= 1) {
      // draw from the storage instead of getting more.
      var taskObject = app.storage.pop();
      var task = "<h4 style='text-align: center;'>" + taskObject.task + "<p>" + "for " + taskObject.time + " minutes" + "</p>" + "</h4>";
      $('.suggestion').empty();
      $('.suggestion').append(task);
    } else {
      // send a message to let the user know that they've gone thorugh all their tasks and now it will repeat.
      // var msg = "<h4 style='text-align: center;'></h4>";
      // $('.suggestion').empty();
      // $('.suggestion').append(msg);
      app.done = false;
      app.getTask(app.time);
    }
  },

  removeTask: function(task){
    //query DB and take out indicated task.
    // do this later, lazy pants
  }

  addTask: function(){
    var task = {};

    task.task = $('#taskDescription').val();
    task.time = $('#time').val();
    task.deadline = $('#deadline').val();

    // push task data to Firebase database
    app.dB.push(task);
  },

  fetch: function(callback){
    app.dB.once('value', function(snapshot){
      // (snapshot.val());
      // return an array of object results. or something.
      callback(snapshot.val());
    })

  },

  // opens and closes entry box
  toggleBox: function(target){
    if ( parseInt(target.css('height')) === 120 ) {
      target.animate({height: '450'});
    } else {
      target.animate({height: '120'});
    }
    $('.taskInput').toggle();

    $(".protect").click(function(e) {
      e.stopPropagation();
    });
  }
};

  ////////////////////////////
 //click binding functions://
////////////////////////////

$(document).ready(function(){

  $('.minForm').submit(function(event){
    event.preventDefault();
    app.time = $('.minutes').val();
    app.getTask(app.time);
    $('.minutes').val('');

  })

  $('#top').on('click', function(){
      app.toggleBox($(this));
  })

  // $('#middle').on('click', function(){
  // })

  $('#bottom').on('click', function(){
    console.log('this does nothing yet');
  })

  $('#time').on('click', function(){
    $(this).val('')
  })

  $('.taskButton').on('click', function(){
    app.addTask();
    $('#taskDescription').val('');
    $('#time').val('');
    app.toggleBox($('#top'));
  })

  $('.reject').on('click', function(e){
    e.preventDefault();
    app.getAnother();
  })

  console.log('toggling circlestuff')
  $('circleStuff').toggle();

});
