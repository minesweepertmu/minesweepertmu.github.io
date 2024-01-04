let rowsG = 9
let colsG = 9
let mines = 10
let hardness = "easy"
let game = []
let currentFlags = 10
let seconds = 0;
let stopwatchInterval;
let startTimeInMs;
let endTimeInMs;

function makeTheMineLawn(rows, cols, x=-1, y=-1, ev=0, allFlags=[]) {
	seconds = 0
	currentFlags = mines
	game = []
	gameStatus = document.querySelector(".game-status")
	gameStatus.id = "start"
	document.querySelector(".main-game").innerHTML = ''
	document.querySelector(".main-game2").innerHTML = ''
	document.querySelector(".game-status").innerHTML = 'Restart'
	document.querySelector(".mines-count").textContent = currentFlags


	for (i = 0; i < rows; i++){
		game.push([])
		for (j = 0; j < cols; j++){
			game[i].push(0)
		}
	}

	for (i = 0; i < mines; i++){
		function randomRowAndColGen(){
			randomRow = Math.floor(Math.random() * rows)
			randomCols = Math.floor(Math.random() * cols)
			if (game[randomRow][randomCols] !== -1){
				if (x == -1 && y == -1){
					game[randomRow][randomCols] = -1
				}
				
				else if ((randomRow >= x-1 && randomRow <= parseInt(x)+1) && (randomCols >= y-1 && randomCols <= parseInt(y)+1)){
					randomRowAndColGen()
				}
				else {
					game[randomRow][randomCols] = -1
				}
			}
			else randomRowAndColGen()
		}
		randomRowAndColGen()
	}

	for (i = 0; i < rows; i++){
		for (j = 0; j < cols; j++){
			currentElement = game[i][j]
			if (currentElement !== -1) {
				count = 0
				for(k = -1; k < 2; k++){
					for (l = -1; l < 2; l++){
						if (!((k==0 && l==0) || (i+k<0) || (j+l<0) || (i+k>rows-1) || (j+l>cols-1))) {
							if (game[i+k][j+l] == -1) {
								count++
							}
						}
					}
					game[i][j] = count
				}
			}
		}
	}
	makeTheGameHTML()
	makeTheGameHTML2(allFlags)
	eventListenerForButtons()

	if (!(ev==0)) {
		inGameButtonClick(ev.target)
	}
}
makeTheMineLawn(rowsG, colsG)

function firstJSON() {
	const storedData = JSON.parse(localStorage.getItem('highScoresSelf'));
	if (!(storedData)) {
		localStorage.setItem('highScoresSelf', JSON.stringify({expert:[], int: [], easy: []}));
	}
}
firstJSON()

function setJSONHighScores() {
	const storedData = JSON.parse(localStorage.getItem('highScoresSelf'));
	if (storedData) {
		for (const [key, value] of Object.entries(storedData)) {
			currentRecords = document.querySelectorAll("."+key+"_high_self")
			for (i = 1; i <= value.length; i++) {
				let secondsHS = Math.floor(value[i-1] / 1000)
				let millisecondsHS = value[i-1] % 1000
				if (key==="expert") {
					document.querySelector("#ehs-"+i).textContent = secondsHS + "." + millisecondsHS +"s"
				}
				else if (key==="int") {
					document.querySelector("#eis-"+i).textContent = secondsHS + "." + millisecondsHS +"s"
				}
				else if (key==="easy") {
					document.querySelector("#hes-"+i).textContent = secondsHS + "." + millisecondsHS +" s"
				}
			}
		}
	}
}
setJSONHighScores()

function updateJSONHighScores(newScore) {

	let storedData = JSON.parse(localStorage.getItem('highScoresSelf'));
	if (storedData.expert[0] < 999 || storedData.int[0] < 999 || storedData.easy < 999) {
		if (storedData.expert[0] !== 0 || storedData.int[0] !== 0 || storedData.easy !== 0)
		localStorage.setItem('highScoresSelf', JSON.stringify({expert: [], int: [], easy: []}));
		alert("High scores were fixed, so old high scores got deleted")
	}

	if (storedData[hardness].length >= 10) {
		if (newScore < storedData[hardness][9]) {
			storedData[hardness].pop()
			storedData[hardness].push(newScore)
			storedData[hardness].sort()
		}
	}
	else {
		storedData[hardness].push(newScore)
		storedData[hardness].sort()
	}
	
	localStorage.setItem('highScoresSelf', JSON.stringify(storedData));
	setJSONHighScores()
	return 0;
}

