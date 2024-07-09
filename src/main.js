//Declare Vars//
//Declare Vars//
//Declare Vars//
//Declare Vars//
//Declare Vars//

import {greet} from './planes.js';
greet("hello")
//Canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.width = window_width;
canvas.height = window_height;
canvas.style.background = "#aee5e6";

//Mouse cursor
//document.body.style.cursor = "none";
var rect = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", handleMouseMove);
var mouse_x;
var mouse_y;

//Click detector
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);

const cloudPack = new Image();
cloudPack.src = "https://i.ibb.co/vVMpdqP/8614580.png";

var imageUrls = [
  "https://i.ibb.co/JxtwGgb/px-Art-1.png",
  "https://i.ibb.co/SRV0M3d/px-Art-2.png",
  "https://i.ibb.co/qJhk5Vf/px-Art-3.png",
  "https://i.ibb.co/PtgH00W/px-Art-4.png",
  "https://i.ibb.co/zRb8czd/px-Art-5.png",
  "https://i.ibb.co/Y2CtJ3c/px-Art-6.png",
  "https://i.ibb.co/djd4QJt/px-Art-1-copy-2.png",
  "https://i.ibb.co/3RcZRk1/px-Art-1-copy.png",
];

//Key press vars
var trottledown = false,
  trottleup = false,
  trottleInterval;
var zoomout = false,
  zoomin = false,
  zoomLevel = 0.09,
  zoomInterval,
  zoomScale = 0.01;
var screenScroll = [0, 0];
var particles = [];
var fireParticles = [];
var firing = false,
  shotCountMax = 100,
  shotCount = 0,
  coolDown = 200,
  ready = 200;
var bullets = [];
let f22;

//Classes//
//Classes//
//Classes//
//Classes//
//Classes//

//Plane Sprite Class
class Player {
  //Declare this.vars
  constructor(
    name,
    x,
    y,
    vx,
    vy,
    angle,
    v,
    liftForce,
    dragForce,
    turnRate,
    thrust,
    thrustRate,
    flipped,
    health
  ) {
    //Basic  Info
    this.name = name;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
    this.v = v;
    this.gravity = 60;

    //Infor for calculations
    this.liftForce = liftForce;
    this.turnRate = turnRate;
    this.thrust = thrust;
    this.brakethrust = 1;
    this.thrustRate = thrustRate;
    this.dragForce = dragForce;
    this.flipped = flipped;
    this.airSpeedAngle = 0;
    this.count = 0;
    this.health = health;
    this.brake = false;
  }
  //Run calc on forces
  updateForces() {
    var v = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    var attack = this.angle - this.airSpeedAngle;

    this.airSpeedAngle = this.angle;
    var bodyDragCoefficient = 0.07;
    var D =
      ((this.dragForce * Math.sin(attack) + bodyDragCoefficient) *
        Math.pow(v, 2)) /
      20;

    //lX = 0 * v * this.liftForce * Math.cos(this.angle - Math.PI / 2) * Math.abs(Math.cos(this.angle - Math.PI / 2)) / 100;
    let inertiaX = Math.floor(this.vx / 1.4);
    let inertiaY = Math.floor(this.vy / 1.4);

    var lY =
      Math.abs(
        v * this.liftForce * Math.pow(Math.sin(this.angle + Math.PI / 2), 2)
      ) / 200;

    if (this.brake && this.brakethrust < this.thrust) {
      this.brakethrust += 1;
    } else if (this.brakethrust > 10) {
      this.brakethrust -= 1;
    }
    console.log(this.brakethrust);
    if (this.brake) {
      this.vx += -this.vx / 10;
      this.vy += -this.vy / 10;
      this.lY = 0;
    }
    var tX = (this.thrust - this.brakethrust) * Math.cos(this.angle) * 2.3;
    var tY = (this.thrust - this.brakethrust) * Math.sin(this.angle) * 2.3;

    this.vx =
      Math.floor((Math.cos(this.angle) * (v - D) + tX + 0) * 10000) / 10000 +
      inertiaX;
    this.vy =
      Math.floor(
        (Math.sin(this.angle) * (v - D) + tY + lY - this.gravity) * 100
      ) /
        100 +
      inertiaY;

    this.x += this.vx;
    this.y += this.vy;
    this.v = v;

    if (this.y <= 10 && this.vy < 0) {
      this.y = 25;
      this.vy = 0;
      this.vx /= 2;
    }

    if ((this.thrust < 100) & (this.brake != true)) {
      //this.thrust += 1
    }
    //particles

    let direct = Math.atan2(Math.floor(this.vy), Math.floor(this.vx)) + Math.PI;
    v = Math.sqrt(this.vx ** 2 + this.vy ** 2);
    //Smoke trail
    particles.push(
      new Trail(
        this.x + Math.cos(this.angle) * -230,
        this.y + Math.sin(this.angle) * -230,
        "rgba(255, 255, 255, 0.5",
        Math.floor(Math.abs(this.v / 30)),
        60,
        this.vx / this.v,
        this.vy / this.v,
        direct,
        120 + Math.abs(Math.sin(this.angle) * 30)
      )
    );

    let distance = 240;
    for (let i = 0; i < 4; i++) {
      flame(
        this.x,
        this.y,
        direct,
        this.v,
        this.vx,
        this.vy,
        distance + Math.random() * 5,
        this.angle
      );
    }

    //particles.push(new Trail(this.x + Math.cos(-this.angle) * -90 - Math.sin(-this.angle) * -10, this.y + Math.sin(-this.angle) * -90 - Math.cos(-this.angle) * 10, 'rgba(252, 98, 3, 0.7', Math.floor(Math.abs(this.v / 32)) , 30, 0, 0, -this.angle + Math.PI));#511a19

    if (firing && shotCount <= shotCountMax && coolDown == ready) {
      if (this.count >= 3) {
        bullets.push(
          new Bullet(
            this.angle,
            15,
            this.x +
              Math.cos(this.angle) * (Math.floor(Math.random() * 101) + 100),
            this.y +
              Math.sin(this.angle) * (Math.floor(Math.random() * 101) + 100),
            this.vx +
              Math.cos(this.angle) * 600 +
              Math.floor(Math.random() * 4) -
              2,
            this.vy +
              Math.sin(this.angle) * 600 +
              Math.floor(Math.random() * 4) -
              2,
            "red"
          )
        );
        shotCount += 1;
        this.count = 0;
      }
      this.count += 1;

      if (shotCount > shotCountMax) {
        coolDown = 0;
        shotCount = 0;
      }
    } else if (coolDown < ready) {
      coolDown += 1;
    }
  }

