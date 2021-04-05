'use strict';
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const SCALE = 4, CIRCLE = Math.PI*2;

// -- classes
// player
function Character (name){
	this.name = name;
	this.hp = 3;
	
	this.x = 0;
	this.y = 0;
	this.speed = 5;
	
	this.animation = null;
	this.sprite_width  = 16;
	this.sprite_height = 16;
	this.width = this.sprite_width*SCALE;
	this.height = this.sprite_height*SCALE;
	
	this.state = 0 // 0 idle, 1 right, 2 left
	this.current_frame = 0;
	this.total_frames = 2;
}
Character.prototype.Draw = function() {
	ctx.drawImage(
		this.animation,
		this.sprite_width * this.current_frame, this.sprite_height * this.state, this.sprite_width, this.sprite_height,
		this.x, this.y, this.width, this.height
	);
	return;
}
Character.prototype.Clear = function() {
	ctx.clearRect(
		this.x, this.y,
		this.width, this.height
	);
	return;
}

// this generates outside of the user view and falls down
// if it touches the player, then it loses health by 1 point
function Ball(){
	this.speed = 7;
	this.size = 15;
	this.x = this.size + Math.random() * ( canvas.width - this.size );
	this.y = -35;
}
Ball.prototype.Draw = function () {
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.size, 0, CIRCLE);
	ctx.strokeStyle = "#000";
	ctx.fillStyle = "#F00";
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
}
Ball.prototype.Clear = function () {
	ctx.clearRect(
		this.x - (this.size+1), this.y - (this.size +1),
		(this.size*2) +2, (this.size*2) +2
	)
}

// -- main functions
var rabbit, balls = [];
var life = document.getElementById("_life");
var score = document.getElementById("_score");
var _score = 0;
function render(){
	rabbit = new Character("rabbit");
	rabbit.animation = new Image();
	rabbit.animation.src = "./rabbit.png";
	rabbit.x = (canvas.width >> 1) - (rabbit.width >> 1 );
	rabbit.y = canvas.height - (rabbit.height);
	
	updateLife();
	
	window.setTimeout(spawnBall, 1000);
	
	window.requestAnimationFrame(draw);
}
// loop
var count = 0;
var RAF_id;
function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	moveBalls();
	checkCollission();
	
	if(rightPressed){
		rabbit.x += rabbit.speed;
		if( !(insideBoundaries(rabbit)) ){
			rabbit.x -= rabbit.speed;
		}
		rabbit.Draw();
	}
	else if(leftPressed){
		rabbit.x -= rabbit.speed;
		if( !(insideBoundaries(rabbit)) ){
			rabbit.x += rabbit.speed;
		}
		rabbit.Draw();
	}
	else{
		rabbit.state = 0;
		rabbit.Draw();
	}
	
	if(count >= 15){
		// increases rabbit.current_frame by 1, if it is >= than rabbit.total_frames resets to 0
		rabbit.current_frame = ++rabbit.current_frame * (rabbit.current_frame < rabbit.total_frames);
		count = 0;
	}
	count++;
	
	RAF_id = window.requestAnimationFrame(draw);
}
// -- listeners
document.addEventListener("keydown", keyDownHandler, true);
document.addEventListener("keyup", keyUpHandler, true);
var rightPressed = false, leftPressed = false;
function keyDownHandler(e){
	if(e.key == "ArrowRight"){
		rightPressed = true;
		rabbit.state = 1;
	}
	if( e.key == "ArrowLeft"){
		leftPressed = true;
		rabbit.state = 2;
	}
}
function keyUpHandler(e){
	switch(e.key){
		case "ArrowRight":
			rightPressed = false;
			break;
		case "ArrowLeft":
			leftPressed = false;
			break;
	}
	rabbit.state *= rightPressed || leftPressed;
}
// -- other functions
function insideBoundaries(obj){
	return (obj.x >= 0 && obj.x <= canvas.width - obj.width);
}
function randomInt(minimum, maximum){
	return (minimum + Math.random()*(maximum - minimum) ) | 0;
}
function spawnBall() {
	var _ball = new Ball();
	_ball.x = randomInt(0, canvas.width);
	balls.push(_ball);
	setTimeout(spawnBall, randomInt(600, 1000) );
}
function checkCollission() {
	if(balls.length == 0){
		return;
	}
	var dx = balls[0].x - ( rabbit.x + (rabbit.width >> 1) );
	var dy = balls[0].y - ( rabbit.y + (rabbit.height >> 1) );
	var distance = Math.sqrt( dx*dx + dy*dy );
	if(balls[0].size + (rabbit.width >> 1) > distance ){
		rabbit.hp -= 1;
		updateLife();
		balls[0].Clear();
		balls.shift();
		return;
	}
	if(balls[0].y >= canvas.height){
		balls[0].Clear();
		balls.shift();
		_score++;
		updateScore();
	}
}
function moveBalls() {
	balls.forEach( function(_ball, array){
		_ball.y += _ball.speed;
		_ball.Draw();
	});
}
function updateLife(){
	life.innerHTML = rabbit.hp;
}
function updateScore() {
	score.innerHTML = _score;
}