
let ship
let shipShooting = false;
let h = 20;
let l = 20;

let score = 0;
let lives = 3;
let scoreGoal = 10000;

let gamemode = 1;

const aImmunity = 38;
let outerLimit;

let asteroids = [];
let progressNum = 0;
let asteroidNum = 2


let particles = [];
let wreckage = [];
let saucer1
let saucer2
let saucerBullets = [];

function setup() {
  createCanvas(800, 600);
  background(220);
  reset();
  //saucer1 = new BigSaucer();
  //saucer2 = new SmallSaucer();
}

function draw() {
  background(0);
  manageShip();
  manageAsteroids();
  manageParticles();
  manageWreckage(); 
  //manageSaucers();
  //saucer1.do();
  //saucer2.do();
  manageScore();
  displayLives();
}

function reset(){
  asteroids = [];
  particles = [];
  wreckage = [];
  switch(gamemode){
    case 1://Infinite mode
      outerLimit = 200;
      ship = new Ship(random(width-160)+80,random(height-160)+80,20,20);       
      if(lives == 0){
        lives = 3;
        score = 0;
        progressNum = 0;
      }
      break;
    case 2://Levels mode
      
      break;
  }
}

function displayScore(){
  fill(255);
  textSize(30);
  text(score, 11.2, 27);
}
function manageScore(){
  if(score>=scoreGoal){
    scoreGoal+=10000;
    lives++;
  }
   displayScore(); 
}

function displayLives(){
  for(let i=0;i<lives;i++){
    push();
    translate(28*i+20,45);
    fill(0);
    stroke(255);
    strokeWeight(1.3);
    beginShape();
    vertex(-l/2, h/2);
    vertex(0, h/3);
    vertex(l/2, h/2);
    vertex(0, -h/2);
    endShape(CLOSE)
    pop();
  }
}

function manageShip(){
  ship.do();
  for(let i = 0;i<asteroids.length;i++){  
    let v = getShipVertices()
    
    if(testShipDistance(v[0].x,v[0].y,i)){
      break; 
    }
   
    
    if(testShipDistance(v[1].x,v[1].y,i)){
      break; 
    }
        

    if(testShipDistance(v[2].x,v[2].y,i)){
      break 
    }
      
   
    if(testShipDistance(v[3].x,v[3].y,i)){
      break 
    }
   
  }
}
function testShipDistance(x,y,i){
  let distance = Math.sqrt(Math.pow(asteroids[i].x-x,2)+Math.pow(asteroids[i].y-y,2))     
  let minD = 1.5*asteroids[i].radius;
 
  if(distance<minD){
    ship.die();   
    return true
  }
  return false
}
function getShipVertices(){
  let vertices = []
  
  let m1 = new RotationMatrix(ship.angle);
    let v1= m1.times(createVector(0,-h));
    vertices.push(v1.add(ship.position));
  
  let m2 = new RotationMatrix(ship.angle+PI/2);
    let v2= m2.times(createVector(0,-l));
    vertices.push(v2.add(ship.position));
  
      let m3 = new RotationMatrix(ship.angle-PI/2);
    let v3= m3.times(createVector(0,-l));
    vertices.push(v3.add(ship.position));
  
   vertices.push(createVector(ship.position.x,ship.position.y+4*h/5));
  
  return vertices
}