  //Update pos of plane and draw
  update() {
    var a =
      (((this.angle + Math.PI / 8) % (2 * Math.PI)) + 2 * Math.PI) %
      (2 * Math.PI);
    var r = Math.floor((4 * a) / Math.PI);
    if (this.brake) {
      r = 2;
    }
    ctx.save();
    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.rotate(-this.angle + Math.PI / 2);
    ctx.scale((-1 * zoomLevel) / 2, (1 * zoomLevel) / 2);
    ctx.drawImage(
      resources[r],
      -resources[r].width / 2,
      -resources[r].height / 2,
      resources[r].width,
      resources[r].height
    );
    ctx.restore();
  }
}

// Ground object class
class Ground {
  //Declare this.vars
  constructor(x, y, color, width, height, parallaxFactor, collider) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = width;
    this.height = height;
    this.m = parallaxFactor;
    this.collider = collider;
  }
  render() {
    if (
      Math.sqrt((this.x - f22.x) ** 2 + (this.y - f22.y) ** 2) <=
        800 / zoomLevel + 13000 ||
      this.m == 0
    ) {
      ctx.fillStyle = this.color;
      // Draw the filled rectangle
      ctx.save();
      ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.fillRect(
        this.x - screenScroll[0] * this.m,
        this.y + screenScroll[1],
        this.width,
        this.height
      );
      ctx.restore();
    }
  }
}
//Bullets class
class Bullet {
  constructor(direction, size, x, y, vx, vy, color, flak, time) {
    this.direction = direction;
    this.size = size;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.time = 0;
    this.color = color;
    this.flak = flak;
    this.maxTime = time;
  }
  update() {
    this.vx = this.vx;
    this.vy = this.vy - 1 * 1;
    this.x += this.vx;
    this.y += this.vy;
    this.time += 1;

    if (this.y > 10) {
      ctx.save();
      ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(
        this.x - screenScroll[0],
        -this.y + screenScroll[1],
        this.size,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.restore();
      particles.push(
        new Trail(
          this.x,
          this.y,
          "red",
          1,
          this.size * 4,
          0,
          0,
          Math.atan2(this.vy, this.vx) + Math.PI,
          this.size * 2
        )
      );
    } else if (this.size != null) {
      this.deleteNull();
    }
    let r = Math.sqrt(
      Math.pow(-this.y + f22.y, 2) + Math.pow(-this.x + f22.x, 2)
    );

    if (r < 500) {
      f22.health -= 1;
      this.deleteNull();
    }
    if (this.maxTime <= this.time && this.flak) {
      this.deleteNull();
    }
  }
  deleteNull() {
    bullets.shift(0, 1);
    this.direction = null;
    this.size = null;
    this.x = null;
    this.y = null;
    this.vx = null;
    this.vy = null;
    this.time = null;
    this.color = null;
    this.maxTime = null;
    this.flak = null;
  }
}

//Trail
class Trail {
  constructor(x, y, color, time, size, vx, vy, angle, width) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.time = time;
    this.size = size;
    this.rate = size / time;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
    this.width = width;
    this.origTime = time;
    this.widthRate = width / time;
  }

