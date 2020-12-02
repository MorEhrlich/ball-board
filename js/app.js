const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG = '<img src="img/candy.png" />';

var gBoard;
var gGamerPos;
var gBallCount = 0;
var gInterval;
var gGlueInterval;
var gBallsBoard;
var gGlued = false;

function initGame() {
	gBallCount = 0;
	var elButton = document.querySelector('button');
	elButton.style.display = 'none';
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	setInterval(moveTo, 1000);
	if (!gInterval) {
		gInterval = setInterval(newBall, 2000)
		gGlueInterval = setInterval(addGlow, 5000);
	}
}


function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)

	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			if (i === 0 && j === 5 || i === 9 && j === 5 ||
				i === 5 && j === 0 || i === 5 && j === 11) {
				cell.type = FLOOR;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			cellClass += (currCell.type === WALL) ? ' wall' : ' floor';

			
			// TODO - Change To template string
			strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`;

			// TODO - change to switch case statement
			switch (currCell.gameElement) {
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
				case GLUE:
					strHTML += GLUE_IMG
					break;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	console.log('strHTML is:');
	console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {

	if (gGlued) return; 

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;


	if (i === -1) i = 9;
	if (i === 10) i = 10;
	if (j === -1) j = 0;
	if (j === 12) j = 11;



	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			playSound();
			gBallCount++;
			var currBallCount = document.querySelector('.ballsCount')
			currBallCount.innerHTML = `<div class="ballsCount"> Balls Collected: ${gBallCount}</div>`;
			console.log('Collecting!');
			if (gBallCount === 0) {
				gameOver();
			}
		}

		if (targetCell.gameElement === GLUE) {
			var gGlued = true;
			setTimeout(function () {
				gGlued = false;
			}, 3000);

		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}


function newBall() {
	var emptyCells = findEmptyCells();
	var randCell = emptyCells[getRandomInt(0, emptyCells.length)];
	gBoard[randCell.i][randCell.j].gameElement = BALL;
	gBallsBoard++;
	renderCell(randCell, BALL_IMG);
}

function findEmptyCells() {
	var emptyCells = [];
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[i].length; j++) {
			if (gBoard[i][j].type === FLOOR && !gBoard[i][j].gameElement) {
				var emptyCell = { i: i, j: j };
				emptyCells.push(emptyCell);
			}
		}
	}
	return emptyCells;
}

function addGlow() {
	var emptyCells = findEmptyCells();
	var randCell = emptyCells[getRandomInt(0, emptyCells.length)]
	if (gBoard[randCell.i][randCell.j].gameElement !== GAMER) {
		gBoard[randCell.i][randCell.j].gameElement = GLUE;
		renderCell(randCell, GLUE_IMG)
		setTimeout(function () {
			if (board[i][j].gameElement === GAMER) return;
			board[i][j].gameElement = null;
			renderCell({ i, j }, '');
		}, 3000);
	}
}


function gameOver() {
	alert('YOU WON');
	clearInterval(gInterval);
	clearInterval(gGlueInterval);
	var elButton = document.querySelector('button');
	elButton.style.display = 'block';
}


// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;


	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;

	}

}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}


function playSound() {
	var eatSound = new Audio('sound/pac_bonus.wav');
	eatSound.play();
}