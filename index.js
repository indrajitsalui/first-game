let canvas= document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height= window.innerHeight

let context = canvas.getContext('2d')
// console.log(context);

 const startGameBtn = document.querySelector('#startGameBtn')
 const scoreSpan= document.querySelector('#scoreSpan')
 const modalHide = document.querySelector('#modalHide')
 const h1Score= document.querySelector('#h1Score')

//first lets create a player 

class Player{
	constructor( x,y,radius,color){
		this.x=x 
		this.y=y 
		this.radius=radius  
		this.color = color  
	}

	draw(){
		context.beginPath()
		context.arc(this.x,this.y,this.radius,0,360,false)
		context.fillStyle=this.color
		context.fill()
	}
}
const x = canvas.width/2;
const y = canvas.height/2;

let player = new Player(x,y,10,'white')


let projectiles=[]
let enemies=[]
let particles =[]

function init(){
 player = new Player(x,y,10,'white')


 projectiles=[]
 enemies=[]
 particles =[]
 score=0
 h1Score.innerHTML=0
 scoreSpan.innerHTML=0

}
// end of player creation 

// lets now shoot projecctiles

class Projectile{

	constructor(x,y,radius,color,velocity){

		this.x=x 
		this.y=y 
		this.radius=radius  
		this.color = color  
		this.velocity= velocity


	}

	draw(){
		context.beginPath()
		context.arc(this.x,this.y,this.radius,0,360,false)
		context.fillStyle=this.color
		context.fill()
	}

	update(){
		this.x = this.x + this.velocity.x  
		this.y = this.y + this.velocity.y
	}
}

//const projectile = new Projectile(x, y , 5, 'red', { x : 1, y:1 })




window.addEventListener('click',(pointerEvent)=>{
	//console.log(pointerEvent)
//const projectile = new Projectile(pointerEvent.clientX, pointerEvent.clientY , 5, 'red', null)
//console.log(projectiles)

const angle = Math.atan2( pointerEvent.clientY - y, pointerEvent.clientX - x)

let velocity={
	x : Math.cos(angle)*4,
	y: Math.sin(angle)*4
}
//console.log("angle ", angle)

projectiles.push(new Projectile(x,y,5,'white',velocity))

	
})



//let's create enemies now 

class Enemy{

	constructor(x,y,radius,color,velocity){

		this.x=x 
		this.y=y 
		this.radius=radius  
		this.color = color  
		this.velocity= velocity


	}

	draw(){
		context.beginPath()
		context.arc(this.x,this.y,this.radius,0,360,false)
		context.fillStyle=this.color
		context.fill()
	}

	update(){
		this.x = this.x + this.velocity.x  
		this.y = this.y + this.velocity.y
	}
}



class Particle{

	constructor(x,y,radius,color,velocity){

		this.x=x 
		this.y=y 
		this.radius=radius  
		this.color = color  
		this.velocity= velocity
		this.alpha=1
		this.friction= 0.99


	}

	draw(){
		context.save()
		context.globalAlpha = this.alpha
		context.beginPath()
		context.arc(this.x,this.y,this.radius,0,360,false)
		context.fillStyle=this.color
		context.fill()
		context.restore()
	}

	update(){
		this.x = this.x + this.velocity.x  
		this.y = this.y + this.velocity.y
		this.velocity.x *= this.friction
		this.velocity.y *= this.friction
		this.alpha -= 0.01
	}
}




function spawnEnemies(){
	setInterval(()=>{
	let xEnemy,yEnemy,radius;
	let color= `hsl(${Math.random()*360},50%,50%)`;
	radius = Math.random() * (30-5) + 5
	if(Math.random()<0.5){
		xEnemy= Math.random() < 0.5 ? 0 - radius : canvas.width + radius
		yEnemy= Math.random() * canvas.height
	}
	else{
		yEnemy= Math.random() < 0.5 ? 0 - radius : canvas.height + radius
		xEnemy= Math.random() * canvas.width
	}
	const enemyAngle = Math.atan2( y- yEnemy, x - xEnemy)

	let enemyVelocity={
		x : Math.cos(enemyAngle),
		y: Math.sin(enemyAngle)
	}
	enemies.push(new Enemy(xEnemy,yEnemy,radius, color, enemyVelocity))},1000)
}

let animationFrameId
let score=0
function animate(){
	animationFrameId = requestAnimationFrame(animate)
	context.fillStyle= 'rgba(0, 0, 0, 0.1)';
	context.fillRect(0,0,canvas.width,canvas.height)

	//drawing the player 
	player.draw()


	//drawing particles to be shown on collison 
	particles.forEach((particle, particleIndex)=>{

		if(particle.alpha <= 0){
			particles.splice(particleIndex,1)

		}
		else{
			particle.draw()
			particle.update()
		}
	})


	//drwaimg projectiles and updating them to make them move 
	projectiles.forEach((projectile, projectileIndex)=>{
		projectile.draw()
		projectile.update()

		//removing the  projectiles from the array which are going out of screen 
		if(projectile.x + projectile.radius < 0 ||
		 	projectile.x -projectile.radius > canvas.width ||
		  	projectile.y + projectile.radius <0 ||
			projectile.y - projectile.radius >canvas.height)
		{
			setTimeout(()=>{
					projectiles.splice(projectileIndex,1)
			})

		}
	})


	//drawing the enemy and updating it to make it moving 
	enemies.forEach((enemy,enemyIndex)=>{
		enemy.draw()
		enemy.update()

		const playerDist= Math.hypot(player.x-enemy.x , player.y-enemy.y)

		//enemy hits player so stop game 
		if(playerDist - player.radius - enemy.radius < 1){
			cancelAnimationFrame(animationFrameId)
			h1Score.innerHTML=score
			modalHide.style.display = 'flex'

		}

		//traversing existing projectiles to check for a hit with enemy 
		projectiles.forEach((projectile,projectileIndex)=>{

			const dist= Math.hypot(projectile.x-enemy.x , projectile.y-enemy.y)

			//projectiles hit enemy , so remove both 
			if(dist - projectile.radius - enemy.radius <1){


				//create collison particles for explosion 
				for(let i =0; i<enemy.radius ;i++){

					particles.push(new Particle(projectile.x , projectile.y , Math.random() *2  ,enemy.color , { x : (Math.random() - 0.5)* (Math.random(8)+2) , y: (Math.random() - 0.5)*(Math.random(8)+2)}))
				}


				// destroy enemy or shrink it depending on its radius
				if(enemy.radius - 10 > 5 ){

					score += 20 
					gsap.to(enemy,{
						radius : enemy.radius - 10 
					})

					setTimeout(()=>{
						projectiles.splice(projectileIndex,1)

					},0)


				}
				else{

					score += 50 

					setTimeout(()=>{
						enemies.splice(enemyIndex,1)
						projectiles.splice(projectileIndex,1)

					},0)
				}

				scoreSpan.innerHTML = score
				
			}
		})
	})
}


startGameBtn.addEventListener('click',()=>{
	init()
	animate()
	spawnEnemies()
	modalHide.style.display = 'none'
})




//lets do projectile hit 

//lets create particles 


//todo : create a game over pop up and start/ restart game ui 