function makeTheGameHTML(){
	mainGameHTML = document.querySelector(".main-game")
	for (i = 0; i < rowsG; i++){

		newRow = document.createElement("div")
		newRow.className = "game-row"
		mainGameHTML.appendChild(newRow)

		for (j = 0; j < colsG; j++){
			currentElement = document.createElement("div")
			currentElement.className = "single-element"

			currentCol = document.createElement("p")
			currentCol.textContent = game[i][j]

			currentElement.appendChild(currentCol)
			newRow.appendChild(currentElement)

		}
	}
	
}

function makeTheGameHTML2(previousFlags = []){
	mainGameHTML = document.querySelector(".main-game2")
	for (i = 0; i < rowsG; i++){

		newRow = document.createElement("div")
		newRow.className = "game-row"
		mainGameHTML.appendChild(newRow)

		for (j = 0; j < colsG; j++){
			currentElement = document.createElement("div")
			currentElement.className = "single-element"

			currentCol = document.createElement("button")
			currentCol.id = i.toString() + "/" + j.toString()
			currentElement.id = i.toString() + ":" + j.toString()
			currentCol.className = "game-button"

			currentElement.appendChild(currentCol)
			newRow.appendChild(currentElement)

			previousFlags.forEach(element => {
			    if (element.id === currentCol.id) {
			        currentFlags--;
			    	document.querySelector(".mines-count").textContent = currentFlags
			    	currentCol.classList.add("flagged")
			    	currentCol.innerHTML = "f";
			    }
			});

		}
	}
	
}


function handleButtonClick(event) {
	gameStatus = document.querySelector(".game-status")
	if (event.target.classList.contains("flagged") || event.target.classList.contains("closed")){
  		return 0;
  	}
  	else if ((gameStatus.id === "start") || (gameStatus.id === "lose")){
    	onFirstClick(event);
  	} 
  	else {
    	inGameButtonClick(event.target);
  	}
}


function onFirstClick(event) {
	idArray = event.target.id.split("/")
	if (event.target.classList.contains("flagged")) {
		return 0
	}
	else if (game[idArray[0]][idArray[1]] !== 0) {
		makeTheMineLawn(rowsG, colsG, idArray[0],idArray[1], event, document.querySelectorAll(".flagged"))
		let seconds = 0;
		let stopwatchInterval;

		startStopwatch()
	}
	else {
		startStopwatch()
		inGameButtonClick(event.target)
	}
  
}

function changeTheElement(element, action) {
	if (action === "open") {
		currentElement = document.getElementById(element)
		if (currentElement === null || currentElement.classList.contains("flagged")) {
			return 0
		}
		parentOfElement = currentElement.parentElement

		idArray = element.split("/")
		currentElement.remove()
		parentOfElement.classList.add("opened-div")
		let revealedText = game[idArray[0]][idArray[1]] === 0 ? " " : game[idArray[0]][idArray[1]];
		parentOfElement.textContent = revealedText
		eventListenerForOpened()

		if (document.querySelectorAll(".game-button").length == mines) {
	    	document.querySelector(".game-status").innerHTML = "You just won the game!"
    	}
		return 0

	}
	else if (action === "openFlag") {
		parentOfElement = element.parentElement
		idArray = element.id.split("/")
		element.remove()
		parentOfElement.classList.add("opened-div")
		let revealedText = game[idArray[0]][idArray[1]] === 0 ? " " : game[idArray[0]][idArray[1]];
		parentOfElement.textContent = revealedText
	}
	else if (action === "flag") {
		if (!(element.classList.contains("flagged"))) {
			currentFlags--;
			document.querySelector(".mines-count").textContent = currentFlags
			element.classList.add("flagged")
			element.innerHTML = "f";
		}
	}
	else if (action === "close") {
		element.classList.add("closed")
	}
}

function openTilesAfterLose() {
	allClosedTiles = document.querySelectorAll(".game-button");
	allClosedTiles.forEach((el)=>{
		idArray = el.id.split("/");
		if (game[idArray[0]][idArray[1]] == -1) {
			changeTheElement(el, "openFlag")
		}
		else {
			changeTheElement(el, "close")
		}
	});
}

