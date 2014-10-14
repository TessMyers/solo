

$(document).ready(function(){
  // all your click handlers etc here

  $('.minForm').submit(function(event){
    event.preventDefault();
    console.log($('.minutes').val())
    $('.minutes').val('');
  })

})