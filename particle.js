$(function() {
  controller = new Controller(function() {

    function getHeartPoint(angle) {
      var t = angle / Math.PI;
      var x = 15 * (16 * Math.pow(Math.sin(t), 3));
      var y = - 15 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      return new Vector(innerWidth / 2 + x, 300 + y);
    }
  
    var hearts = [];
    var draw = true;
  
    for (var angle = 10; angle < 30; angle += 0.2) {
      var vector = getHeartPoint(angle);
      draw = true;
  
      for (var i = 0; i < hearts.length; i++) {
        var dx = vector.x - hearts[i].position.x;
        var dy = vector.y - hearts[i].position.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
          console.log("%f",distance)
        if (distance < 5) {
          draw = false;
          break;
        }
      }

      if (draw) {
          hearts.push(new Emitter(vector, new Vector(0, 1)))
      }  
    }
    this.emitters = hearts;
  });
  controller.init();
  controller.animate();
});

Particle = (function() {
  function Particle(point, velocity) {
    this.position = point;
    this.velocity = velocity;
    this.acceleration = new Vector();
    this.color = [66,167,222];
  }
  Particle.baseColor = [66, 167, 222];

  Particle.prototype.move = function() {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  
  // 处理力场对点的影响
  Particle.prototype.submitToField = function(fields) {
    for (i = 0; i < fields.length; i++) {
      var field = fields[i];
      var dx = this.position.x - field.position.x;
      var dy = this.position.y - field.position.y;

      // calculate acceleration in axis-x and y
      // assume m = 1
      var df = field.mass / Math.pow((dx * dx + dy * dy), 1.5);
      this.acceleration.x += dx * df;
      this.acceleration.y += dy * df;
    }
  }

  Particle.prototype.colorVariable = function() {
    var velocity = this.velocity.getMagnitude();
    this.color[0] = Particle.baseColor[0] * 0.8 * velocity;
    this.color[2] = Particle.baseColor[2] * .5 / velocity;
    if (this.color[0] > 255) 
      this.color[0] = 255;
  }

  Particle.prototype.updateColor = function() {};

  return Particle
})();

Emitter = (function() {
  function Emitter(point, velocity, spread) {
    this.position = point;
    this.velocity = velocity;
    this.angle = this.velocity.getAngle();
    this.spread = spread / 180 * Math.PI || Math.PI / 8;
    this.color = '#999';
  }

  Emitter.prototype.emitParticle = function() {
    var magnitude = this.velocity.getMagnitude();
    var angle = this.angle + (this.spread / 2) - Math.random() * this.spread;
    return new Particle(Vector.copy(this.position), Vector.fromAngle(angle, magnitude));
  }

  return Emitter;
})();

Field = (function() {
  function Field(point, mass) {
    this.position = point;
    this.mass = mass || 100;
  }

  return Field;
})();

Vector = (function() {
  function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0; 
  }

  Vector.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  Vector.prototype.getMagnitude = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  Vector.prototype.getAngle = function() {
    return Math.atan2(this.y, this.x);
  }

  Vector.fromAngle = function(angle, magnitude) {
    return new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
  }

  Vector.copy = function(vector) {
    return new Vector(vector.x, vector.y);
  }

  return Vector;
})();

View = (function() {
  function View(canvas) {
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = $(canvas).width();
    this.height = canvas.height = $(canvas).height();
  }

  View.prototype.drawParticle = function(particle) {
    this.ctx.fillStyle = 'rgb(' + parseInt(particle.color[0]) + ',' + parseInt(particle.color[1]) + ',' + parseInt(particle.color[2]) + ')';
    this.ctx.fillRect(particle.position.x, particle.position.y, 2, 2);
  }

  View.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  View.prototype.drawCircle = function(point) {
    this.ctx.fillStyle = '#FF3C2A';
    this.ctx.fillText("❤", point.x, point.y)
  }

  return View;
})();

Controller = (function() {
  function Controller(pattern) {
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
    this.maxParticles = 100;
    this.emissionRate = 1;
    this.view = new View($('canvas')[0]);
    this.particles = [];
    this.emitters = [];
    this.fields = [];
    if (pattern)
      this.init = pattern;
  }

  Controller.prototype.plotParticles = function(borderX, borderY) {
    var currentParticles = [];
    for (var i = 0; i < this.particles.length; i++) {
      var particle = this.particles[i];
      var pos = particle.position;
      if (pos.x < 0 || pos.y < 0 || pos.x > borderX || pos.y > borderY)
        continue;
      particle.submitToField(this.fields);
      particle.move();
      particle.updateColor();
      currentParticles.push(particle);
      this.view.drawParticle(particle);
    }
    this.particles = currentParticles;
  }

  Controller.prototype.plotCircles = function() {
    for (var i = 0; i < this.emitters.length; i++) {
      var pos = this.emitters[i].position;
      this.view.drawCircle(pos);
    }
    for (var i = 0; i < this.fields.length; i++) {
      var pos = this.fields[i].position;
      this.view.drawCircle(pos);
    }
  }

  Controller.prototype.addNewParticles = function() {
    if (this.particles.length >= this.maxParticles) return;
    for (var i = 0; i < this.emitters.length; i++) {
      for  (var j = 0; j < this.emissionRate; j++) {
        this.particles.push(this.emitters[i].emitParticle());
      }
    }
  }

  Controller.prototype.init = function() {
    var vector = new Vector(this.view.width / 3, this.view.height / 2);
    this.emitters.push(new Emitter(vector, new Vector(1, 0)));

    vector = new Vector(this.view.width / 2, this.view.height / 2);
    this.fields.push(new Field(vector, 1.8));
  }

  Controller.prototype.animate = function() {
    this.addNewParticles();
    this.view.clear();
    this.plotParticles(this.view.width, this.view.height);
    this.plotCircles();
    window.requestAnimFrame(this.animate.bind(this));
  }

  Controller.prototype.bindEvent = function() {
    
  }

  return Controller;
})();