  updateBasic() {
    if (this.size >= this.rate) {
      ctx.save();
      ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
      ctx.scale(zoomLevel, zoomLevel);
      if (this.time >= this.origTime / 5) {
        ctx.fillStyle = "#FF9800";
      } else {
        ctx.fillStyle = "#FFC100";
      }
      ctx.beginPath();
      ctx.arc(
        this.x - screenScroll[0],
        -this.y + screenScroll[1],
        this.size,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.restore();

      this.time -= 1;
      this.size -= this.rate;
      this.x += this.vx + Math.floor(Math.random() * 40) - 20;
      this.y += this.vy + Math.floor(Math.random() * 40) - 20;
    }
    if ((this.time = 0)) {
      this.x = null;
      this.y = null;
      this.color = null;
      this.time = null;
      this.size = null;
      this.rate = null;
      this.vx = null;
      this.vy = null;
      this.angle = null;
      this.width = null;
      this.widthRate = null;
      particles.shift();
    }
  }

  updateTri() {
    if (
      Math.sqrt((this.x - f22.x) ** 2 + (this.y - f22.y) ** 2) <=
      800 / zoomLevel
    ) {
      if (this.size >= this.rate) {
        let VX1 = 1 * Math.cos(-this.angle) * this.size * 6 * 2;
        let VY1 = 1 * Math.sin(-this.angle) * this.size * 6 * 2;

        let VX2 = -1 * Math.sin(this.angle) * this.width * 0.5;
        let VY2 = -1 * Math.cos(this.angle) * this.width * 0.5;

        let VX3 = Math.sin(this.angle) * this.width * 0.5;
        let VY3 = Math.cos(this.angle) * this.width * 0.5;

        this.time -= 1;
        this.size -= this.rate;
        this.width -= this.widthRate;

        ctx.save();
        ctx.fillStyle = this.color;
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        ctx.scale(zoomLevel, zoomLevel);
        ctx.beginPath();
        ctx.moveTo(
          this.x + VX1 - screenScroll[0],
          -this.y + VY1 + screenScroll[1]
        );
        ctx.lineTo(
          this.x + VX2 - screenScroll[0],
          -this.y + VY2 + screenScroll[1]
        );
        ctx.lineTo(
          this.x + VX3 - screenScroll[0],
          -this.y + VY3 + screenScroll[1]
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      if ((this.time = 0)) {
        this.x = null;
        this.y = null;
        this.color = null;
        this.time = null;
        this.size = null;
        this.rate = null;
        this.vx = null;
        this.vy = null;
        this.angle = null;
        this.width = null;
        this.widthRate;
        particles.shift();
      }
    }
  }
}

class enemyTurret {
  constructor(x, y, turretAngle, size, bulletPower, accuracy) {
    this.x = x;
    this.y = y;
    this.turretAngle = turretAngle;
    this.size = size;
    this.bulletPower = bulletPower;
    this.accuracy = accuracy;
    this.c = 0;
  }

  drawBase() {
    ctx.fillStyle = "grey";

    ctx.save();
    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.fillRect(
      this.x - screenScroll[0],
      this.y + screenScroll[1],
      1000,
      -500
    );
    ctx.restore();
  }

  drawTurret() {
    ctx.save();
    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.fillStyle = "#9c9a9a";

    ctx.beginPath();
    ctx.moveTo(this.x - screenScroll[0] + 500, this.y + screenScroll[1] - 500);
    ctx.lineTo(
      this.x + 500 - screenScroll[0] + Math.cos(this.turretAngle) * 1000,
      this.y - 500 + screenScroll[1] + Math.sin(this.turretAngle) * -1000
    );

    ctx.lineWidth = 120;
    ctx.strokeStyle = "#adadad";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
      this.x - screenScroll[0] + 500,
      this.y + screenScroll[1] - 500,
      350,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.restore();
  }

  updateAim() {
    var dx = f22.x - this.x;
    var dy = f22.y - this.y;
    var d = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2)) / 500;
    var theta = Math.atan2(dy + f22.vy * d, dx + f22.vx * d + 10);
    this.turretAngle = theta;
  }

  update() {
    if (
      Math.sqrt((this.x - f22.x) ** 2 + (this.y + f22.y) ** 2) <=
      8000 / zoomLevel
    ) {
      this.updateAim();
      this.drawTurret();
      this.drawBase();
      this.c += 1;
      if (this.c > 15) {
        bullets.push(
          new Bullet(
            this.turretAngle,
            30,
            this.x + 500 + Math.cos(this.turretAngle) * 2500,
            this.y + 500 + Math.sin(this.turretAngle) * 2500,
            Math.cos(this.turretAngle) * 200,
            Math.sin(this.turretAngle) * 200,
            "red",
            true,
            200
          )
        );
        this.c = 0;
      }
    }
  }
}

class missle {
  constructor(
    x,
    y,
    vx,
    vy,
    angle,
    turnSpeed,
    thrust,
    targetRadius,
    targetDistance,
    team
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;

    this.turnSpeed = turnSpeed;
    this.thrust = thrust;
    this.targetRadius = targetRadius;
    this.targetDistance = targetDistance;

    this.size = size;
    this.team = team;
  }

