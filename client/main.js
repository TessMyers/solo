var app = {

  flipped: false,

  time: 0,

  storage: [],
  // connect to new firebase Database
  fireBase: new Firebase('https://blinding-torch-85.firebaseio.com/').child('whatNowUsers'),

  init: function(){
    app.auth();
  },

  auth: function(){

    var authData = app.fireBase.getAuth();

    if (authData) {
      console.log('its all good, you are signed in');
    } else {
      console.log('no authData, loginRedirect');
      //prompt user to login
      if (!app.authenticated) {

        app.fireBase.authWithOAuthRedirect("github", function(err, authData) {
          if (err) {
            console.log('whoops there was an error', err);
          } else {
            console.log('redirect successful')
            app.authenticated = authData.uid;
          }
        })

      } else {
        console.log('already redirected once, now I will stop fucking with you');
      }
    }
  },

  authenticated: false,

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

    var authData = app.fireBase.getAuth();

    //check if user is authenticated
    if (authData) {
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
    } else {
      //sign in user
      app.auth();
    }
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
    //query fireBase and take out indicated task.
    // do this later, lazy pants
  },

  addTask: function(){

    var allUserData = new Firebase("https://blinding-torch-85.firebaseio.com/whatNowUsers");

    var task = {};

    task.task = $('#taskDescription').val();
    task.time = $('#time').val();
    task.deadline = $('#deadline').val();

    // push task data to Firebase database
    var authData = app.fireBase.getAuth()

    if (authData) {
      // if child node for user does not exist, it is created. Then task is pushed in.
      allUserData.child(authData.uid).push(task);

    } else {
      app.auth();
    }
  },


  fetch: function(callback){
    app.fireBase.child(app.authenticated).once('value', function(snapshot){
      // return an array of object results
      console.log(snapshot.val());
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

  // getting task

  $('.minForm').submit(function(event){
    event.preventDefault();
    app.time = $('.minutes').val();
    app.getTask(app.time);
    $('.minutes').val('');
  })

  $('.clickMe').on('click', function(e){
    //shamelessly repeated code
    event.preventDefault();
    app.time = $('.minutes').val();
    app.getTask(app.time);
    $('.minutes').val('');
  })

  //add task bindings

  $('#top').on('click', function(){
      app.toggleBox($(this));
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

  // auth buttons

  $('.login').on('click', function(){
    app.auth();
  })

  $('.signup').on('click', function(){
    //
  })


  // other buttons

  $('.reject').on('click', function(e){
    e.preventDefault();
    app.getAnother();
  })

  $('#middle').on('click', function(){
  })

  $('#bottom').on('click', function(){
    console.log('this does nothing yet');
  })

  // initializing junk

  $('circleStuff').toggle();

  console.log("changed auth scheme")

  app.init();

});