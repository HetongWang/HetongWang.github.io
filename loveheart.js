
var offsetX = $(window).width() / 2;
var offsetY = 300;

$(function() {
  gardenCanvas = $("canvas")[0];
  gardenCanvas.width = $('canvas').width();
  gardenCanvas.height = $('canvas').height();
  gardenCtx = gardenCanvas.getContext("2d");
  gardenCtx.globalCompositeOperation = "lighter";
  garden = new Garden(gardenCtx, gardenCanvas)

  setTimeout(function() {
    startHeartAnimation();
    heartAnimation();
  }, 1000);
  
});

window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame       || 
         window.webkitRequestAnimationFrame || 
         window.mozRequestAnimationFrame    || 
         window.oRequestAnimationFrame      || 
         window.msRequestAnimationFrame     ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

function getHeartPoint(angle) {
  var t = angle / Math.PI;
  var x = 10.5 * (16 * Math.pow(Math.sin(t), 3));
  var y = - 11 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return new Vector(offsetX + x, offsetY + y);
}

function startHeartAnimation() {
  var interval = 50;
  var angle = 10;
  var heart = [];
  var animation = setInterval(function() {
    var bloom = getHeartPoint(angle);
    var draw = true;
    for (var i = 0; i < heart.length; i++) {
      var p = heart[i];
      var dx = p.x - bloom.x;
      var dy = p.y - bloom.y;
      var dis = Math.sqrt(dx * dx + dy * dy);
      if (dis < Garden.options.bloomRadius.max * 1.3) {
        draw = false;
        break;
      }
    }

    if (draw) {
      heart.push(bloom);
      garden.createRandomBloom(bloom.x, bloom.y);
    }
    if (angle >= 30) {
      clearInterval(animation);
      showMessages();
    }
    else {
      angle += 0.2;
    }
  }, interval);
}

function heartAnimation() {
  garden.render();
  window.requestAnimFrame(heartAnimation);
}

function showMessages() {
  $('h1').fadeIn();
}