  updateAngle() {}

  update() {}
}

class enemyPlane {
  constructor(x, y, vx, vy, angle, v) {
    //General Information
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
    this.v = v;

    //Specific info
    this.g = 30;
    this.asp = 0;
    this.bodyDrag = 0.03;
    this.drag = 0.003125;
    this.thrust = 50;
    this.lift = 20;

    //Guns
    this.shots = 0;
    this.maxShots = 50;
    this.time = 0;

    this.coolDown = 100;
    this.coolTime = 0;
  }

  updateForces() {
    //Basic Velocity Calculations
    this.v = Math.sqrt(this.vx ** 2 + this.vy ** 2);

    //Calculation Drag
    let attack = this.angle - this.asp;
    this.asp = this.angle;
    var D =
      ((this.drag * Math.sin(attack) + this.bodyDrag) * Math.pow(this.v, 2)) /
      10;

    //Speed up or slow down
    let r = Math.sqrt(
      Math.pow(-this.y + f22.y, 2) + Math.pow(-this.x + f22.x, 2)
    );
    if (Math.abs(attack) == 0 && this.thrust < 100 && r > 6000) {
      this.thrust += 1;
    } else if (this.thrust > 35) {
      this.thrust -= 1;
    }

    //Calculation thrust
    let tx = this.thrust * Math.cos(this.angle) * 2.5;
    let ty = this.thrust * Math.sin(this.angle) * 2.5;

    //Lift Calculation
    var lY =
      Math.abs(
        this.v * this.lift * Math.pow(Math.sin(this.angle + Math.PI / 2), 2)
      ) / 200;

    //keep prev velocity
    let inertiaX = this.vx / 1.6;
    let inertiaY = this.vy / 1.6;

    //Everything togheter
    this.vx =
      Math.floor((Math.cos(this.angle) * (this.v - D) + tx) * 10000) / 10000 +
      inertiaX;
    this.vy =
      Math.floor(
        (Math.sin(this.angle) * (this.v - D) + ty + lY - this.g) * 100
      ) /
        100 +
      inertiaY;

    //Adding the calculated velocities
    this.x += this.vx;
    this.y += this.vy;

    //Dealing with Ground Collisions Basic stuff
    if (this.y < 10 && this.vy < 0) {
      this.y = 10;
      this.vy = 0;
      this.vx /= 2;
    }

    //Guns
    let a =
      (Math.atan2(-this.y + f22.y + f22.vy, -this.x + f22.x + f22.vx) +
        Math.PI * 2) %
      (Math.PI * 2);

    if (r < 9000) {
      if (
        Math.abs(this.angle - a) < Math.PI / 4 &&
        this.shots <= this.maxShots &&
        this.coolTime == this.coolDown
      ) {
        if (this.time >= 5) {
          bullets.push(
            new Bullet(
              this.angle,
              15,
              this.x +
                Math.cos(this.angle) * (Math.floor(Math.random() * 101) + 100),
              this.y +
                Math.sin(this.angle) * (Math.floor(Math.random() * 101) + 100),
              this.vx +
                Math.cos(this.angle) * 600 +
                Math.floor(Math.random() * 4) -
                2,
              this.vy +
                Math.sin(this.angle) * 600 +
                Math.floor(Math.random() * 4) -
                2,
              "red"
            )
          );
          this.shots += 1;
          this.time = 0;
        }
        this.time += 1;

        if (this.shots > this.maxShots) {
          this.coolTime = 0;
          this.shots = 0;
        }
      } else if (this.coolTime < this.coolDown) {
        this.coolTime += 1;
      }
    }
    let direct = Math.atan2(Math.floor(this.vy), Math.floor(this.vx)) + Math.PI;
    let distance = 240;
    flame(
      this.x,
      this.y,
      direct,
      this.v,
      this.vx,
      this.vy,
      distance,
      this.angle
    );
    flame(
      this.x,
      this.y,
      direct,
      this.v,
      this.vx,
      this.vy,
      distance,
      this.angle
    );
    flame(
      this.x,
      this.y,
      direct,
      this.v,
      this.vx,
      this.vy,
      distance,
      this.angle
    );
    flame(
      this.x,
      this.y,
      direct,
      this.v,
      this.vx,
      this.vy,
      distance,
      this.angle
    );
  }
  render() {
    let a =
      (((this.angle + Math.PI / 8) % (2 * Math.PI)) + 2 * Math.PI) %
      (2 * Math.PI);
    let r = Math.floor((4 * a) / Math.PI);

    ctx.save();

    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.scale((-1 * zoomLevel) / 2, (1 * zoomLevel) / 2);
    ctx.translate(
      Math.floor(-this.x * 2 + screenScroll[0] * 2),
      Math.floor(-this.y * 2 + screenScroll[1] * 2)
    );
    ctx.rotate(this.angle - Math.PI / 2);
    ctx.drawImage(
      resources[r],
      -resources[r].width / 2,
      -resources[r].height / 2,
      resources[r].width,
      resources[r].height
    );
    ctx.restore();
  }
  calcAngle() {
    let p = 0;
    for (let i = 0; i < enemyPlanes.length; i++) {
      let r = Math.sqrt(
        Math.pow(-this.y + enemyPlanes[i].y, 2) +
          Math.pow(-this.x + enemyPlanes[i].x, 2)
      );
      if (r < 5000 && r != 0) {
        p = Math.sign(
          Math.atan(-this.y + enemyPlanes[i].y, -this.x + enemyPlanes[i].x)
        );
      }
    }

    let a =
      (Math.atan2(-this.y + f22.y + f22.vy, -this.x + f22.x + f22.vx) +
        Math.PI * 2) %
      (Math.PI * 2);

    if (this.y < 6000) {
      a = Math.PI / 2;
    }

    this.angle = (this.angle + Math.PI * 2) % (Math.PI * 2);
    let dif = a - this.angle;
    let f = 0;
    let s = Math.min(Math.abs(dif - Math.PI * 2), Math.abs(dif));

    if (Math.abs(dif) == s) {
      f = dif;
    } else if (Math.abs(dif - Math.PI * 2)) {
      f = dif - Math.PI * 2;
    }

    if (Math.abs(f) < Math.PI / 2) {
      if (f > Math.PI / 90) {
        this.angle += Math.PI / 90 + (p * Math.PI) / 90;
      } else if (f < -Math.PI / 90) {
        this.angle -= Math.PI / 90 + (p * Math.PI) / 90;
      }
    } else {
      this.angle += Math.PI / 90 + (p * Math.PI) / 90;
    }
  }
  update() {
    this.calcAngle();
    this.updateForces();
    this.render();
  }
}

//Functions//
//Functions//
//Functions//
//Functions//
//Functions//

// Key Down Listner
document.addEventListener("keydown", function (event) {
  if (event.repeat) return;

  if (event.key === "s" && f22.thrust > 0) {
    trottledown = true;
    trottleInterval = setInterval(trottleDown, 16);
  } else if (event.key === "w" && f22.thrust < 100) {
    trottleup = true;
    trottleInterval = setInterval(trottleUp, 16);
  } else if (event.key === "z") {
    zoomout = true;
    zoomInterval = setInterval(zoomOut, 16);
  } else if (event.key === "x") {
    zoomin = true;
    zoomInterval = setInterval(zoomIn, 16);
  } else if (event.key === " ") {
    f22.brake = true;
  }
});

// Key Up Listener
document.addEventListener("keyup", function (event) {
  if (event.key === "w") {
    trottleup = false;
  } else if (event.key === "s") {
    trottledown = false;
  } else if (event.key === "z") {
    zoomout = false;
  } else if (event.key === "x") {
    zoomin = false;
  } else if (event.key === " ") {
    f22.brake = false;
  }

  if (!trottleup && !trottledown) {
    clearInterval(trottleInterval);
  }
  if (!zoomout && !zoomin) {
    clearInterval(zoomInterval);
  }
});

//functions for key presses

function trottleUp() {
  if (f22.thrust < 100) {
    f22.thrust += 1;
  }
}
function trottleDown() {
  if (f22.thrust > 0) {
    f22.thrust -= 1;
  }
}

function zoomIn() {
  zoomLevel += zoomScale;
}
function zoomOut() {
  zoomLevel -= zoomScale;
  if (zoomLevel < zoomScale) {
    zoomLevel = zoomScale;
  }
}

function handleMouseMove(event) {
  mouse_x = event.clientX - rect.left;
  mouse_y = event.clientY - rect.top;
  //f22.angle = Math.atan2(-mouse_y + window.innerHeight / 2, mouse_x - window.innerWidth / 2)
}

function handleMouseDown() {
  firing = true;
}
function handleMouseUp() {
  firing = false;
}

function adjustAngle(angleRad) {
  if (angleRad < 0 || angleRad >= 2 * Math.PI) {
    if (angleRad < 0) {
      angleRad += 2 * Math.PI;
    } else if (angleRad >= 2 * Math.PI) {
      angleRad -= 2 * Math.PI;
    }
  }
  return angleRad;
}

function findAngle() {
  var nAngle = Math.atan2(
    -mouse_y + window.innerHeight / 2,
    mouse_x - window.innerWidth / 2
  );
  if (nAngle === NaN) {
    nAngle == 0;
  }
  var dif = nAngle - f22.angle;

  var result;
  let turnRate = f22.turnRate;
  if (f22.brake) {
    turnRate *= 2;
  }
  if (dif != 0) {
    var min = Math.min(
      Math.abs(dif),
      Math.abs(dif + Math.PI * 2),
      Math.abs(dif - Math.PI * 2)
    );
    if (Math.abs(dif) === min) {
      result = dif;
    } else if (Math.abs(dif - Math.PI * 2) === min) {
      result = dif - Math.PI * 2;
    } else {
      result = dif + Math.PI * 2;
    }
    if (Math.abs(result) > turnRate) {
      if (result < 0) {
        f22.angle -= turnRate;
      } else {
        f22.angle += turnRate;
      }
    } else {
      f22.angle === nAngle;
    }
  }
  f22.angle = adjustAngle(f22.angle);
}

function flame(x, y, direct, v, vx, vy, distance, angle) {
  let rand = Math.random() - 0.5;
  fireParticles.push(
    new Trail(
      x - Math.cos(angle) * distance - vx * rand,
      y - Math.sin(angle) * distance - vy * rand + Math.cos(angle) * 10,
      "rgba(255, 255, 255, 0.5",
      Math.floor(Math.abs(v / 50)),
      25,
      0 + vx / 2,
      0 + vy / 2,
      direct,
      30 + Math.abs(Math.sin(direct) * 30)
    )
  );
}

//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//

var ground = new Ground(-500000, 0, "#315e33", 1000000, 50000, 0, true);

var grounds = [ground];
var buildCount = 100;
for (let i = 0; buildCount > i; i++) {
  let height = Math.floor(Math.random() * 10000) + 1000;
  grounds.push(
    new Ground(
      (buildCount * -5000) / 2 + i * 5000,
      -height,
      "rgba(113, 122, 163, 1)",
      3000,
      height,
      1,
      false
    )
  );
}

var enemyPlanes = [];
var enemyCount = 4;
for (let i = 0; enemyCount > i; i++) {
  enemyPlanes.push(new enemyPlane(0, i * 1000, 0, 0, 0, 0));
}

/* Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: */
/* Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: */
/* Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: */
var resources = [];

function loadResources(resourceUrls) {
  return new Promise(function (resolve, reject) {
    var loadedResources = 0;
    var totalResources = resourceUrls.length;
    function onLoad() {
      loadedResources++;
      if (loadedResources === totalResources) {
        resolve(resources);
      }
    }
    function onError() {
      reject(new Error("Failed to load resources."));
    }
    resourceUrls.forEach(function (url) {
      var extension = url.split(".").pop().toLowerCase();
      var resource;
      if (extension === "json") {
        resource = new XMLHttpRequest();
        resource.overrideMimeType("application/json");
        resource.responseType = "json";
      } else if (
        ["png", "jpg", "jpeg", "gif", "svg"].indexOf(extension) !== -1
      ) {
        resource = new Image();
      } else {
        // Unsupported resource type
        return;
      }
      resource.onload = onLoad;
      resource.onerror = onError;
      resource.src = url;
      resources.push(resource);
    });
  });
}
/* Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: */
/* Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: */
/* Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: Loading Resources: */

var MAP_FILE;
fetch("../assets/maps/map1.json")
  .then((response) => response.json())
  .then((json) => (MAP_FILE = json));

var turret1 = new enemyTurret(0, 0, 0, 50, 50, 50);
var turret2 = new enemyTurret(50000, 0, 0, 50, 50, 50);
var turret3 = new enemyTurret(-50000, 0, 0, 50, 50, 50);

var turrets = [turret1, turret2, turret3];
//var turrets = []
loadResources(imageUrls)
  .then(function (resources) {
    f22 = new Player(
      "f22",
      0,
      10000,
      0,
      0,
      0,
      0,
      20,
      0.003125,
      Math.PI / 60,
      0,
      1,
      true,
      100
    );

    mainLoop();
  })
  .catch(function (error) {
    console.error("Failed to load resources:", error);
  });

function mainLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  f22.updateForces();
  screenScroll = [f22.x, f22.y];

