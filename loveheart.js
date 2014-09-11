
var offsetX = $(window).width() / 2;
var offsetY = 130;

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
  
  setTimeout(function() {
    $('#messages').typewriter();
  }, 5500)
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

(function($) {
  $.fn.typewriter = function() {
    this.each(function() {
      var str = $(this).html(), progress = 0;
      var interpunction = 0, count = 0;
      var $ele = $(this);
      $(this).html('').css('display', 'block');;
      var timer = setInterval(function() {
        var current = str.substr(progress, 1);
        if (current == '<') {
          progress = str.indexOf('>', progress) + 1;
        }
        else if (interpunction || current == '。' || current == '，') {
          if (interpunction == 0) {
            progress++;
          }
          interpunction++;
          if (interpunction == 3) {
            interpunction = 0;
          }
        }
        else{
          progress++;
        }
        $ele.html(str.substr(0, progress) + (count++ & 1 ? '_' : ''));
        if (progress >= str.length) {
          clearInterval(timer);
        }
      }, 150);
    });
    return this;
  }
})(jQuery);

function getHeartPoint(angle) {
  var t = angle / Math.PI;
  var x = 7 * (16 * Math.pow(Math.sin(t), 3));
  var y = - 8 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
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
  $('#imissu').fadeIn(5000);
}