function manageHits(){
  //For when bullets hit asteroids
  let deletionAst = [];
  let deletionBul = [];
  let bullets = ship.Bullets;
  for(let i = 0;i<asteroids.length;i++){
    for(let k = 0;k<bullets.length; k++){
      let distance = Math.sqrt(Math.pow(asteroids[i].x-bullets[k].x,2)+Math.pow(asteroids[i].y-bullets[k].y,2))         
      let minD = 1.5*(asteroids[i].radius);
      if(distance<minD){
        deletionAst.push(i);
        deletionBul.push(k);
        addScore(asteroids[k].level);
      }
    }
  }
  
  for(let i=0;i<deletionBul.length;i++){
    let c = deletionBul[i]-i
    bullets.splice(c,1);
  }
  ship.bullets = bullets;
  
  
  for(let i=0;i<deletionAst.length;i++){
    let c = deletionAst[i]-i
    addParticles(asteroids[c].x,asteroids[c].y);
    if(asteroids[c].level>1){
      //Create Split
      let vel1 = createVector(random(-1,1),random(-1,1));
      let vel2 = createVector(-vel1.x,-vel1.y);
      Split(createVector(asteroids[c].x,asteroids[c].y),vel1,asteroids[c].level);
      Split(createVector(asteroids[c].x,asteroids[c].y),vel2,asteroids[c].level);
    }
    //Delete asteroids
    asteroids.splice(c,1); 
  }
  
}
function manageACollisions(){
  //check asteroid collision
  let deletionList = [];
  let oppositeVectors = []
  for(let i = 0;i<asteroids.length;i++){
     for(let k=0;k<asteroids.length;k++){
        if(i!=k && asteroids[i].immune == false && asteroids[k].immune == false){
          let distance = Math.sqrt(Math.pow(asteroids[i].x-asteroids[k].x,2)+Math.pow(asteroids[i].y-asteroids[k].y,2))         
          let minD = 1.5*(asteroids[i].radius+asteroids[k].radius);
          if(distance<minD){
            deletionList.push(i);
            let x = asteroids[i].x - asteroids[k].x
            let y = asteroids[i].y - asteroids[k].y
            oppositeVectors.push(createVector(x,y));
            break;
          }
        }
     }
  }
  
  //Collided astroids
  for(let i=0;i<deletionList.length;i++){
    let c = deletionList[i]-i
    addParticles(asteroids[c].x,asteroids[c].y);
    if(asteroids[c].level>1){
      //Create Split
      let matrix = new RotationMatrix(-PI/4);
      let newVel = matrix.times(oppositeVectors[i]);
      let newPos = createVector(asteroids[c].x,asteroids[c].y);
      Split(newPos,newVel,asteroids[c].level);
      matrix = new RotationMatrix(PI/4);
      newVel = matrix.times(oppositeVectors[i]);
      newPos = createVector(asteroids[c].x,asteroids[c].y);
      Split(newPos,newVel,asteroids[c].level);
    }
    //Delete asteroids
    asteroids.splice(c,1); 
  }
}

function addScore(level){
  switch(level) {
  case 1:
    score+=100;
    break;
  case 2:
    score+=50;
    break;
  case 3:
    score+=20;
    break;
}
}

function Split(newPos,newVel,lev){
  newAsteroid = new Asteroid(newPos,lev * 8-10 ,newVel,lev-1); 
  asteroids.push(newAsteroid);
}

function manageAsteroids(){
  for(let i=0; i<asteroids.length;i++){
  asteroids[i].do();
  }
  
  if(gamemode == 1){
    infiniteAsteroids();
  }
  manageHits();
  manageACollisions();
  
}
function infiniteAsteroids(){
  //infinite most asteroids
  if (asteroids.length<asteroidNum){
        let ranX = random(2*outerLimit)-outerLimit
    if(ranX > 0){
      ranX += width; 
    }
    let ranY = random(2*outerLimit)-outerLimit
    if (ranY > 0){
      ranY += height; 
    }
    let newPos = createVector(ranX,ranY);
    let newVel = createVector(random(-1,1),random(-1,1));
    let newAsteroid = new Asteroid(newPos,25,newVel,3)
    asteroids.push(newAsteroid);  
  }
  progressNum += 0.01;
  asteroidNum = -Math.pow(1.1,Math.ceil(-progressNum/5)+28)+20
}  
function manageParticles(){
  let deletionList = [];
   for(let i=0;i<particles.length;i++){
     particles[i].do(); 
     if(particles[i].life<=0){
       deletionList.push(i); 
     }
   }
  for(let i=0;i<deletionList.length;i++){
     particles.splice(deletionList[i]-i,1); 
   }
}
function addParticles(x,y){
  for(let i=0;i<random(10,15);i++){
     let pos = createVector(x,y);
     let vel = createVector(random(-1,1),random(-1,1));
     vel.setMag(random(1.5,2.5));
     let newParticle = new Particle(pos,vel);
    particles.push(newParticle);
  }
}
function manageWreckage(){
  let deletionList = [];
   for(let i=0;i<wreckage.length;i++){
     wreckage[i].do(); 
     if(wreckage[i].life<=0){
       deletionList.push(i); 
     }
   }
  for(let i=0;i<deletionList.length;i++){
     wreckage.splice(deletionList[i]-i,1); 
   }
}
function addWreckage(x,y){
  for(let i=0;i<random(3,7);i++){
     let pos = createVector(x,y);
     let vel = createVector(random(-1,1),random(-1,1));
     vel.setMag(random(2,3.5));
     let newWreckage = new Wreckage(pos,vel);
    wreckage.push(newWreckage);
  }
}

function manageSaucers(){
  manageSaucerBullets(); 
}
function manageSaucerBullets(){
  saucerBullets = saucerBullets.filter(bullet => {
          if(bullet.state == "Dead"){return false }else{return true;}
        });
    saucerBullets.forEach(bullet => {
       bullet.do();   
    });
}

