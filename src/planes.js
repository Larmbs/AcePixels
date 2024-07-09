

class Aircraft {
    constructor(
      name,
      pos,
      vel,
      angle,
      liftForce,
      dragForce,
      turnRate,
      thrust,
      thrustRate,
      flipped,
    ) {
      //Basic  Info
      this.name = name;
      this.pos = pos;
      this.vel = vel;
      this.angle = angle;
  
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

      this.is_firing = false;
    }
    setAngle(angle) {
        this.angle = angle;
    }
    incThrust() {
        this.thrust += 1;
    }
    decThrust() {
        this.thrust -= 1;
    }
    startFiring() {
        this.is_firing = true;
    }
    stopFiring() {
        this.is_firing = false;
    }
    update() {
        
    }
    draw() {
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