function inGameButtonClick(eventTarget) {
    document.querySelector(".game-status").id = "mid-game"
    idArray = eventTarget.id.split("/");

    if (game[idArray[0]][idArray[1]] == -1) {
    	changeTheElement(eventTarget.id, "open")
    	stopStopwatch()
    	gameStatus = document.querySelector(".game-status")
		gameStatus.id = "lose"
		gameStatus.textContent = "You jost lost to the mine :("
		openTilesAfterLose()
        //makeTheMineLawn(rowsG, colsG, idArray[0], idArray[1]);
    } else {
        let result = new Set();
        function checkAllDirections(x, y) {
            if (x < 0 || y < 0 || x >= rowsG || y >= colsG || result.has(`${x}/${y}`)) {
                return 0;
            }

            currentElement = game[x][y];
            coordinates = [[0, -1], [-1, -1], [1, 1], [1, -1], [-1, 1], [-1, 0], [0, 1], [1, 0]];
            result.add(`${x}/${y}`);

            if (currentElement == 0) {
                for (let i = 0; i < coordinates.length; i++) {
                    const xCoord = x + coordinates[i][0];
                    const yCoord = y + coordinates[i][1];
                    checkAllDirections(xCoord, yCoord);
                }
            }
        }
        checkAllDirections(parseInt(idArray[0]), parseInt(idArray[1]));

        result.forEach(function (element) {
        	changeTheElement(element, "open")
        });
    }
    if (document.querySelectorAll(".game-button").length == mines) {
    	// When winning the game
    	document.querySelector(".game-status").innerHTML = "You just won the game!"
    	stopStopwatch()
    	document.querySelector(".mines-count").textContent = 0
    	document.querySelectorAll(".game-button").forEach(button => {
		    button.textContent = "f";
		});
		endTimeInMs = new Date().getTime();
		intervalInMs = endTimeInMs - startTimeInMs;

		updateStopwatchWithMs(intervalInMs % 1000) // Last three digits, that is, the milliseconds
		updateJSONHighScores(intervalInMs)
    	return 0;
    }
}

function eventListenerForButtons() {
	let buttons = document.querySelectorAll(".game-button");

	buttons.forEach(button => {
	  button.addEventListener("click", handleButtonClick);
	});

	buttons.forEach(button => {
	  	button.addEventListener('contextmenu', function(ev) {
	    	ev.preventDefault();
		    if (ev.target.innerHTML==="f") {
		    	currentFlags++;
		    	document.querySelector(".mines-count").textContent = currentFlags
				ev.target.classList.remove("flagged")
		    	ev.target.innerHTML = " ";
		    }
		    else {
		    	currentFlags--;
		    	document.querySelector(".mines-count").textContent = currentFlags
		    	ev.target.classList.add("flagged")
		    	ev.target.innerHTML = "f";
		    }

	    	return 0;
		}, false);
	});
}

function eventListenerForOpened() {
	let opened = document.querySelectorAll(".opened-div");

	opened.forEach(el => {
		el.removeEventListener("click", openSurroundingElements);
	  	el.addEventListener("click", openSurroundingElements)
	});

	opened.forEach(el => {
		el.removeEventListener("contextmenu", flagSurroundingElements);
	  	el.addEventListener("contextmenu", flagSurroundingElements)
	});
}


document.querySelector(".game-status").addEventListener("click", function() {
	resetStopwatch()
    makeTheMineLawn(rowsG, colsG);
});


function openSurroundingElements(ev) {
    let flags = [];
    const idArray = ev.target.id.split(":");
    const x = parseInt(idArray[0]);
    const y = parseInt(idArray[1]);

    const coordinates = [
        [0, -1], [-1, -1], [1, 1], [1, -1], [-1, 1], [-1, 0], [0, 1], [1, 0]
    ];

    for (const [dx, dy] of coordinates) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < rowsG && newY >= 0 && newY < colsG) {
        	
            const adjacentElement = game[newX][newY];
            let currentElement = document.getElementById(newX+"/"+newY)
            if (currentElement) {
            	if (currentElement.classList.contains("flagged")) {
            		flags.push([newX, newY]);
            	}
            }
        }
    }
    if (flags.length === game[x][y]) {

    	const coordinates = [
        	[0, -1], [-1, -1], [1, 1], [1, -1], [-1, 1], [-1, 0], [0, 1], [1, 0]
	    ];

	    for (const [dx, dy] of coordinates) {
	        const newX = x + dx;
	        const newY = y + dy;
	        let currentElement = document.getElementById(newX+"/"+newY)
	        if (!(flags.includes([newX,newY])) && currentElement && !(currentElement.classList.contains("flagged"))) {
	        	inGameButtonClick(currentElement)
	        }
	    };
		
    }
}