function keyPressed() {
  if (keyCode == 87){ //w
    ship.Thrust(0.3); 
  }if (keyCode == 65){ //a
    ship.Rotation("Left"); 
  }if (keyCode == 68){ //d
    ship.Rotation("Right"); 
  }if (keyCode == 32){ //space
    shipShooting = true;
  }
}
function keyReleased() {
  if (keyCode == 87){ //w
    ship.Thrust(); 
  }
  if (keyCode == 65 && ship.Dir !== "Right"){ //a
    ship.Rotation(); 
  }if (keyCode == 68 && ship.Dir !== "Left"){ //d
    ship.Rotation(); 
  }
  if (keyCode == 32){ //space
    shipShooting = false;
  }
}

class Ship{
  constructor(x,y,h,l){
    this.pos = createVector(x,y);
    this.h = h;
    this.l = l;
    
    this.thrust = 0;
    this.acc = createVector(0,0);
    this.vel = createVector(0,0);
    this.flame = false;
    
    this.a = random(2*PI);
    this.turn = PI/32;
    this.direction = null;
    
    this.shootDelay = 10;
    this.sdCounter = this.shootDelay;
    this.bullets = [];
    
    this.alive = true;
    this.lifeCount = 45;
    this.wreckage = true;
  } 
  get Dir(){
    return this.direction; 
  } 
  get angle(){
    return this.a
  }
  get position(){
     return this.pos;
  }  
  get velocity(){
     return this.vel; 
  }
  set Bullets(list){
    this.bullets = list; 
  }
  get Bullets(){
    return this.bullets;
  }  
  
  do(){
    if(this.alive){
    this.move();
    this.show();
    }
    else{
      this.lifeCount--;
      if(this.lifeCount<0){
        lives--;
        reset();
      }
    }
      this.updateBullets();
  } 
  move(){
    let airResistance = 0.01;
    this.acc.x -= this.vel.x * airResistance;
    this.acc.y -= this.vel.y * airResistance;
    this.vel.add(this.acc);
    this.vel.limit(5.5);
    this.pos.add(this.vel);
    this.acc.setMag(0);
    
    if (this.vel.mag < 0.05){
      this.vel.setMag(0); 
    }
   
    this.wrap();
    
    if (this.direction == "Right"){
      this.a += this.turn; 
    }else if (this.direction == "Left"){
      this.a -= this.turn; 
    }
    if (this.thrust !== 0){
     this.addForce(this.thrust);  
    }
    
  } 
  wrap(){    
    if (this.pos.x+this.l/4 < 0){
      this.pos.x = width ; 
    }
    if (this.pos.x-this.l/4 > width){
      this.pos.x = 0; 
    }   
    if (this.pos.y+this.l/4 < 0){
      this.pos.y = height ; 
    }
    if (this.pos.y-this.l/4 > height){
      this.pos.y = 0; 
    }
  }  

  updateBullets(){
    if(shipShooting && this.alive && this.sdCounter == this.shootDelay){
      this.bullets.push(new Bullet(this.pos.x,this.pos.y,this.a,this.vel.mag()));
      this.sdCounter = 0;
    }
    
    this.bullets = this.bullets.filter(bullet => {
          if(bullet.state == "Dead"){return false }else{return true;}
        });
    this.bullets.forEach(bullet => {
       bullet.do();   
    });
    
    if(this.sdCounter < this.shootDelay){
       this.sdCounter += 1; 
    }
  } 
  addForce(forceMag){
    let defaultForce = createVector(0,-1);
    let matrix = new RotationMatrix(this.a);
    this.acc = (matrix.times(defaultForce));
    this.acc.setMag(forceMag);
  }  
  Thrust(forceMag = 0){
   this.thrust = forceMag; 
  }  
  Rotation(direction = null){
    this.direction = direction;   
  }  
  show(){
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.a); 
    this.flames();
    fill(255);
    beginShape();
    vertex(-this.l/2, this.h/2);
    vertex(0, this.h/3);
    vertex(this.l/2, this.h/2);
    vertex(0, -this.h/2);
    endShape(CLOSE);   
    pop();
  } 
  flames(){
    if (this.thrust !== 0){
      if (this.flame){
        this.flame = false; 
      }else{
       this.flame = true; 
      }
      if (this.flame){
        let x = random(-this.l*1/3,this.l*1/3);
        let y = random(this.h-5,this.h);
        fill(255,0,0,200);
        triangle(x,y,-this.l/3, this.h/3, this.l/3, this.h/3);
        x = random(-this.l*1/3,this.l*1/3);
        y = random(this.h-5,this.h+5);
        fill(255,200,0,50);
        triangle(x,y,-this.l/3, this.h/3, this.l/3, this.h/3);
      }
    }
  }
 
  die(){
    this.alive = false;
    if(this.wreckage){
      addParticles(this.pos.x,this.pos.y);
      addWreckage(this.pos.x,this.pos.y);
      this.wreckage = false; 
    }
  }
  
}
class Bullet{  
  constructor(x,y,angle,shooterVel){
    this.pos = createVector(x,y);
    let matrix = new RotationMatrix(angle);
    this.vel = matrix.times(createVector(0,-1));
    this.vel.setMag(10+shooterVel);
    this.alive = true;
  }
  
