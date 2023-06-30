//Declare Vars//
//Declare Vars//
//Declare Vars//
//Declare Vars//
//Declare Vars//

//Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.width = window_width;
canvas.height = window_height;

canvas.style.background = '#aee5e6';

const image = new Image();
image.src = 'https://i.ibb.co/S68kpNC/F-86.png';

const cloudPack = new Image();
cloudPack.src = 'https://i.ibb.co/vVMpdqP/8614580.png';

var ground;

let f86;

//Key press vars
var rotationAngle = 0, rotatingLeft = false, rotatingRight = false, rotationInterval;

var trottledown = false, trottleup = false, trottleInterval;

var zoomout = false, zoomin = false, zoomLevel = 0.09, zoomInterval, zoomScale = 0.01;

var screenScroll = [0, 0];

var particles = [];

var firing = false, shotCountMax = 50, shotCount = 0, coolDown = 200, ready = 200;

var bullets = [];

var jsonFile = 'data.json';
var cachedData = localStorage.getItem('cachedData');

if (cachedData) {
  // Use the cached data
  var jsonData = JSON.parse(cachedData);
  processJsonData(jsonData);
} else {
  // Fetch the JSON file and cache the data
  fetch(jsonFile)
    .then(response => response.json())
    .then(jsonData => {
      // Store the data in localStorage
      localStorage.setItem('cachedData', JSON.stringify(jsonData));
      
      // Process the JSON data
      processJsonData(jsonData);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function processJsonData(jsonData) {
  // Process the JSON data as needed
  console.log(jsonData);
}


//Classes//
//Classes//
//Classes//
//Classes//
//Classes//

//Plane Sprite Class 
class Plane {
  //Declare this.vars
  constructor(name, Vx, Vy, liftForce, turnRate, maxThrust, thrust, thrustRate, angle, dragForce, img, flipped, x , y) {
    this.name = name;
    this.Vx = Vx;
    this.Vy = Vy;
    this.liftForce = liftForce;
    this.turnRate = turnRate;
    this.maxThrust = maxThrust;
    this.thrust = thrust;
    this.thrustRate = thrustRate;
    this.angle = angle;
    this.dragForce = dragForce;
    this.img = img;
    this.Wx = window.innerWidth / 2;
    this.Wy = window.innerHeight / 2;
    this.gravity = 30;
    this.flipped = flipped;
    this.x = x;
    this.y = y;
    this.v = 0;
    this.airSpeedAngle = 0;
  }
  //Run calc on forces
  updateForces() {
    var v = Math.sqrt((this.Vx ** 2) + (this.Vy ** 2));
    var attack = -this.angle - this.airSpeedAngle;
    this.airSpeedAngle = -this.angle;
    var bodyDragCoefficient = 0.05;
    var D = (this.dragForce * Math.sin(attack) + bodyDragCoefficient) * Math.pow(v, 2) / 10;
    var tX = this.thrust * Math.cos(-this.angle) * 0.5;
    var tY = this.thrust * Math.sin(-this.angle) * 0.5;
    var lX = v * this.liftForce * Math.cos(-this.angle + Math.PI / 2) * Math.abs(Math.cos(-this.angle + Math.PI / 2)) / 100;
    var lY = Math.abs(v * this.liftForce * Math.pow(Math.sin(-this.angle + Math.PI / 2), 2)) / 200;
    this.Vx = Math.floor((Math.cos(-this.angle) * (v - D) + tX + lX) * 10000) / 10000;
    this.Vy = Math.floor((Math.sin(-this.angle) * (v - D) + tY + lY - this.gravity) * 100) / 100;
    this.x += this.Vx;
    this.y += this.Vy;
    this.v = v;
    if (this.y <= 25 && this.Vy < 0) {
      this.y = 25;
      this.Vy = 0;
      this.Vx /= 2
    };
    //particles

    //Smoke trail
    particles.push(new Trail(this.x + Math.cos(-this.angle) * -100 - Math.sin(-this.angle) * -10, this.y + Math.sin(-this.angle) * -100 - Math.cos(-this.angle) * 10, 'rgba(255, 255, 255, 0.5', Math.floor(Math.abs(this.v / 6)) , 30, 0, 0, Math.atan2(this.Vy, this.Vx) + Math.PI));
    
    //particles.push(new Trail(this.x + Math.cos(-this.angle) * -90 - Math.sin(-this.angle) * -10, this.y + Math.sin(-this.angle) * -90 - Math.cos(-this.angle) * 10, 'rgba(252, 98, 3, 0.7', Math.floor(Math.abs(this.v / 32)) , 30, 0, 0, -this.angle + Math.PI));



    if (firing && shotCount <= shotCountMax && coolDown == ready) {
    bullets.push(new Bullet(-this.angle, 5, this.x , this.y, this.Vx + Math.cos(-this.angle) * 160  + Math.floor(Math.random() * 4) - 2, this.Vy + Math.sin(-this.angle) * 160  + Math.floor(Math.random() * 4) - 2, "#511a19"));
    shotCount += 1;
    if (shotCount > shotCountMax) {
      coolDown = 0
      shotCount = 0;
      
    }
    } else if (coolDown < ready) {
      coolDown += 1
     } 
  }
  
  //Update pos of plane and draw
  update() {
  ctx.save();
  ctx.translate(this.Wx, this.Wy);
  ctx.rotate(this.angle);
  ctx.scale(-1 * zoomLevel,1 * zoomLevel);
  ctx.drawImage(image, -this.img.width / 2, -this.img.height / 2, this.img.width, this.img.height);
  ctx.restore();
  

}
 



};


// Ground object class
class Ground {
  //Declare this.vars
  constructor(x, y, color, width, height, parallaxFactor, collider) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.width = width;
    this. height = height;
    this.m = parallaxFactor;
    this.collider = collider;
  }
  render() {
    ctx.fillStyle = this.color;
    // Draw the filled rectangle
    ctx.save();
    ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx.scale(zoomLevel,zoomLevel);
    ctx.fillRect(this.x  - screenScroll[0] * this.m, this.y + screenScroll[1], this.width, this.height);
    ctx.restore();
  }
  static async fromJSONFile(url) {
    const response = await fetch(url);
    const jsonData = await response.json();
    
    return jsonData.map(obj => {
      return new Ground(obj.x, obj.y, obj.color, obj.width, obj.height, obj.parallaxFactor, obj.collider);
    });
  }
}


//Bullets class
class Bullet {
  constructor(direction, size, x, y, vx, vy, color) {
    this.direction = direction;
    this.size = size;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.time = 0;
    this.color = color;
  }
  update() {
    this.vx = this.vx;
    this.vy = this.vy - (1 * 1);
    this.x += this.vx;
    this.y += this.vy;
    this.time += 1;
    
    if (this.y >= 0) {
      ctx.save();
      ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
      ctx.scale(zoomLevel,zoomLevel);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - screenScroll[0], -this.y + screenScroll[1], this.size, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    } else {
      delete this;
      bullets.shift();
      
    }
    particles.push(new Trail(this.x, this.y, 'rgba(243, 247, 7, 0.5', 5 , 30, 0, 0, Math.atan2(this.vy , this.vx) + Math.PI));

  }
}


//Trails
class Trail {
  constructor(x, y, color, time, size, vx, vy, angle) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.time = time;
    this.size = size;
    this.rate = size / time;
    this.vx = vx;
    this.vy = vy;
    this.angle = angle;
  }

  updateBasic() {
    
    if (this.size > this.rate) {
      this.time -= 1;
      this.size -= this.rate
      
      ctx.save();
      ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
      ctx.scale(zoomLevel,zoomLevel);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x - screenScroll[0], -this.y + screenScroll[1], Math.floor(this.size), 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    }else {
      delete this;
      particles.shift();
    }
  
    }
  
    updateTri() {

      if (this.size > this.rate) {
        
        
        let VX1 = 1 * Math.cos(-this.angle) * this.size * 6;
        let VY1 = 1 * Math.sin(-this.angle) * this.size * 6;

        let VX2 = -1 * Math.sin(this.angle) * this.size * 2 / this.time;
        let VY2 = -1 * Math.cos(this.angle) * this.size * 2 / this.time;

        let VX3 = Math.sin(this.angle) * this.size * 0.5;
        let VY3 = Math.cos(this.angle) * this.size * 0.5;

        this.time -= 1;
        this.size -= this.rate

        
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.translate(window.innerWidth / 2, window.innerHeight / 2);
        ctx.scale(zoomLevel,zoomLevel);
        ctx.beginPath();
        ctx.moveTo(this.x + VX1 - screenScroll[0], -this.y + VY1 + screenScroll[1]);
        ctx.lineTo(this.x + VX2 - screenScroll[0], -this.y + VY2 + screenScroll[1]);
        ctx.lineTo(this.x + VX3 - screenScroll[0], -this.y + VY3 + screenScroll[1]);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }else {
          delete this;
          particles.shift();
        }
      


    }
  updateFlame() {



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
  if (event.key === "a" && !rotatingRight) {
    rotatingLeft = true;
    rotationInterval = setInterval(rotateLeft, 16);
  } else if (event.key === "d" && !rotatingLeft) {
    rotatingRight = true;
    rotationInterval = setInterval(rotateRight, 16);
  } else if (event.key === "s" && f86.thrust > 0) {
    trottledown = true;
    trottleInterval = setInterval(trottleDown, 16);
  } else if (event.key === "w" && f86.thrust < 100) {
    trottleup = true;
    trottleInterval = setInterval(trottleUp, 16);
  } else if (event.key === "z") {
    zoomout = true;
    zoomInterval = setInterval(zoomOut, 16);
  } else if (event.key === "x") {
    zoomin = true;
    zoomInterval = setInterval(zoomIn, 16);
  } else if (event.key === " ") {
    firing = true;
  }
});
// Key Up Listener
document.addEventListener("keyup", function (event) {
  if (event.key === "a") {
    rotatingLeft = false;
  } else if (event.key === "d") {
    rotatingRight = false;
  } else if (event.key === "w") {
    trottleup = false;
  } else if (event.key === "s") {
    trottledown = false;
  } else if (event.key === "z") {
    zoomout = false;
  } else if (event.key === "x") {
    zoomin = false;
  } else if (event.key === " ") {
    firing = false;
  };
  if (!rotatingLeft && !rotatingRight) {
    clearInterval(rotationInterval);
  }
  if (!trottleup && !trottledown) {
    clearInterval(trottleInterval);
  }
  if (!zoomout && !zoomin) {
    clearInterval(zoomInterval);
  }});


  //functions for key presses 
  function rotateLeft() {f86.angle -= Math.PI / 90;}
  
  function rotateRight() {f86.angle += Math.PI / 90;}
  
  function trottleUp() {
    if (f86.thrust < 100) {f86.thrust += 1;}}
  
  function trottleDown() {
    if (f86.thrust > 0) {f86.thrust -= 1;}}

  function zoomIn() {zoomLevel += zoomScale;}
  
  function zoomOut() {
    zoomLevel -= zoomScale;
    if (zoomLevel < zoomScale) {zoomLevel = zoomScale;}}

//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//
//MainLoop//
Ground.fromJSONFile('data.json')
  .then(result => {
    ground = result
  })
  .catch(error => {
    console.error('Error:', error);
  });

/*ground = new Ground(-500000, 0, "#315e33", 1000000, 50000, 0, true);
tower1 = new Ground(-5000, -5000, "rgba(113, 122, 163, 1)", 1000, 5000, 1, false);
tower2 = new Ground(-2000, -6000, "rgba(66, 70, 94, 1)", 1000, 6000, 1, false);
tower3 = new Ground(1000, -3000, "rgba(87, 130, 116, 1)", 1000, 3000, 1, false);
tower4 = new Ground(5000, -2000, "rgba(102, 112, 109, 1)", 1000, 2000, 1, false);
tower5 = new Ground(8000, -5000, "rgba(113, 122, 163, 1)", 1000, 5000, 1, false);
tower6 = new Ground(11000, -6000, "rgba(66, 70, 94, 1)", 1000, 6000, 1, false);
tower7 = new Ground(14000, -3000, "rgba(87, 130, 116, 1)", 1000, 3000, 1, false);
tower8 = new Ground(17000, -2000, "rgba(102, 112, 109, 1)", 1000, 2000, 1, false);
tower9 = new Ground(20000, -5000, "rgba(113, 122, 163, 1)", 1000, 5000, 1, false);
tower10 = new Ground(23000, -6000, "rgba(66, 70, 94, 1)", 1000, 6000, 1, false);
tower11 = new Ground(26000, -3000, "rgba(87, 130, 116, 1)", 1000, 3000, 1, false);
tower12 = new Ground(28500, -2000, "rgba(102, 112, 109, 1)", 1000, 2000, 1, false);*/


image.onload = () => {
  // Create an instance of the Plane class with the image object
  f86 = new Plane("f86", 0, 0, 20, 1, 100, 0, 1, 0, 0.003125, image, true, 0 ,10000);

  // Call the update method in each frame to draw the plane on the canvas
  function mainLoop() {


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    f86.updateForces();
    screenScroll = [f86.x, f86.y];

    for (i = 0; i < ground.length; i++) {
      ground[i].render();
    }
    for (i = 0; i < particles.length; i++) {
      particles[i].updateTri(0);
    }
    for (i = 0; i < bullets.length; i++) {
      bullets[i].update();
    }
    

    f86.update();

    ctx.font = '20px B612 Mono';
    ctx.fillStyle = 'rgba(46, 46, 46, 0.5)';
    ctx.fillRect(-1, -1, 150, 280)
    ctx.fillStyle = 'rgba(60, 255, 0, 1)';
    ctx.strokeStyle = 'rgba(60, 255, 0, 1)';
    ctx.strokeRect(-1, -1, 150, 280);
    ctx.fillText(`XCor:${Math.floor(f86.x / 10)}`, 5, 25);
    ctx.fillText(`YCor:${Math.floor(f86.y / 10)}`, 5, 55);
    ctx.fillText(`Speed:${Math.floor(f86.v * 2)}`, 5, 85);
    ctx.fillText(`VX:${Math.abs(Math.floor(f86.Vx * 2))}`, 5, 115);
    ctx.fillText(`VY:${Math.abs(Math.floor(f86.Vy * 2))}`, 5, 145);
    ctx.fillText(`Ammo:${coolDown == ready ? 50 - shotCount: "--"}`, 5, 175);
    ctx.fillText(`Power:${f86.thrust}`, 5, 205);
    ctx.fillText(`Ammo:${coolDown < ready ? coolDown: "--"}`, 5, 235);
    
    
    requestAnimationFrame(mainLoop);
  }

  mainLoop();
  
};
