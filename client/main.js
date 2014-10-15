var app = {

  flipped: false,

  time: 0,

  storage: [],

  // connect to new firebase Database
  fireBase: new Firebase('https://blinding-torch-85.firebaseio.com/').child('whatNowUsers'),

  authenticated: false, // I'm pretty sure this is not needed

  init: function(){
    app.auth();
  },

  auth: function(){

    var authData = app.fireBase.getAuth();

    if (authData) {
      $('.auth').toggle();
      $('.logout').toggle();
      // put name here
      console.log('its all good, you are signed in', authData.github.displayName);
    } else {
      console.log('no authData, loginRedirect');

      //prompt user to login
      if (!app.authenticated) {

        //this is very definitely in the wrong place
        $('.auth').toggle();
        $('.login').toggle();
        app.fireBase.authWithOAuthRedirect("github", function(err) {
          if (err) {
            console.log('whoops there was an error with github OAuth', err);
          } else {
            console.log('redirect successful');
            app.authenticated = true;
          }
        })

      } else {
        console.log('already redirected once, now I will stop messing with with you');
      }
      console.log('will this ever print? ln 47');
    }
  },


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
        alert('Sorry, you do not have any tasks in your queue! Try adding some. Or try Yoga.');
        console.log("sorry, we were unable to find the right task. try yoga");
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

      // app.done = false;
      app.getTask(app.time);
    }
  },

  removeTask: function(task){
     // query fireBase and take out indicated task.
    // do this later, I'm lazy pants
  },

  addTask: function(){

    var allUserData = new Firebase("https://blinding-torch-85.firebaseio.com/whatNowUsers");

    var task = {};

    task.task = $('#taskDescription').val();
    task.time = $('#time').val();
    task.deadline = $('#deadline').val();

    // get authData
    var authData = app.fireBase.getAuth();

    if (authData) {
      // if child node for user does not exist, it is created. Then task is pushed in.
      allUserData.child(authData.uid).push(task);

    } else {
      app.auth();
    }
  },

  fetch: function(callback){
    // get auth data
    var authData = app.fireBase.getAuth();

    app.fireBase.child(authData.uid).once('value', function(snapshot){
      // return an array of object results
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

  //addTask bindings

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

  // auth buttons that do exactly the same thing

  $('.login').on('click', function(){
    app.auth();
  })

  $('.signup').on('click', function(){
    app.auth();
  })

  $('.logout').on('click', function(e){
    e.preventDefault();
    console.log('prevents default')
    $('.logout').toggle();
    $('.auth').toggle();
    app.fireBase.unauth();
    console.log('toggles done, unauthed')
  })


  // other buttons

  $('.reject').on('click', function(e){
    e.preventDefault();
    app.getAnother();
  })

  $('#middle').on('click', function(){
    console.log('this also does nothing yet');
  })

  $('#bottom').on('click', function(){
    console.log('this does nothing yet');
  })

  // initializing junk

  $('circleStuff').toggle();
  $('.logout').toggle();

});