function flagSurroundingElements(event) {
	event.preventDefault()
	let flags = [];
    const idArray = event.target.id.split(":");
    const x = parseInt(idArray[0]);
    const y = parseInt(idArray[1]);

    const coordinates = [
        [0, -1], [-1, -1], [1, 1], [1, -1], [-1, 1], [-1, 0], [0, 1], [1, 0]
    ];

    for (const [dx, dy] of coordinates) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < rowsG && newY >= 0 && newY < colsG) {
            const adjacentElement = game[newX][newY];
            let currentElement = document.getElementById(newX+"/"+newY)
            if (currentElement) {
            	flags.push([newX, newY]);
            }
        }
    }

    if (flags.length === game[x][y]) {
    	for (const [dx, dy] of flags) {
	        currentElement = document.getElementById(dx+"/"+dy)
	        changeTheElement(currentElement, "flag")
	    };
    }
}


document.querySelector(".new-box-button").addEventListener("click", function() {
	closeNavMenus()
	boxRadios = document.getElementsByName("box_size")
	resetStopwatch()

	for (const element of boxRadios) {
		if (element.checked){
			if (element.value === "custom") {
				rowsG = document.getElementById("custom_rows").value
				colsG = document.getElementById("custom_cols").value
				mines = document.getElementById("custom_mines").value
				makeTheMineLawn(rowsG,colsG)
			}
			else if (element.value === "small") {
				rowsG = 9
				colsG = 9
				mines = 10
				hardness = "easy"
				makeTheMineLawn(rowsG,colsG)
			}
			else if (element.value === "middle") {
				rowsG = 16
				colsG = 16
				mines = 40
				hardness = "int"
				makeTheMineLawn(rowsG,colsG)
			}
			else if (element.value === "big") {
				rowsG = 16
				colsG = 30
				mines = 99
				hardness = "expert"
				makeTheMineLawn(rowsG,colsG)
			}
		}
	}
})


function updateStopwatch() {
    seconds++;
    const formattedSeconds = seconds < 1000 ? padWithZeros(seconds) : seconds;
    document.querySelector('.time-stopwatch').innerHTML = `${formattedSeconds} seconds`;
}

function updateStopwatchWithMs(ms) {
	const formattedSeconds = seconds < 1000 ? padWithZeros(seconds) : seconds;
	document.querySelector('.time-stopwatch').innerHTML = `${formattedSeconds} seconds ${ms} ms`;
}

function startStopwatch() {
    stopwatchInterval = setInterval(updateStopwatch, 1000);
    startTimeInMs = new Date().getTime();
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
}

function resetStopwatch() {
    seconds = 0;
    startTimeInMs = 0;
    endTimeInMs = 0;
    document.querySelector('.time-stopwatch').innerHTML = '000 seconds';
    stopStopwatch();
}

function padWithZeros(number) {
    return String(number).padStart(3, '0');
}

function padWithZerosMs(number) {
    return String(number).padStart(7, '0');
}


// Navigation

document.querySelector(".menu-controls").addEventListener("click", function() {
	document.querySelector(".box-menu").style.display = "flex";
	document.querySelector(".box-controls").style.display = "flex";
});


document.querySelector(".menu-size").addEventListener("click", function() {
	document.querySelector(".box-menu").style.display = "flex";
	document.querySelector(".box-size").style.display = "flex";
});


document.querySelector(".close-controls").addEventListener("click", function() {
	closeNavMenus()
});

document.querySelector(".box-menu").addEventListener("click", function(event) {
	if (event.target === document.querySelector(".box-menu")) {
		closeNavMenus()
    }
});

function closeNavMenus() {
	document.querySelector(".box-menu").style.display = "none";
	document.querySelector(".box-controls").style.display = "none";
	document.querySelector(".box-size").style.display = "none";
}