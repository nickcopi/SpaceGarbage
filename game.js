class Game{
	constructor(canvas){
		this.WIDTH = 1280;
		this.HEIGHT = 720;
		this.upKeys = [87,38];
		this.downKeys = [83,40];
		this.shootKeys = [32,13];
		this.rotateLeftKeys = [65,37]
		this.rotateRightKeys = [68,39]
		this.weaponsLeftKeys = [81,37]
		this.weaponsRightKeys = [69,39]
		this.BOTTOM_BORDER = this.HEIGHT - 100;
		this.weapons = {
			blaster: new Weapon('Blaster',0,10,0.0000001,1,1,20,3),
			fasterBlaster: new Weapon('Faster Blaster',3,15,0.0000001,1,1,10,3),
			ionCannon: new Weapon('Ion Cannon',5,5,0.000001,3,2,20,15),
			ionBeam: new Weapon('Ion Beam',7,20,0.000001,1,2,5,2,true),
			particleShredder: new Weapon('Quark Shredder',9,15,Math.PI/8,5,2,10,1),
			bigBlaster: new Weapon('Big Blaster',11,10,0.000001,2,2,8,15,1),
			turboBoom: new Weapon('Turbo Boom',13,15,Math.PI/8,7,2,10,3,1),
			pBeam: new Weapon('P Beam',17,15,0.00001,1,2,1,1,1),
			ultimate: new Weapon('Ultimate',19,20,Math.PI/8,7,2,3,3,1),
		}
		this.waveTexts = [
			'WASD or arrow keys to move. Space to shoot.',
			'That wasn\'t so bad, was it?',
			'Faster Blaster unlocked!',
			'Use Q and E or , and. to change wepaons.',
			'Ion Cannon unlocked!',
			'Different weapons have different stats.',
			'Ion Beam unlocked!',
			'Auto weapons let you hold down space.',
			'Quark Shredder unlocked!',
			'What\'s your favorite weapon?',
			'Big Blaster unlocked!',
			'Guns are cool.',
			'Turbo Boom unlocked!',
			'Still holding up?',
			'Haha, no new weapon this round.',
			'I wish I was a spaceship.',
			'P Beam unlocked!',
			'Get ready to have your mind blown.',
			'Ultimate unlocked!',
			'Have fun!',
		
		];
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
		this.infoText;
		this.time = 0;
		this.wave = 0;
		this.score = 0;
		this.lives = 100;
		this.enemies = [];
		this.bullets = [];
		this.paused = true;
		this.you = new You(5,720/2-40);
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
		if(!Math.floor((Math.random()*500/(this.wave+4))) && this.enemiesLeft > 0){
			let enemyWidth = Math.floor(Math.random() * 40) + 20;
			let enemyHeight = Math.floor(Math.random() * 40) + 20;
			let enemySpeed = Math.floor(Math.random() * 2 + (Math.floor(this.wave/5))) + 2;
			let enemyY = Math.floor(Math.random() * (game.BOTTOM_BORDER-enemyHeight));
			this.enemies.push(new Enemy(this.canvas.width,enemyY,enemyWidth,enemyHeight,enemySpeed));
			this.enemiesLeft--;
		}
	}
	newRound(){
		if(game.waveTexts[this.wave]) this.infoText = game.waveTexts[this.wave];
		this.wave++;
		for(let x in game.weapons){
			if(game.weapons[x].level == this.wave)
				this.you.weapons.push(game.weapons[x]);
		}
		this.enemiesLeft = Math.ceil(this.wave/4) * 10;
	}
	handleKeyDown(e){
		if(e.keyCode != 27) game.scene.paused = false;
		else game.scene.paused = true;
		game.shootKeys.forEach((key)=>{
			if(key == e.keyCode) game.scene.you.shooting = true;

		});
		game.scene.keys[e.keyCode] = true;
	}
	handleKeyUp(e){
		if(game.scene.gameEnd < game.scene.time -60){
			clearInterval(game.scene.interval);
			let canvas = game.scene.canvas;
			game = new Game();
			game.addCanvas(canvas);
			return;
		}
		game.weaponsLeftKeys.forEach((key)=>{
			if(key == e.keyCode){
				let you = game.scene.you;
				you.currentWeapon--;
				if(you.currentWeapon < 0) you.currentWeapon = you.weapons.length-1;
			}

		});
		game.weaponsRightKeys.forEach((key)=>{
			if(key == e.keyCode){
				let you = game.scene.you;
				you.currentWeapon++;
				if(you.currentWeapon >= you.weapons.length) you.currentWeapon = 0;
			}

		});
		game.shootKeys.forEach((key)=>{
			if(key == e.keyCode) game.scene.you.shooting = false;

		});
		game.scene.keys[e.keyCode] = false;
	}
	update(){
		if(this.paused) return;
		if(this.gameEnd) {
			this.time++;
			return;
		}
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
		this.gameEnd = this.time;
	}
	moveEnemies(){
		this.enemies.forEach(enem=>{
			enem.move();
		});
		for(let i = 0; i< this.enemies.length;i++){
			let enem = this.enemies[i];
			if(enem.x + enem.width < 0){
				this.lives -= enem.lines.length;
				if(this.lives <= 0) this.endGame();
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
			this.you.theta += Math.PI/50;
		}
		if(rotateLeft){
			this.you.theta -= Math.PI/50;
		}

	}
	render(){
		let ctx = this.ctx;
		let canvas = this.canvas;
		let bb = game.BOTTOM_BORDER;
		let you = this.you;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		/*check if paused*/
		if(this.paused){
			ctx.fillStyle = 'black';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = 'white';
			ctx.font = '150px AsteroidsLite';
			ctx.fillText(`Space Garbage`, 40,canvas.height/2 + 25);
			return;
		}
		/*check if gameEnd*/
		if(this.gameEnd){
			ctx.fillStyle = 'black';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = 'white';
			ctx.font = '150px AsteroidsLite';
			ctx.fillText(`Game Over!`, 175,canvas.height/2);
			ctx.font = '100px AsteroidsLite';
			let text = `Score: ${this.score}`;
			ctx.fillText(text, canvas.width/2 - ctx.measureText(text).width/2,canvas.height/2 + 110);
			return;
		}
		/*Draw "UI"*/
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'white';
		ctx.fillRect(0,bb,canvas.width,1);
		ctx.font = '20px AsteroidsLite';
		ctx.fillText(`Wave: ${this.wave}`, 10,bb+30);
		ctx.fillText(`Score: ${this.score}`, 10,bb+55);
		ctx.fillText(`Lives: ${this.lives}`, 10,bb+80);
		ctx.font = '30px AsteroidsLite';
		ctx.fillText(this.infoText, 180,bb+60);
		ctx.font = '20px Asteroids';
		let auto = you.weapons[you.currentWeapon].auto;
		ctx.fillText(`Weapon: ${you.weapons[you.currentWeapon].name} ${auto?'(A)':''}`, 1000,bb+30);
		ctx.fillText(`${60/you.weapons[you.currentWeapon].fireDelay} shots per second`, 1000,bb+55);
		let flech = you.weapons[you.currentWeapon].flechettes;
		ctx.fillText(`${flech} bullet${flech>1?'s':''} per shot`, 1000,bb+80);
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
		this.speed = 7;
		this.weapons = [game.weapons.blaster]
		this.currentWeapon = 0;
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
		let weapon = this.weapons[this.currentWeapon];
		if(this.shooting){
			if(!weapon.auto)
				this.shooting = false;
			weapon.shoot(this,this.aimX, this.aimY);
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
		//this.destinationY = Math.floor(Math.random()*game.BOTTOM_BORDER-this.height);
		//this.setDirection(1,this.destinationY,-1,1);
	}
	setDirection(x,y,xSign,ySign){
		let theta = Math.atan(Math.abs(y)/Math.abs(x));
		console.log(theta * Math.PI)
		this.direction = {};
		this.direction.x = Math.cos(theta) * (xSign?1:-1);
		this.direction.y = Math.sin(theta) * (ySign?1:-1);
	}
	generate(){
		this.lines = [];
		for(let i = 0; i < Math.floor(Math.random()*2 + (Math.floor(game.scene.wave/4))) + 3; i++){
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
		//this.x += this.speed * this.direction.x;
		//this.y += this.speed * this.direction.y;
		this.x -= this.speed;
	}

}
class Weapon{
	constructor(name,level, speed,spread,flechettes,pierce,fireDelay,projSize,auto){
		this.level = level;
		this.name = name;
		this.speed = speed;
		this.spread = spread;
		this.flechettes = flechettes;
		this.pierce = pierce;
		this.fireDelay = fireDelay;
		this.timeout = 0;
		this.auto = auto;
		this.projSize = projSize;
	} 
	shoot(you,x,y){
		if(this.timeout > game.scene.time)
			return;
		for(let i = -this.spread/2;i<this.spread/2;i+=this.spread/this.flechettes){
			let bullet = new Bullet(you.getFirePoint().x,you.getFirePoint().y,this.speed,this.projSize);
			bullet.setDirection(x,y,x > 0, y > 0,i);
			game.scene.bullets.push(bullet);
		}
		this.timeout = game.scene.time + this.fireDelay;
	}
}	
class Bullet {
	constructor(x,y,speed,radius){
		this.x = x;
		this.y = y;
		this.width = radius;
		this.height = radius;
		this.speed = speed;
	}
	setDirection(x,y,xSign,ySign,spread){
		let theta = game.scene.you.theta;//Math.atan(Math.abs(y)/Math.abs(x));
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