  get x(){
    return this.pos.x; 
  }
  get y(){
    return this.pos.y; 
  }
  
  get state(){
    if (this.alive == false){
      return "Dead";
    }else{
      return "Alive";
    }
  }
  
  do(){
    this.move();
    this.show();
    this.onScreen();
    this.life++;
  }
  
  move(){
    this.pos.add(this.vel); 
    
    /*
    if (this.pos.x < 0){
      this.pos.x = width ; 
    }
    if (this.pos.x > width){
      this.pos.x = 0; 
    }
    
    if (this.pos.y < 0){
      this.pos.y = height ; 
    }
    if (this.pos.y > height){
      this.pos.y = 0; 
    }
    */
  }
  
  onScreen(){
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height){
      this.alive = false;
    }
  }
  
  show(){
    fill(255);
    ellipse(this.pos.x,this.pos.y,3,3);
  }
}
class Saucer{
  constructor(){
    let x = random(2*outerLimit)
    if(x>outerLimit){
      x+=width; 
    }
    let y = random(2*outerLimit)
    if(y>outerLimit){
      y+=height; 
    }
    this.pos = createVector(x,y);
    this.vel = createVector(random(-1,1),random(-1,1));
  }
  
  do(){
    this.move();
    this.show(); 
  }
  
  move(){
    this.pos.add(this.vel);
    this.wrap();
    let ran = Math.round(random(random(250,300)));
    if(ran == 1){
       this.vel = this.randomVelocity();
    }
  }  
  randomVelocity(){
    let angle = random(-PI/2,PI/2);
    let matrix = new RotationMatrix(angle);
    return matrix.times(this.vel);
  }
  wrap(){
    if (this.pos.x+outerLimit < 0){
      this.pos.x = width+this.l ; 
    }
    if (this.pos.x-outerLimit > width){
      this.pos.x = -this.l; 
    }
    if (this.pos.y+outerLimit < 0){
      this.pos.y = height+this.h ; 
    }
    if (this.pos.y-outerLimit > height){
      this.pos.y = -this.h; 
    }
  }
   
  show(){
    push();
    translate(this.pos.x,this.pos.y);
    stroke(255);
    strokeWeight(1.6);
    fill(0);
    beginShape();
      vertex(-this.l/2,0)
      vertex(-this.l/4,-this.h/2);
      vertex(-this.l/8,-this.h);
      vertex(this.l/8, -this.h);;   
      vertex(this.l/4,-this.h/2);
      vertex(this.l/2,0);
      vertex(this.l/4,this.h/2);
      vertex(-this.l/4,this.h/2);
      vertex(-this.l/2,0);
    endShape();
    line(-0.98*this.l/2,0,0.98*this.l/2,0);
    line(this.l/4,-this.h/2,-this.l/4,-this.h/2);
    pop();
  }
  
  
}
class BigSaucer extends Saucer{
  constructor(){
    super();
    this.speed = 4;
    this.vel.setMag(this.speed);  
    this.shootCounter = 0;
    this.h = 14;
    this.l = this.h*3;
  }  
  do(){
    super.do();
    this.shoot();
  }
  shoot(){
    if(this.shootCounter > 25){
      let angle = random(2*PI);
      saucerBullets.push(new Bullet(this.pos.x,this.pos.y,angle,this.vel.mag()));
      this.shootCounter = 0;
    } 
    this.shootCounter++;
  }
  

}
class SmallSaucer extends Saucer{
    constructor(){
    super();
    this.speed = 6;
    this.vel.setMag(this.speed);  
    this.shootSpeed = 5;
    this.shootCounter = 0;
    this.h = 6;
    this.l = this.h*3;
      
  }  
  
  
  do(){
    super.do();
    this.shoot();
  }
  shoot(){
    if(this.shootCounter > 5){
      let angleRange = (PI/2 - progressNum/50)/2;
      let shipPos = createVector(ship.pos.x,ship.pos.y);
      
      let b = createVector(this.pos.x,this.pos.y);
      let a = createVector(0,-1)
      b = b.sub(shipPos);
      let shipV = createVector(ship.velocity.x,ship.velocity.y);
      shipV.setMag(5.5)
      shipV.mult(this.shootSpeed/b.mag());  
      b.add(shipV)
      let dot = -b.y;
      let angle = Math.acos(b.y/(b.mag()))
      if(b.x>0){
        angle = -angle; 
      }
      angle+=random(-angleRange,angleRange)
      saucerBullets.push(new Bullet(this.pos.x,this.pos.y,angle,this.vel.mag()));
      this.shootCounter = 0;
    } 
    this.shootCounter++;
  
    
  }
}
class Asteroid{  
  constructor(position,radius,velocity,size){
    this.size = size;
    this.pos = position; 
    this.vertixN = random(18,25);
    this.r = radius;
    this.vertices = [];
    
    this.vel = velocity;
    this.vel.setMag(0.8+(1/this.size));
    this.generateVertices();
    
    this.life = 0;
  }
  