  for (let i = 0; i < grounds.length; i++) {
    grounds[i].render();
  }

  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();
  }

  for (let i = 0; i < turrets.length; i++) {
    turrets[i].update();
  }

  findAngle();

  for (let i = 0; i < particles.length; i++) {
    particles[i].updateTri(0);
  }

  for (let i = 0; i < fireParticles.length; i++) {
    fireParticles[i].updateBasic(0);
  }
  for (let i = 0; i < enemyPlanes.length; i++) {
    enemyPlanes[i].update();
  }
  f22.update();

  ctx.font = "20px B612 Mono";
  ctx.fillStyle = "rgba(46, 46, 46, 0.5)";
  ctx.fillRect(-1, -1, 150, 280);
  ctx.fillStyle = "rgba(60, 255, 0, 1)";
  ctx.strokeStyle = "rgba(60, 255, 0, 1)";
  ctx.strokeRect(-1, -1, 150, 280);
  ctx.fillText(`XCor:${Math.floor(f22.x / 10)}`, 5, 25);
  ctx.fillText(`YCor:${Math.floor(f22.y / 10)}`, 5, 55);
  ctx.fillText(`Speed:${Math.floor(f22.v * 2)}`, 5, 85);
  ctx.fillText(`VX:${Math.abs(Math.floor(f22.vx * 2))}`, 5, 115);
  ctx.fillText(`VY:${Math.abs(Math.floor(f22.vy * 2))}`, 5, 145);
  ctx.fillText(
    `Ammo:${coolDown == ready ? shotCountMax - shotCount : "--"}`,
    5,
    175
  );
  ctx.fillText(`Power:${f22.thrust}`, 5, 205);
  ctx.fillText(`Ammo:${coolDown < ready ? coolDown : "--"}`, 5, 235);
  ctx.fillText(`health:${f22.health}`, 5, 265);

  requestAnimationFrame(mainLoop);
}
