import {layouts} from "./maps.js";

document.addEventListener("DOMContentLoaded", () => {
  //initiating:
  var squares = []; //overall MAP or GRID array
  var ghosts = []; //array of all the ghosts (4 total)
  var dotsToWin = 0;
  const grid = document.querySelector(".grid");
  const debugScreen = document.getElementById("debugScreen");
  const scoreDisplay = document.getElementById("score");
  const width = 28; //28x28 = 784
  var score = 0;
  var mapLength = 0;
  var leftExit = 0;
  var rightExit = 0;
  var j = 0;
  var layoutChosen = layouts[Math.floor(Math.random() * layouts.length)];
  var activeGSpawn = [];

  //draw the grid and render it:
  function renderGrid(map) {
    for (let i = 0; i < map.length; i++) {
      const square = document.createElement("div");
      grid.appendChild(square);
      squares.push(square);

      //format the layout data into map:
      if (map[i] === 0) {
        squares[i].classList.add("pac-dot");
        //generate score requirements to win:
        dotsToWin++;
      } else if (map[i] === 1) {
        squares[i].classList.add("wall");
      } else if (map[i] === 2) {
        squares[i].classList.add("ghost-lair");
        //add to array for total number of possible ghost Spawn locations
        activeGSpawn[j] = i;
        j++;
      } else if (map[i] === 3) {
        squares[i].classList.add("power-pellet");
      } else if (map[i] === 4) {
        squares[i].classList.add("empty");
      } else if (map[i] === 5) {
        if (i % 28 === 0) {
          leftExit = i;
        } else rightExit = i;
      }
    }
    mapLength = map.length;
  }
  renderGrid(layoutChosen);

  //PacMan's starting position:
  let pacManCurrentIndex = leftExit;
  squares[pacManCurrentIndex].classList.add("pac-man");

 //events when pacMan eats a dot:
 function pacDotEaten() {
  if (squares[pacManCurrentIndex].classList.contains("pac-dot")) {
    score++;
    dotsToWin--;
    scoreDisplay.innerHTML = score;
    squares[pacManCurrentIndex].classList.remove("pac-dot");
  }
}

  //removing ghost SCARE timer(see below):
  function unScareGhosts() {
    ghosts.forEach((ghost) => (ghost.isScared = false));
  }

  //events when pacMan eats a Power Pellet (ghosts become scared):
  function pwrPelletEaten() {
    if (squares[pacManCurrentIndex].classList.contains("power-pellet")) {
      //give pacMan points
      score += 10;
      scoreDisplay.innerHTML = score;
      squares[pacManCurrentIndex].classList.remove("power-pellet");
      //turn ghosts BLUE
      ghosts.forEach((ghost) => (ghost.isScared = true));
      setTimeout(unScareGhosts, 10000);
    }
  }

  //events when pacMan eats all the dots:
  function winChk() {
    if (dotsToWin === 0) {
      ghosts.forEach((ghost) => clearInterval(ghost.timerId));
      document.removeEventListener("keyup", movePacMan);
      scoreDisplay.innerHTML = "You won!";
    }
  }

  //events when pacMan gets eaten:
  function gameOverChk() {
    if (
      squares[pacManCurrentIndex].classList.contains("ghost") &&
      !squares[pacManCurrentIndex].classList.contains("scared-ghost")
    ) {
      squares[pacManCurrentIndex].classList.remove("pac-man");
      ghosts.forEach((ghost) => clearInterval(ghost.timerId));
      document.removeEventListener("keyup", movePacMan);
      //setTimeout(function() {alert("You've been eaten!")}, 500);
      scoreDisplay.innerHTML = "GAME OVER!!!";
    }
  }
  //events when a ghost gets eaten:
  function ghostEatenChk() {
    if (squares[pacManCurrentIndex].classList.contains("ghost")) {
     ghosts.forEach(ghost => {
       if (squares[ghost.currentIndex].classList.contains("pac-man")) {
        squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost")
        ghost.currentIndex = ghost.startIndex;
        score += 100;
        scoreDisplay.innerHTML = score;
        squares[ghost.currentIndex].classList.add(ghost.className, "ghost");
        if (ghost.isScared) {
          squares[ghost.currentIndex].classList.add("scared-ghost");
        }
       }
     })
    }
  }
  //PacMan's movement:
  function movePacMan(element) {
    squares[pacManCurrentIndex].classList.remove("pac-man");

    switch (element.key) {
      case "a": //left
        //essentially, if pacMan isn't in the first column (0, 28, 56, etc.,) then he can move to the left.
        if (
          pacManCurrentIndex % width !== 0 &&
          !squares[pacManCurrentIndex - 1].classList.contains("wall")
        )
          if (!squares[pacManCurrentIndex - 1].classList.contains("ghost-lair"))
            pacManCurrentIndex -= 1;
        //now we check if pacMan is at a LEFT EXIT:
        if (pacManCurrentIndex - 1 === leftExit) {
          pacManCurrentIndex = rightExit - 1;
        }
        break;
      case "w": //up
        //if pacMan isn't in the first row (0 - 27), then he can move up. Moving up, though, is essentially taking an entire row's value away - hence minus WIDTH
        if (
          pacManCurrentIndex - width > 28 &&
          !squares[pacManCurrentIndex - width].classList.contains("wall")
        )
          if (
            !squares[pacManCurrentIndex - width].classList.contains(
              "ghost-lair"
            )
          )
            pacManCurrentIndex -= width;
        break;
      case "d": //right
        //if packman
        if (
          pacManCurrentIndex % width < width - 1 &&
          !squares[pacManCurrentIndex + 1].classList.contains("wall")
        )
          if (!squares[pacManCurrentIndex + 1].classList.contains("ghost-lair"))
            pacManCurrentIndex += 1;
        //now we check if pacMan is at a RIGHT EXIT:
        if (pacManCurrentIndex + 1 === rightExit) {
          pacManCurrentIndex = leftExit + 1;
        }
        break;
      case "s": //down
        if (
          pacManCurrentIndex + width < mapLength - width &&
          !squares[pacManCurrentIndex + width].classList.contains("wall")
        )
          if (
            !squares[pacManCurrentIndex + width].classList.contains(
              "ghost-lair"
            )
          )
            pacManCurrentIndex += width;
        break;
    }

    squares[pacManCurrentIndex].classList.add("pac-man");
    debugScreen.innerHTML = pacManCurrentIndex;

    pacDotEaten();
    pwrPelletEaten();
    gameOverChk();
    winChk();
    ghostEatenChk();
  }

  document.addEventListener("keyup", movePacMan);

  //get coordinates of ghost or pacman
  function getCoordinates(index) {
    return [index % width, Math.floor(index / width)]; //remainder of index/width will give us the horizontal locale, and the roundDown of index/width will give us vert.
  }

  //Ghost template:
  class Ghost {
    constructor(className, startIndex, speed) {
      this.className = className;
      this.startIndex = startIndex;
      this.speed = speed; //in milliseconds between moves
      this.currentIndex = startIndex;
      this.timerId = NaN;
      this.isScared = false;
      this.isChasing = false;
      this.moveDir = 0
    }
  }

  ghosts = [
    new Ghost("inky", 0, 300),
    new Ghost("blinky", 0, 250),
    new Ghost("pinky", 0, 400),
    new Ghost("clyde", 0, 500), //one, tubby-tubby, two, tubby-tubby...
  ];

  //spawn location for ghosts:
  function setNewStartLocation(ghost) {
    //cycle through start locations until one is found that is
    let tempStart = 0;
    do {
      tempStart = Math.floor(Math.random() * activeGSpawn.length);
    } while (squares[activeGSpawn[tempStart]].classList === "ghost");
    //randomize which spot the ghost will go into by selecting it from the array
    ghost.startIndex = activeGSpawn[tempStart]; //assign aforementioned randomized spot to the ghost as its NEW STARTING SPOT
    ghost.currentIndex = ghost.startIndex;
    squares[ghost.currentIndex].classList.add(ghost.className, "ghost");
    //ghosts were being walked through by other ghosts, so I added a verification step:
    if (squares[ghost.currentIndex].classList !== ghost.className)
      squares[ghost.currentIndex].classList.add(ghost.className);
    if (squares[ghost.currentIndex].classList !== "ghost")
      squares[ghost.currentIndex].classList.add("ghost");
    activeGSpawn.splice(tempStart, 1); //take the spot out of the array so that no other ghost can be placed there
  }

  ghosts.forEach((ghost) => setNewStartLocation(ghost));

  //DEBUGGER CODE: Translate direction numbers into words:
  function translateDir(path) {
    if (path == -1) {
      return "left";
    } else if (path == 1) {
      return "right";
    } else if (path == width) {
      return "down";
    } else if (path == -width) {
      return "up";
    }
  }

  //scan for possible directions that the ghosts can move in:
  function dirScan(ghost) {
    let dir = [];
    if (!squares[ghost.currentIndex - 1].classList.contains("wall") && !squares[ghost.currentIndex - 1].classList.contains("ghost")
    ) {dir.push(-1)}
    if (!squares[ghost.currentIndex + 1].classList.contains("wall") && !squares[ghost.currentIndex + 1].classList.contains("ghost")
    ) {dir.push(+1)}
    if (!squares[ghost.currentIndex - width].classList.contains("wall") && !squares[ghost.currentIndex - width].classList.contains("ghost")
    ) {dir.push(-width)}
    if (!squares[ghost.currentIndex + width].classList.contains("wall") && !squares[ghost.currentIndex + width].classList.contains("ghost")
    ) {dir.push(+width)}
    if (dir.length == 0) {dir = [-1, +1, -width, +width]}
    dir.sort(() => 0.5 - Math.random());
    return dir;
  }

  //can the ghost see pacMan along the horizontal axis?
  function ghostSeesPacX(ghost, ghostY,pacManY, ghostX, pacManX) {
    var canSeeX = 0;
    let alignedX = false;
    let i = ghost.currentIndex;
      if(ghostY === pacManY) {
        alignedX = true;
        if (ghostX > pacManX) {
          do {
            i--;
            if (squares[i].classList.contains("wall")){
              canSeeX++;
            }
          } while ((!squares[i].classList.contains("wall")) && (!squares[i].classList.contains("pac-man")));
      } else {
          do {
            i++;
            if (squares[i].classList.contains("wall")){
              canSeeX++;
            }
          } while ((!squares[i].classList.contains("wall")) && (!squares[i].classList.contains("pac-man")));
      }
    }
    if (alignedX === true) {
      if (canSeeX > 0) {
        return false;
      } else {
        if (ghostX < pacManX) {
          return +1;
        } else if (ghostX > pacManX) {
          return -1;
        }
      }
    } else {return false};
  }
  //can the ghost see pacMan along the vertical axis?
  function ghostSeesPacY(ghost, ghostY,pacManY, ghostX, pacManX) {
    var canSeeY = 0;
    let alignedY = false;
    let i = ghost.currentIndex;
      if(ghostX === pacManX) {
        alignedY = true;
        if (ghostY > pacManY) {
          do {
            i = i - width;
            if (squares[i].classList.contains("wall")){
              canSeeY++;
            }
          } while ((!squares[i].classList.contains("wall")) && (!squares[i].classList.contains("pac-man")));
      } else {
          do {
            i = i + width;
            if (squares[i].classList.contains("wall")){
              canSeeY++;
            }
          } while ((!squares[i].classList.contains("wall")) && (!squares[i].classList.contains("pac-man")));
      }
    }
    if (alignedY === true) {
      if (canSeeY > 0) {
        return false;
      } else {
        if (ghostY < pacManY) {
          return +width;
        } else if (ghostY > pacManY) {
          return -width;
        }
      }
    } else {return false};
  }

  //ACTUAL MOVEMENT: if the square where the active ghost is about to go does not contain a wall, continue moving in that direction. Seperate from "IF BLOCKED BY GHOST",
  //                  since this will ensure that if they are chasing pacMan, they will continue heading in that direction until they've hit a wall.

  //subpart of ghostMoveActual dedicated to SCARED ghost mechanics
  function ghostMoveScared(ghost, pathChosen, chaseX, chaseY) {
    let dir = [];
    let directions = [];
    ghost.isChasing = false;
    if ((chaseX !== false) || (chaseY !== false)) {
      if (chaseX !== false) {
        dir = dirScan(ghost)
        const filteredDir = dir.filter(e => e !== chaseX);
        directions = filteredDir;
      } else if (chaseY !== false) {
        dir = dirScan(ghost);
        const filteredDir = dir.filter(e => e !== chaseY);
        directions = filteredDir;
      }
    } else {
      directions = dirScan(ghost);
    }

    pathChosen = directions[Math.floor(Math.random() * directions.length)];
    if (!squares[ghost.currentIndex + pathChosen].classList.contains("wall")) {
      if (!squares[ghost.currentIndex + pathChosen].classList.contains("ghost")) {
        squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost");
        ghost.currentIndex += pathChosen;
        squares[ghost.currentIndex].classList.add(ghost.className, "ghost");
        if (ghost.isScared) {
          squares[ghost.currentIndex].classList.add("scared-ghost");
        }
      } else {
        //wait for the other ghost to move
      }
    } else {
        ghost.isChasing = false;
        ghost.moveDir = 0;
    }
  }
  //subpart of ghostMoveActual dedicated to BRAVE ghost mechanics
  function ghostMoveBrave(ghost, pathChosen) {
    if (ghost.isChasing == true) {
      if (!squares[ghost.currentIndex + pathChosen].classList.contains("wall")) {
        if (!squares[ghost.currentIndex + pathChosen].classList.contains("ghost")) {
          squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost");
          ghost.currentIndex += pathChosen;
          squares[ghost.currentIndex].classList.add(ghost.className, "ghost");
          if (ghost.isScared) {
            squares[ghost.currentIndex].classList.add("scared-ghost");
          }
        } else {
          //wait for the other ghost to move
        }
      } else {
          ghost.isChasing = false;
          ghost.moveDir = 0;
      }
    } else {
      if (!squares[ghost.currentIndex + pathChosen].classList.contains("wall") && !squares[ghost.currentIndex + pathChosen].classList.contains("ghost")) {
        squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost");
        ghost.currentIndex += pathChosen;
        squares[ghost.currentIndex].classList.add(ghost.className, "ghost");
        if (ghost.isScared) {
          squares[ghost.currentIndex].classList.add("scared-ghost");
        }
      } else {
        ghost.moveDir = 0;
      }
    }
  }

  function ghostMoveActual(ghost, pathChosen, chaseX, chaseY) {
    if (ghost.isScared == true) {
      ghostMoveScared(ghost,pathChosen, chaseX, chaseY);
    } else {
      ghostMoveBrave(ghost,pathChosen);
    }
  }

  //innards of how the ghosts move; sets up ghost movement to then call ghostMoveActual
  function moveGhost(ghost) {

    ghost.timerId = setInterval(function () {
      const [ghostX, ghostY] = getCoordinates(ghost.currentIndex);
      const [pacManX, pacManY] = getCoordinates(pacManCurrentIndex);
      let chaseX = ghostSeesPacX(ghost, ghostY, pacManY, ghostX, pacManX);
      let chaseY = ghostSeesPacY(ghost, ghostY, pacManY, ghostX, pacManX);
      var directions = [];
      var pathChosen = 0;
      //set up CHASE MODE: check if ghost has seen pacMan, and if so - direct it to head in pacMan's direction
      if ((chaseX !== false) || (chaseY !== false)) {
        ghost.isChasing = true;
        if (chaseX !== false) {
          directions.push(chaseX);
        } else if (chaseY !== false) {
          directions.push(chaseY);
        }
        pathChosen = directions[0];
        ghost.moveDir = pathChosen;
      } else {
        if ((ghost.isChasing === true)) {
          directions.push(ghost.moveDir);
          pathChosen = directions[0];
        } else {
          if (ghost.moveDir === 0) {
            directions = dirScan(ghost);
            pathChosen = directions[Math.floor(Math.random() * directions.length)];
          } else {
            directions.push(ghost.moveDir);
            pathChosen = directions[0];
          }
        }
      }

      ghostMoveActual(ghost, pathChosen, chaseX, chaseY);
      
      //debugger: Which ghost can go where, where they choose to go, and what's located at their chosen destination
      // console.log(
      //   "ghost name is: ",
      //   ghost.className,
      //   ", it's possible directions of travel are: ",
      //   directions,
      //   ", out of which it chose to go: ",
      //   translateDir(pathChosen),
      //   ", where the square contains the following: ",
      //   squares[ghost.currentIndex + pathChosen].classList
      // );
      gameOverChk();
    }, ghost.speed);

  }
  //game calling each ghost to move:
  ghosts.forEach((ghost) => moveGhost(ghost));
})
