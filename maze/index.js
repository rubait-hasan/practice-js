const {Engine, Render, Runner, World, Bodies, Body,Events} = Matter;

// const cells = 5;
const width = window.innerWidth;
const height = window.innerHeight;
const cellsHorizontal = 5;
const cellsVertical = 7;
// const unitLength = width/cells;
const unitLengthX = width/cellsHorizontal;
const unitLengthY = width/cellsVertical;

const engine = Engine.create();
const {world} = engine;
const render = Render.create({
    element:document.querySelector('body'),
    engine: engine,
    options:{
        wireframes:false,
        width,
        height
    }
});
Render.run(render);
Runner.run(Runner.create(),engine);


//Walls
const rectHeight = 2;
const walls = [
    Bodies.rectangle(width/2,0,width,rectHeight,{isStatic:true}),
    Bodies.rectangle(width,height/2,rectHeight,height,{isStatic:true}),
    Bodies.rectangle(width/2,height,width,rectHeight,{isStatic:true}),
    Bodies.rectangle(0,height/2,rectHeight,height,{isStatic:true}),
]
World.add(world,walls);

//Maze generation

// const grid=[];
// for(let i=0;i<3;i++){
//     grid.push([]);
//     for(let j=0;j<3;j++){
//         grid[i].push(false)
//     }
// }

 const shuffle = arr => {
     let counter = arr.length;

     while(counter>0){
         const index = Math.floor(Math.random() * counter);
         counter--;
         const temp = arr[counter];
         arr[counter] = arr[index];
         arr[index] = temp;
     }
     return arr;
 }  

const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));
const verticals = Array(cellsVertical).fill(null).map(()=>Array(cellsHorizontal-1).fill(false));
const horizontals = Array(cellsVertical-1).fill(null).map(()=>Array(cellsHorizontal).fill(false));
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row,column)=>{
    //If i have visited the cell ar [row, column] then return
    if(grid[row][column]){
        return;
    }

    //Mark this cell as being visited

    grid[row][column] = true;

    //Assemble randomly-ordered list of neighbors

    const neighbors = shuffle([
        [row-1, column,'up'],
        [row, column+1,'right'],
        [row+1, column,'down'],
        [row, column-1,'left']
    ]);

    //For each neighbor......

    for (let neighbor of neighbors){
        const [nextRow,nextColumn,direction] = neighbor;
         //See if that neighbor is out of bounds
        if(nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal){
        continue;
        }
        //If we have visited that neighbor, continue to next neighbor
        if(grid[nextRow][nextColumn]){
        continue;
        }

        //Remove a wall from the either horizontals or verticals
        if(direction === 'left'){
        verticals[row][column-1] = true;
        }else if (direction === 'right'){
        verticals[row][column] = true;
        }else if(direction === 'up'){
        horizontals[row-1][column] = true;
        }else if(direction === 'down'){
        horizontals[row][column] = true;
        } 
        stepThroughCell(nextRow, nextColumn);
        
    }
 //visit the next cell

 
}
// stepThroughCell(startRow, startColumn);
stepThroughCell(startRow, startColumn);
//Horizontal wall
horizontals.forEach((row, rowIndex) =>{
    row.forEach((open,columnIndex) =>{
        if(open){
            return;
        }
    const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX/2,
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        2,{
            label:'wall',
            isStatic:true,
            render:{
                fillStyle:'darkgrey'
            }
        } 
    );
    World.add(world,wall);
    });
});
//vertical wall
verticals.forEach((row, rowIndex) =>{
    row.forEach((open,columnIndex) =>{
        if(open){
            return;
        }
    const wall = Bodies.rectangle(
        columnIndex * unitLengthX + unitLengthX,
        rowIndex * unitLengthY + unitLengthY/2,
        2,
        unitLengthY,{
            label:'wall',
            isStatic:true,
            render:{
                fillStyle:'darkgrey'
            }
        } 
    );
    World.add(world,wall);
    });
});

//Goal
const goal = Bodies.rectangle(
    width - unitLengthX/2.1,
    height - unitLengthY/2.1,
    unitLengthX * 0.5,
    unitLengthY * 0.5,{
        label:'goal',
        isStatic:true,
        render:{
            fillStyle:'red'
        }
        
    }

);

World.add(world, goal);

//Ball
const ballRadius = Math.min(unitLengthX, unitLengthY)/4;
const ball = Bodies.circle(
    unitLengthX/2,
    unitLengthY/2,
    ballRadius,{
        label:'ball',
        render:{
            fillStyle:'blue'
        }
    }
);
World.add(world,ball);

//keyboard Event

document.addEventListener('keydown',event=>{
    const {x,y} = ball.velocity;
    const speedLimit = 15;
    const value = 5;

    if(event.key === 'ArrowUp' || event.key === 'w'){
        Body.setVelocity(ball, {x,y:Math.max(y-value,-speedLimit)});
        
    }
    if(event.key === 'ArrowRight' || event.key === 'd'){
        Body.setVelocity(ball, {x:Math.max(x+value,speedLimit),y});
    }
    if(event.key === 'ArrowDown' || event.key === 's'){
        Body.setVelocity(ball, {x,y:Math.max(y+value,speedLimit)});
    }
    if(event.key === 'ArrowLeft' || event.key === 'a'){
        Body.setVelocity(ball, {x:Math.max(x-value,-speedLimit),y});
    } 
});

//Win Condition

Events.on(engine,'collisionStart',event=>{
    event.pairs.forEach(collision =>{
        const labels =['ball','goal'];
        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body=>{
                if(body.label === 'wall'){
                    Body.setStatic(body,false);
                }
            })
        }
    });
})