  get radius(){
    return this.r;
  }  
  get x(){
    return this.pos.x; 
  }
  get y(){
   return this.pos.y; 
  }  
  get level(){
    return this.size; 
  } 
  get immune(){
    if(this.life<aImmunity/this.vel.mag()){
      return true
    }else{
      return false
    }
  }
  
  do(){
    this.move();
    this.show();
    if(this.life<aImmunity/this.vel.mag()){
      this.life++;
    }
  }
  
  generateVertices(){
    let angle = 0;
    let noiseStart = random(20000);
    for(let i=0; i<this.vertixN;i++){
      angle += 2*PI/this.vertixN;
      let matrix = new RotationMatrix(angle);
      let vector = matrix.times(createVector(0,1));
      let ran = 1.4*this.r*noise(noiseStart+i);
      vector.setMag(this.r+ran);
      this.vertices.push(vector);
    }
  }
  
  move(){
    this.pos.add(this.vel);
    this.wrap();
  } 
  wrap(){
    if (this.pos.x+outerLimit < 0){
      this.pos.x = width+1.4*this.r ; 
    }
    if (this.pos.x-outerLimit > width){
      this.pos.x = -1.4*this.r; 
    }
    if (this.pos.y+outerLimit < 0){
      this.pos.y = height+1.4*this.r ; 
    }
    if (this.pos.y-outerLimit > height){
      this.pos.y = -1.4*this.r; 
    }
  }
  
  show(){
    push();
    translate(this.pos.x,this.pos.y);
    stroke(255);
    strokeWeight(1.4);
    fill(0);
    beginShape();
      for(let i = 0; i<this.vertixN; i++){
        vertex(this.vertices[i].x,this.vertices[i].y);   
      }
    endShape(CLOSE);
    pop();
  }
}
class Particle{ 
  constructor(position,velocity){
    this.pos = position;
    this.vel = velocity;
    this.r=random(2.1,3.1);
    this.health = random(15,25); 
  }  
  get life(){
    return this.health
  }  
  do(){
    this.move();
    this.show();
    this.health--;
  } 
  move(){
    this.pos.add(this.vel);
  }  
  show(){
    fill(255)
    ellipse(this.pos.x,this.pos.y,this.r,this.r)
  }
  
}
class Wreckage{
  constructor(position,velocity){
    this.pos = position;
    this.vel = velocity;
    this.l=random(1,1.6);
    this.h=random(9.6,10.5);
    this.health = random(45); 
    this.angle = random(2*PI);
  }  
  get life(){
    return this.health
  }  
  do(){
    this.move();
    this.show();
    this.health--;
  } 
  move(){
    this.pos.add(this.vel);
  }  
  show(){
    push();
    translate(this.pos.x,this.pos.y);
    rotate(this.angle);
    fill(255);
    stroke(255);
    rect(0,0,this.h,this.l);
    pop();
  }
}
class Matrix{
 
  constructor(vector1,vector2 = null){
    this.matrix = [];
    this.matrix.push(vector1.x);
    this.matrix.push(vector1.y);
    if (vector2 !== null){
      this.matrix.push(vector2.x);
      this.matrix.push(vector2.y);
    }
  }
  
  times(vector){
    this.newVector = [];
    let x = this.matrix[0] * vector.x + this.matrix[2] * vector.y;
    let y = this.matrix[1] * vector.x + this.matrix[3] * vector.y;
    return createVector(x,y);
  }
  
  
}
class RotationMatrix extends Matrix{
  
  constructor(angle){
    super(createVector(cos(angle),sin(angle)), createVector(-sin(angle),cos(angle)));
  }
  
}