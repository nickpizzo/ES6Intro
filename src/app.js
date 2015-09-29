;(function() {
  let Game = function(canvasId) {
    let canvas = document.getElementById(canvasId);
    let screen = canvas.getContext('2d');
    let gameSize = { x: canvas.width, y: canvas.height};

    this.bodies = createInvaders(this).concat(new Player(this, gameSize));

    let self = this;
    let tick = function() { //all main gaime logic
      self.update();
      self.draw(screen, gameSize);
      requestAnimationFrame(tick);
    };

    tick();
  };

  Game.prototype = {
    update: function() {
      let bodies = this.bodies;
      let notCollidingWithAnything = function(b1) {
        return bodies.filter(function(b2) { return colliding(b1, b2); }).length === 0;
      }
      this.bodies = this.bodies.filter(notCollidingWithAnything);
      for (let i = 0; i < this.bodies.length; i++) {
        this.bodies[i].update();
      }
    },

    draw: function(screen, gameSize) {  //main draw function
      screen.clearRect(0, 0, gameSize.x, gameSize.y);
      for (let i = 0; i < this.bodies.length; i++) {
        drawRect(screen, this.bodies[i]);
      }
    },
    addBody: function(body) {
      this.bodies.push(body);
    },

    invadersBelow: function(invader) {
      return this.bodies.filter(function(b) {
        return b instanceof Invader &&
          b.center.y > invader.center.y &&
          b.center.x - invader.center.x < invader.size.x;
      }).length > 0;

    }
  };

  let Player = function(game, gameSize) { //constructor function
    this.game = game; //
    this.size = { x: 15, y: 15 }; //player size
    this.center = { x: gameSize.x / 2, y: gameSize.y - this.size.x }; //where player is at the moment
    this.keyboarder = new Keyboarder();
  };

  Player.prototype = {
    update: function() {
      if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
        this.center.x -=2;
      } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
        this.center.x +=2;
      }

      if (this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)) {
        let bullet = new Bullet({ x: this.center.x, y: this.center.y - this.size.y - 10 },
                                { x: 0, y: -7});
        this.game.addBody(bullet);
      }
    }
  };

  let Invader = function(game, center) { //constructor function
    this.game = game; //
    this.size = { x: 15, y: 15 }; //player size
    this.center = center;
    this.patrolX = 0;
    this.speedX = 0.3;
  };

  Invader.prototype = {
    update: function() {
      if (this.patrolX < 0 || this.patrolX > 40) {
        this.speedX = -this.speedX;
      }

      this.center.x += this.speedX;
      this.patrolX += this.speedX;

      if (Math.random() > .0795 && !this.game.invadersBelow(this)) {
        let bullet = new Bullet({ x: this.center.x, y: this.center.y + this.size.y / 2 },
                                { x: Math.random() - 0.5, y: 2 });
        this.game.addBody(bullet);

      }
    }
  };

  let createInvaders = function(game) {
    let invaders = [];
    for (let i = 0; i < 24; i++) {
      let x = 30 + (i % 8) * 30;
      let y = 30 + (i % 3) * 30;
      invaders.push(new Invader(game, { x: x, y: y }));
    }
    return invaders;
  }

  let Bullet = function(center, velocity) { //constructor function
    this.size = { x: 3, y: 3 }
    this.center = center;
    this.velocity = velocity;
  };

  Bullet.prototype = {
    update: function() {
        this.center.x += this.velocity.x;
        this.center.y += this.velocity.y;
    }
  };



  let drawRect = function(screen, body) {             //used to draw bullets and invaders
    screen.fillRect(body.center.x - body.size.x / 2,
                    body.center.y - body.size.y / 2,
                    body.size.x, body.size.y);
  };

  let Keyboarder = function() {
      let keyState = {};

      window.onkeydown = function(e) {
        keyState[e.keyCode] = true;
      };

      window.onkeyup = function(e) {
        keyState[e.keyCode] = false;
      };

      this.isDown = function(keyCode) {
        return keyState[keyCode] === true;
      };

      this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
  };

  let colliding = function(b1, b2) {
    return !(b1 === b2 ||
      b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
      b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
      b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
      b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2);
  }

  window.onload = function() {
    new Game("screen");
  };
})();
