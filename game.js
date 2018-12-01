class Game{
	constructor(canvas){
		this.WIDTH = 1280;
		this.HEIGHT = 720;
		this.upKeys = [87,38];
		this.downKeys = [83,40];
		this.shootKeys = [32,13];
		this.rotateLeftKeys = [81,37]
		this.rotateRightKeys = [69,39]
		this.BOTTOM_BORDER = this.HEIGHT - 100;
	}
	addCanvas(canvas){
		this.scene = new Scene(canvas);	
	}
}
class Scene{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.keys = [];
		this.enemiesLeft = 0;
		this.time = 0;
		this.wave = 0;
		this.score = 0;
		this.enemies = [];
		this.bullets = [];
		this.you = new You(0,720/2-40);
		this.initCanvas();
		this.interval = setInterval(()=>{
			this.update();
			this.render();
		},1000/60);
	}
	initCanvas(){
		let you = this.you;
		this.canvas.width = game.WIDTH;
		this.canvas.height = game.HEIGHT;
		window.addEventListener('keydown',this.handleKeyDown);
		window.addEventListener('keyup',this.handleKeyUp);
		let temp = document.createElement('canvas');
		temp.width = you.width;
		temp.height = you.height;
		let ctx = temp.getContext('2d');
		ctx.strokeStyle = 'white';
		ctx.beginPath();
		ctx.moveTo(0,0);
		ctx.lineTo(0,you.height);
		ctx.lineTo(you.width,you.height/2);
		ctx.lineTo(0,0);
		ctx.stroke();
		this.youImg = new Image(); 
		this.youImg.src = temp.toDataURL();
		temp.remove();
	}
	collide(o1,o2){
		return o1.x < o2.x + o2.width && o1.x + o1.width > o2.x && o1.y < o2.y + o2.height && o1.y + o1.height > o2.y;
	}
	doRound(){
		if(this.enemies.length == 0 && this.enemiesLeft == 0){
			this.newRound();
		}
		if(!Math.floor((Math.random()*100/this.wave)) && this.enemiesLeft > 0){
			let enemyWidth = Math.floor(Math.random() * 40) + 20;
			let enemyHeight = Math.floor(Math.random() * 40) + 20;
			let enemySpeed = Math.floor(Math.random() * 6) + 2;
			let enemyY = Math.floor(Math.random() * (game.BOTTOM_BORDER-enemyHeight));
			this.enemies.push(new Enemy(this.canvas.width,enemyY,enemyWidth,enemyHeight,enemySpeed));
			this.enemiesLeft--;
		}
	}
	newRound(){
		this.wave++;
		this.enemiesLeft = Math.ceil(this.wave/4) * 10;
		//handle new weapon unlock
	}
	handleKeyDown(e){
		game.shootKeys.forEach((key)=>{
			if(key == e.keyCode) game.scene.you.shooting = true;

		});
		game.scene.keys[e.keyCode] = true;
	}
	handleKeyUp(e){
		game.shootKeys.forEach((key)=>{
			if(key == e.keyCode) game.scene.you.shooting = false;

		});
		game.scene.keys[e.keyCode] = false;
	}
	update(){
		this.moveYou();
		this.doRound();
		this.moveBullets();
		this.shoot();
		this.bulletCollide();
		this.moveEnemies();
		this.time++;
	}
	bulletCollide(){
		let bullets = this.bullets;
		let enemies = this.enemies;
		for(let i = 0;i < bullets.length; i++){
			for(let j = 0; j < enemies.length;j++){
				if(this.collide(bullets[i],enemies[j]) && !bullets[i].dead){
					bullets[i].dead = true;
					enemies[j].lines.splice(-1,1);
					if(enemies[j].lines.length == 0){
						this.score += 100;
						enemies.splice(j,1);
						j++;
					}
				}
			}
			if(bullets[i].dead){
				bullets.splice(i,1);
				i++;
			}
		}
	}
	moveBullets(){
		let bullets = this.bullets;
		for(let i = 0; i < bullets.length; i++){
			bullets[i].move();
			if(bullets[i].x + bullets[i].width > this.canvas.width ||
				bullets[i].x < 0 ||
				bullets[i].y + bullets[i].height > game.BOTTOM_BORDER ||
				bullets[i].y < 0){
				bullets.splice(i,1);
				i++;
			}
		};
	}
	shoot(){
		this.you.shoot();
		

	}
	endGame(){
		//implement
	}
	moveEnemies(){
		this.enemies.forEach(enem=>{
			enem.move();
		});
		for(let i = 0; i< this.enemies.length;i++){
			let enem = this.enemies[i];
			if(enem.x + enem.width < 0){
				this.endGame();
				this.enemies.splice(i,1);
				i++;
			}
			
		}
	}
	moveYou(){
		/*Handle Y movement*/
		let moveUp = false;
		game.upKeys.forEach((key)=>{
			if(this.keys[key]) moveUp = true;

		});
		let moveDown = false;
		game.downKeys.forEach((key)=>{
			if(this.keys[key]) moveDown = true;

		});
		if(moveUp && moveDown) return;
		if(moveUp){
			this.you.y -= this.you.speed;
		}
		if(moveDown){
			this.you.y += this.you.speed;
		}
		if(this.you.y + this.you.height > game.BOTTOM_BORDER) this.you.y = game.BOTTOM_BORDER-this.you.height;
		if(this.you.y < 0) this.you.y = 0;
		/*Handle rotation*/
		let rotateLeft = false;
		game.rotateLeftKeys.forEach((key)=>{
			if(this.keys[key]) rotateLeft = true;

		});
		let rotateRight = false;
		game.rotateRightKeys.forEach((key)=>{
			if(this.keys[key]) rotateRight = true;

		});
		if(rotateRight && rotateLeft) return;
		if(rotateRight){
			this.you.theta += Math.PI/100;
		}
		if(rotateLeft){
			this.you.theta -= Math.PI/100;
		}

	}
	render(){
		let ctx = this.ctx;
		let canvas = this.canvas;
		let bb = game.BOTTOM_BORDER;
		let you = this.you;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		/*Draw "UI"*/
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'white';
		ctx.fillRect(0,bb,canvas.width,1);
		ctx.font = '20px Asteroids';
		ctx.fillText(`Wave: ${this.wave}`, 10,bb+30);
		ctx.fillText(`Score: ${this.score}`, 10,bb+55);
		ctx.fillText(`Enemies Left: ${this.enemiesLeft}`, 10,bb+80);
		/*Draw game*/
		
		ctx.save();
		ctx.translate(you.x+you.width/2,you.y+you.height/2);
		ctx.rotate(you.theta);
		ctx.drawImage(this.youImg,-you.width/2,-you.height/2);
		ctx.restore();

		this.enemies.forEach((enem)=>{
			let lines = enem.getLines();// returns an offset version of lines array
			lines.forEach((line,i)=>{
				let nl = i+1;
				if(nl == lines.length) nl = 0; 
				ctx.beginPath();
				ctx.moveTo(line.x,line.y);
				ctx.lineTo(lines[nl].x,lines[nl].y);
				ctx.stroke();
			});

		});
		this.bullets.forEach(bullet=>{
			ctx.beginPath();
			ctx.arc(bullet.x,bullet.y,bullet.width,0,2*Math.PI);
			ctx.stroke();	
		});
	}
}
class You{
	constructor(x,y){
		this.x = x;
		this.y = y;
		this.theta = 0;
		this.aimX = 2000;
		this.aimY = 400;
		this.width = 50;
		this.height = 30;
		this.speed = 5;
		this.weapon = new Weapon(15,Math.PI/4,5,2,10);
		this.shooting = false;
	}
	getCenter(){
		return {
			x: this.x+this.width/2,
			y: this.y+this.height/2
		}
	}
	getFirePoint(){
		return {
			x: this.x+this.width/2 + this.width/2*Math.cos(this.theta),
			y: this.y+this.height/2+ this.height/2*Math.sin(this.theta),
		}
	}
	shoot(){
		if(this.shooting){
			if(!this.weapon.auto)
				this.shooting = false;
			this.weapon.shoot(this,this.aimX, this.aimY);
		}
	}
}
class Enemy{
	constructor(x,y,width,height,speed){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.generate();
	}
	generate(){
		this.lines = [];
		for(let i = 0; i < Math.floor(Math.random()*4) + 4; i++){
			this.lines.push({
				x: Math.floor(Math.random()*this.width),
				y: Math.floor(Math.random()*this.height)
			});
		}
	}
	getLines(){
		let shiftedLines = [];
		this.lines.forEach(line=>{
			shiftedLines.push({
				x: line.x + this.x,
				y: line.y + this.y
			});	
		});
		return shiftedLines;
	}
	move(){
		this.x -= this.speed;
	}

}
class Weapon{
	constructor(speed,spread,flechettes,pierce,fireDelay){
		this.speed = speed;
		this.spread = spread;
		this.flechettes = flechettes;
		this.pierce = pierce;
		this.fireDelay = fireDelay;
		this.timeout = 0;
	} 
	shoot(you,x,y){
		if(this.timeout > game.scene.time)
			return;
		for(let i = -this.spread/2;i<this.spread/2;i+=this.spread/this.flechettes){
			let bullet = new Bullet(you.getFirePoint().x,you.getFirePoint().y,this.speed);
			bullet.setDirection(x,y,x > 0, y > 0,i);
			game.scene.bullets.push(bullet);
		}
		this.timeout = game.scene.time + this.fireDelay;
	}
}	
class Bullet {
	constructor(x,y,speed,pierce){
		this.x = x;
		this.y = y;
		this.width = 5;
		this.height = 5;
		this.speed = speed;
		this.pierece = pierce;
	}
	setDirection(x,y,xSign,ySign,spread){
		let theta = Math.atan(Math.abs(y)/Math.abs(x));
		theta += spread;
		this.direction = {};
		this.direction.x = Math.cos(theta) * (xSign?1:-1);
		this.direction.y = Math.sin(theta) * (ySign?1:-1);
	}
	move(){
		this.x += this.speed * this.direction.x;
		this.y += this.speed * this.direction.y;
	}

}
let game = new Game();

window.addEventListener('load',()=>{
	let canvas = document.getElementById('canvas');
	game.addCanvas(canvas);

});
