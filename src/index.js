import { initializeApp } from "firebase/app"
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore"


let rowsG = 9;
let colsG = 9;
let mines = 10;
let hardness = "easy";
let game = [];
let currentFlags = 10;
let seconds = 0;
let stopwatchInterval;
let startTimeInMs;
let endTimeInMs;
let onMobile;
let uiMode;
let modeContainer;
let openedDivs;
let gameStatus;
let i;
let j;
let k;
let l;
let randomRow;
let randomCols;
let currentElement;
let count;
let mainGameHTML;
let newRow;
let currentCol;
let currentRecords;
let idArray;
let coordinates;
let parentOfElement;
let flagSet;
let allClosedTiles;
let allFlaggedTiles;
let intervalInMs;
let boxRadios;

let namesOfNumbers = ["st", "nd", "rd"]

let settings = {
    "long-tap": 250,
}

const numberColorsHex = {
    1: "#001EC1",
    2: "#018100",
    3: "#CF0000",
    4: "#102E61",
    5: "#620000",
    6: "#239E9F",
    7: "#0E1111",
    8: "#434554",
    0: "#FFFFFF",
};

const darkNumberColorsHex = {
    1: "#3478DE",
    2: "#49C049",
    3: "#C93030",
    4: "#165EC9",
    5: "#B80606",
    6: "#1AA8A8",
    7: "#787C97",
    8: "#B1B8BB",
    0: "#FFFFFF",
};

let currentPallete = numberColorsHex

const lightModeColors = {
    "--text-color-main": "#0e1111",
    "--link-color": "#001EC1",
    "--background-color": "#FFFFFB",
    "--primary-color": "#CDCFD0",
    "--border-color": "#7B7B7B",
    "--secondary-color": "#CDCFD0",
    "--shadow-color": "rgba(0,0,0,0.3)",
    "--border-color-primary": "#EEEEEE",
    "--mine-color": "#E11F23",
};

const darkModeColors = {
    "--text-color-main": "#FFFFFB",
    "--link-color": "#58a6ff",
    "--background-color": "#0e1111",
    "--primary-color": "#33383A",
    "--border-color": "#222",
    "--secondary-color": "#FFFFFB",
    "--border-color-primary": "#555",
    "--shadow-color": "rgba(255,255,255,0.3)",
    "--mine-color": "#CD0B0F",
};


const firebaseConfig = {
    apiKey: "AIzaSyB0xNyZd1pnFEMmG9xueYXPo_4nFFA9SgU",
    authDomain: "minesweepertmu.firebaseapp.com",
    projectId: "minesweepertmu",
    storageBucket: "minesweepertmu.appspot.com",
    messagingSenderId: "859604107677",
    appId: "1:859604107677:web:cbc6f2fbe70fbf93182f74",
    measurementId: "G-BY1X2EYMFG"
};

initializeApp(firebaseConfig)

let db = getFirestore();


function applySettings() {
    let settingsTemp = JSON.parse(localStorage.getItem('settings'));
    if (!settingsTemp) {
        localStorage.setItem('settings', JSON.stringify(settings));
        return 0;
    }
    settings = settingsTemp
    document.querySelector(".long-tap-option").value = settings["long-tap"]
    onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (onMobile) {
        document.querySelector(".long-tap-option").removeAttribute("disabled");
    }
    document.querySelector('.long-tap-option-setting').textContent = `Current Value: ${settings["long-tap"]}`;
}

applySettings()

function onLoadUIMode() {
    uiMode = JSON.parse(localStorage.getItem('ui_mode'));
    modeContainer = document.querySelector(".mode-container")

    if (uiMode === "light") {
        modeContainer.classList.remove("dark")
        modeContainer.classList.add("light")
        modeContainer.style.backgroundImage = "url('multimedia/icons/moon.svg')"
        currentPallete = numberColorsHex
        applyColorPalette(lightModeColors);
        applyColorPaletteForNumbers(lightModeColors);

    } else if (uiMode === "dark") {
        modeContainer.classList.remove("light")
        modeContainer.classList.add("dark")
        modeContainer.style.backgroundImage = "url('multimedia/icons/sun.svg')"
        currentPallete = darkNumberColorsHex
        applyColorPalette(darkModeColors);
        applyColorPaletteForNumbers(darkModeColors);
    }
}

onLoadUIMode();

document.querySelector(".mode-container").addEventListener("click", (ev) => {
    if (ev.target.classList.contains("light")) {
        ev.target.classList.remove("light")
        ev.target.classList.add("dark")
        ev.target.style.backgroundImage = "url('multimedia/icons/sun.svg')"
        currentPallete = darkNumberColorsHex
        applyColorPalette(darkModeColors);
        applyColorPaletteForNumbers(darkModeColors);
        localStorage.setItem('ui_mode', JSON.stringify("dark"));
    } else {
        ev.target.classList.remove("dark")
        ev.target.classList.add("light")
        ev.target.style.backgroundImage = "url('multimedia/icons/moon.svg')"
        currentPallete = numberColorsHex
        applyColorPalette(lightModeColors);
        applyColorPaletteForNumbers(lightModeColors);
        localStorage.setItem('ui_mode', JSON.stringify("light"));
    }
})

function applyColorPaletteForNumbers(colorPalette) {
    openedDivs = document.querySelectorAll(".opened-div");

    openedDivs.forEach((el) => {
        let id = el.id.split(":")
        el.style.color = currentPallete[el.innerHTML]
    });
}

function applyColorPalette(colorPalette) {
    const root = document.documentElement.style;

    for (const [key, value] of Object.entries(colorPalette)) {
        root.setProperty(key, value);
    }
}

//SWITCH TO DARK MODE AUTO

function makeTheMineLawn(rows, cols, x = -1, y = -1, ev = 0, allFlags = [], lotMines = false) {
    seconds = 0
    currentFlags = mines
    game = []
    gameStatus = document.querySelector(".game-status")
    gameStatus.id = "start"
    document.querySelector(".main-game2").innerHTML = ''
    document.querySelector(".game-status").style.backgroundImage = "url('multimedia/images/default.png')"
    document.querySelector(".mines-container").textContent = padWithZeros(currentFlags)

    for (i = 0; i < rows; i++) {
        game.push([])
        for (j = 0; j < cols; j++) {
            game[i].push(0)
        }
    }

    for (i = 0; i < mines; i++) {
        function randomRowAndColGen() {
            randomRow = Math.floor(Math.random() * rows)
            randomCols = Math.floor(Math.random() * cols)
            if (game[randomRow][randomCols] !== -1) {
                if (x == -1 && y == -1) {
                    game[randomRow][randomCols] = -1
                } else if (lotMines && randomRow == x && randomCols == y) {
                    randomRowAndColGen()
                } else if ((randomRow >= x - 1 && randomRow <= parseInt(x) + 1) && (randomCols >= y - 1 && randomCols <= parseInt(y) + 1) && !(lotMines)) {
                    randomRowAndColGen()
                } else {
                    game[randomRow][randomCols] = -1
                }
            } else randomRowAndColGen()
        }
        randomRowAndColGen()
    }

    for (i = 0; i < rows; i++) {
        for (j = 0; j < cols; j++) {
            currentElement = game[i][j]
            if (currentElement !== -1) {
                count = 0
                for (k = -1; k < 2; k++) {
                    for (l = -1; l < 2; l++) {
                        if (!((k == 0 && l == 0) || (i + k < 0) || (j + l < 0) || (i + k > rows - 1) || (j + l > cols - 1))) {
                            if (game[i + k][j + l] == -1) {
                                count++
                            }
                        }
                    }
                    game[i][j] = count
                }
            }
        }
    }
    makeTheGameHTML2(allFlags)
    eventListenerForButtons()

    if (!(ev == 0)) {
        inGameButtonClick(ev.target)
    }
}
makeTheMineLawn(rowsG, colsG)

function firstJSON() {
    const storedData = JSON.parse(localStorage.getItem('highScoresSelf'));
    if (!(storedData)) {
        localStorage.setItem('highScoresSelf', JSON.stringify({ expert: [], int: [], easy: [], new: "yes" }));
    }
}
firstJSON()

function setJSONHighScores() {
    let storedData = JSON.parse(localStorage.getItem('highScoresSelf'));
    storedData.easy.sort((a, b) => a - b);

    if (storedData) {
        for (const [key, value] of Object.entries(storedData)) {

            currentRecords = document.querySelectorAll("." + key + "_high_self")
            for (i = 1; i <= value.length; i++) {
                let secondsHS = Math.floor(value[i - 1] / 1000)
                let millisecondsHS = padWithZeros(value[i - 1] % 1000)
                if (key === "expert") {
                    document.querySelector("#ehs-" + i).textContent = secondsHS + "." + millisecondsHS + " s"
                } else if (key === "int") {
                    document.querySelector("#eis-" + i).textContent = secondsHS + "." + millisecondsHS + " s"
                } else if (key === "easy") {
                    document.querySelector("#hes-" + i).textContent = secondsHS + "." + millisecondsHS + " s"
                }
            }
        }
    }
    localStorage.setItem('highScoresSelf', JSON.stringify(storedData));
}
setJSONHighScores()

function updateJSONHighScores(newScore) {

    let storedData = JSON.parse(localStorage.getItem('highScoresSelf'));
    storedData.easy.sort((a, b) => a - b);

    if (storedData[hardness].length >= 10) {
        if (newScore < storedData[hardness][9]) {
            document.querySelector(".new-hs-container").style.display = "flex"
            storedData[hardness].pop()
            storedData[hardness].push(newScore)
            storedData[hardness].sort(function(a, b) {
                return a - b;
            });
            let secondsHS = Math.floor(newScore / 1000)
            let millisecondsHS = newScore % 1000
            let place = parseInt(storedData[hardness].indexOf(newScore)) + 1
            const numberName = (place == 1 || place == 2 || place == 3) ? namesOfNumbers[place - 1] : 'th';
            document.querySelector(".new-hs").innerHTML = "Wow! " + seconds + "." + millisecondsHS + "s is your new high score in the " + place + numberName + " place."
            checkDBForHs(newScore);
        }
    } else {
        document.querySelector(".new-hs-container").style.display = "flex"
        storedData[hardness].push(newScore)
        storedData[hardness].sort(function(a, b) {
            return a - b;
        });
        let secondsHS = Math.floor(newScore / 1000)
        let millisecondsHS = newScore % 1000
        let place = parseInt(storedData[hardness].indexOf(newScore)) + 1
        const numberName = (place == 1 || place == 2 || place == 3) ? namesOfNumbers[place - 1] : 'th';
        document.querySelector(".new-hs").innerHTML = "Wow! " + seconds + "." + millisecondsHS + "s is your new high score in the " + place + numberName + " place."
        checkDBForHs(newScore);
    }
    localStorage.setItem('highScoresSelf', JSON.stringify(storedData));
    setJSONHighScores()
    return 0;
}


function setGlobalHighScores() {
    let colRef = collection(db, "high_scores")

    getDocs(colRef).then((snapshot) => {
        let highScores = []
        snapshot.docs.forEach((doc) => {
            for (const [key, value] of Object.entries(doc.data())) {
                for (i = 1; i <= value.length; i++) {
                    if (value[i - 1]) {
                        let [nameOfRecorder, hsOfRecorder] = value[i - 1].split(":");
                        hsOfRecorder = parseInt(hsOfRecorder)
                        let secondsHS = Math.floor(hsOfRecorder / 1000)
                        let millisecondsHS = padWithZeros(hsOfRecorder % 1000)
                        if (key === "expert") {
                            document.querySelector("#gesn-" + i).textContent = nameOfRecorder;
                            document.querySelector("#ges-" + i).textContent = secondsHS + "." + millisecondsHS + " s";
                        } else if (key === "int") {
                            document.querySelector("#gisn-" + i).textContent = nameOfRecorder;
                            document.querySelector("#gis-" + i).textContent = secondsHS + "." + millisecondsHS + " s";
                        } else if (key === "easy") {
                            document.querySelector("#hegn-" + i).textContent = nameOfRecorder;
                            document.querySelector("#heg-" + i).textContent = secondsHS + "." + millisecondsHS + " s";
                        }
                    }
                }
            }
        })
    }).catch(err => {
        console.log(err)
    })
}
setGlobalHighScores()


async function checkDBForHs(score) {
    let colRef = collection(db, "high_scores");

    getDocs(colRef).then((snapshot) => {
        let highScores = []
        snapshot.docs.forEach(async (doc) => {

            let tempData = doc.data()[hardness]

            for (let i = 0; i < tempData.length; i++) {
                tempData[i] = tempData[i].split(":")
                tempData[i][1] = parseInt(tempData[i][1])
            }
            if (tempData.length <= 9) {
                await updateHighScoreGlobal(tempData, score);
                return 0;
            } else if (score < tempData[tempData.length - 1][1]) {
                tempData.pop()
                await updateHighScoreGlobal(tempData, score);
                return 0;
            }
        })
    }).catch(err => {
        console.log(err)
    })
}

function promptAsync(message) {
    return new Promise((resolve) => {
        document.querySelector('.prompt-container').style.display = 'flex';

        const userNameInput = document.getElementById('userNameInput');
        const submitButton = document.getElementById('submitButton');

        submitButton.addEventListener('click', function() {
            if (userNameInput.value.length >= 4 && userNameInput.value.length <= 15) {
                document.querySelector(".error-message-prompt").textContent = ""
                document.querySelector('.prompt-container').style.display = 'none';
                resolve(userNameInput.value);
            } else {
                document.querySelector(".error-message-prompt").textContent = "Length should be more than 4 and less than 15."
            }

            document.querySelector(".close-prompt").addEventListener('click', function() {
                document.querySelector(".prompt-container").style.display = "none"
                resolve("Unknown");
                return 0;
            })
        });
    });
}

async function updateHighScoreGlobal(hardData, score) {
    let recorderName = await promptAsync("This was a new global hs. How the history will remember your name?");

    hardData.push([recorderName, score]);
    hardData.sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < hardData.length; i++) {
        hardData[i] = `${hardData[i][0]}:${hardData[i][1]}`;
    }

    const colRef = collection(db, "high_scores");
    const docRef = doc(db, 'high_scores', 'woZgqLDIFMQmZCqswpiQ');

    try {
        await updateDoc(docRef, {
            [hardness]: hardData
        });
        setGlobalHighScores();
    } catch (error) {
        console.error("Error updating document:", error);
    }
}

/* function makeTheGameHTML(){
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
	
} */

function makeTheGameHTML2(previousFlags = [], fixAfterSet = false) {
    mainGameHTML = document.querySelector(".main-game2")
    if (fixAfterSet) {
        mainGameHTML.innerHTML = ""
    }

    for (let i = 0; i < rowsG; i++) {

        newRow = document.createElement("div")
        newRow.className = "game-row"
        for (let j = 0; j < colsG; j++) {
            currentElement = document.createElement("div")
            currentElement.className = "single-element"

            currentCol = document.createElement("div")
            currentCol.id = i.toString() + "/" + j.toString()
            currentElement.id = i.toString() + ":" + j.toString()
            currentCol.className = "game-button"

            currentElement.appendChild(currentCol)
            newRow.appendChild(currentElement)

            previousFlags.forEach(element => {
                if (element.id === currentCol.id) {
                    currentFlags--;
                    document.querySelector(".mines-container").textContent = padWithZeros(currentFlags)
                    changeTheElement(currentCol, "flag")
                }
            });

        }
        mainGameHTML.appendChild(newRow)
    }
    let length = parseInt(getComputedStyle(document.querySelector(".game-row")).width, 10)
    if ((colsG * 25 >= length && colsG * 25 + 26.4 > document.body.clientWidth) || (fixAfterSet)) {
        document.querySelector("body").style.overflowX = "scroll";
        document.querySelector("body").style.overflowX = "flex";
        document.querySelector(".playground").style.display = "block"
        document.querySelector(".game-container").style.display = "block"
        document.querySelector("body").style.width = (colsG * 25 + 50) + "px"
        document.querySelector(".playground").style.width = (colsG * 25 + 50) + "px"
        document.querySelector(".game-container").style.width = (colsG * 25 + 50) + "px"
        document.querySelector(".game-info-container").style.width = (colsG * 25 + 50) + "px"
        document.querySelector(".main-game-container").style.width = (colsG * 25 + 50) + "px"
        document.querySelector(".box-menu").style.width = (colsG * 25 + 50) + "px"
        document.querySelector(".box-controls").style.width = "400px"
        document.querySelector(".box-size").style.width = "400px"
        let bodyWidth = document.body.scrollWidth;
        let halfViewportWidth = window.innerWidth / 2;
        let centerStartX = bodyWidth / 2 - halfViewportWidth;

        onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        if (onMobile) {
            centerStartX = Math.max(0, (window.innerWidth - document.documentElement.clientWidth) / 2);
            document.querySelector(".playground").scrollIntoView({ block: "center" });
            window.scrollTo(centerStartX, 0);
            return 0
        }
        window.scrollTo(centerStartX, 0);
    } else {
        document.querySelector("body").style.overflowX = "hidden";
        document.querySelector("body").style.overflowX = "block";
        document.querySelector(".playground").style.display = "flex"
        document.querySelector(".game-container").style.display = "flex"
        document.querySelector(".game-info-container").style.width = "100%"
        document.querySelector(".main-game-container").style.width = "100%"
        document.querySelector(".box-menu").style.width = "100%"
        if (window.innerWidth < 600) {
            document.querySelector(".box-controls").style.width = "90%"
            document.querySelector(".box-size").style.width = "90%"
        } else {
            document.querySelector(".box-controls").style.width = ""
            document.querySelector(".box-size").style.width = ""
        }
        document.querySelector("body").style.width = ""
        document.querySelector(".playground").style.width = ""
        document.querySelector(".game-container").style.width = ""
    }
    length = parseInt(getComputedStyle(document.querySelector(".game-row")).width, 10)
    if (colsG * 25 >= length && colsG * 25 + 26.4 > document.body.clientWidth) {
        makeTheGameHTML2(previousFlags, true)
    }

}


function handleButtonClick(event) {
    gameStatus = document.querySelector(".game-status")
    if (gameStatus.id === "lose") return 0;
    if (event.target.classList.contains("flagged") || event.target.classList.contains("closed")) {
        return 0;
    } else if ((gameStatus.id === "start") || (gameStatus.id === "lose")) {
        onFirstClick(event);
    } else {
        inGameButtonClick(event.target);
    }
}


function onFirstClick(event) {
    document.querySelector(".new-hs-container").style.display = "none"

    idArray = event.target.id.split("/")

    if (event.target.classList.contains("flagged")) {
        return 0
    } else if (rowsG * colsG <= parseInt(mines) + 8) {
        if (game[idArray[0]][idArray[1]] !== -1) {
            startStopwatch()
            inGameButtonClick(event.target)
        } else {
            makeTheMineLawn(rowsG, colsG, idArray[0], idArray[1], event, document.querySelectorAll(".flagged"), true)
            let seconds = 0;
            let stopwatchInterval;

            startStopwatch()
        }
    } else if (game[idArray[0]][idArray[1]] !== 0) {
        makeTheMineLawn(rowsG, colsG, idArray[0], idArray[1], event, document.querySelectorAll(".flagged"), false)
        let seconds = 0;
        let stopwatchInterval;

        startStopwatch()
    } else {
        startStopwatch()
        inGameButtonClick(event.target)
    }

}

function changeTheElement(element, action, lost = false) {
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

        if (revealedText == "-1") {
				    if (lost == true) {
				    	parentOfElement.style.backgroundColor = "var(--mine-color)"
				    }
            parentOfElement.style.backgroundImage = `url("multimedia/icons/mine_2.svg")`;
            return 0
        }
        parentOfElement.style.color = currentPallete[parseInt(revealedText)]
        parentOfElement.textContent = revealedText
        eventListenerForOpened()
        if (document.querySelectorAll(".game-button").length == mines && !(document.querySelector(".game-status").id == "lose")) {
            document.querySelector(".game-status").style.backgroundImage = `url("multimedia/images/win.png")`;
        }
        return 0

    } else if (action === "openFlag") {
        parentOfElement = element.parentElement
        idArray = element.id.split("/")
        element.remove()
        parentOfElement.classList.add("opened-div")
        let revealedText = game[idArray[0]][idArray[1]] === 0 ? " " : game[idArray[0]][idArray[1]];
        if (revealedText == "-1") {
            parentOfElement.style.backgroundImage = `url("multimedia/icons/mine_2.svg")`;
            return 0
        }

        parentOfElement.textContent = revealedText
    } else if (action === "flag") {
        if (!(element.classList.contains("flagged") || element.parentNode.classList.contains("flagged"))) {
            currentFlags--;
            document.querySelector(".mines-container").textContent = padWithZeros(currentFlags)
            flagSet = document.createElement("img")
            flagSet.src = "multimedia/icons/ms_flag.svg"
            flagSet.style.width = "100%"
            element.appendChild(flagSet)
            element.classList.add("flagged")
        }
    } else if (action === "wrongFlag") {
        element.innerHTML = ""
        element.style.backgroundImage = `url("multimedia/icons/mine_fail.svg")`
    } else if (action === "close") {
        element.classList.add("closed")
    }

}

function openTilesAfterLose() {
    allClosedTiles = document.querySelectorAll(".game-button");
    allFlaggedTiles = document.querySelectorAll(".flagged");

    allFlaggedTiles.forEach((el) => {
        idArray = el.id.split("/");
        if (game[idArray[0]][idArray[1]] !== -1) {
            parentOfElement = el.parentNode
            changeTheElement(el, "openFlag", areAdjacentElementsEqual())
            changeTheElement(parentOfElement, "wrongFlag")
        }
    });

    allClosedTiles.forEach((el) => {
        idArray = el.id.split("/");
        if (game[idArray[0]][idArray[1]] == -1 && !(el.classList.contains("flagged"))) {
            changeTheElement(el, "openFlag")
        } else {
            changeTheElement(el, "close")
        }
    });
}

function inGameButtonClick(eventTarget) {
    document.querySelector(".game-status").id = "mid-game"
    idArray = eventTarget.id.split("/");

    if (game[idArray[0]][idArray[1]] == -1) {
        changeTheElement(eventTarget.id, "open", true)
        
        eventTarget.classList.add("lost-tile");
        stopStopwatch()
        gameStatus = document.querySelector(".game-status")
        gameStatus.id = "lose"
        gameStatus.style.backgroundImage = `url("multimedia/images/lose.png")`;
        openTilesAfterLose()
        return 0;
        //makeTheMineLawn(rowsG, colsG, idArray[0], idArray[1]);
    } else {
        let result = new Set();

        function checkAllDirections(x, y) {
            if (x < 0 || y < 0 || x >= rowsG || y >= colsG || result.has(`${x}/${y}`)) {
                return 0;
            }

            currentElement = game[x][y];
            coordinates = [
                [0, -1],
                [-1, -1],
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, 0],
                [0, 1],
                [1, 0]
            ];
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

        result.forEach(function(element) {
            changeTheElement(element, "open")
        });
    }
    if (document.querySelectorAll(".game-button").length == mines && !(document.querySelector(".game-status").id == "lose")) {
        // When winning the game
        stopStopwatch()
        document.querySelector(".mines-container").textContent = "000"
        document.querySelectorAll(".game-button").forEach(button => {
            changeTheElement(button, "flag")
        });
        endTimeInMs = new Date().getTime();
        intervalInMs = endTimeInMs - startTimeInMs;

        updateStopwatchWithMs(intervalInMs % 1000); // Last three digits, that is, the milliseconds
        updateJSONHighScores(intervalInMs);
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
            if (document.querySelector(".game-status").id == "lose") {
                return 0;
            }

            if (ev.target.classList.contains("flagged") || ev.target.parentNode.classList.contains("flagged")) {
                currentFlags++;
                document.querySelector(".mines-container").textContent = padWithZeros(currentFlags)
                if (ev.target.tagName === "IMG") {
                    ev.target.parentNode.classList.remove("flagged")
                    ev.target.remove()
                    return 0;
                }
                ev.target.classList.remove("flagged");
                ev.target.innerHTML = ""

                //ev.target.innerHTML = " ";
            } else {
                currentFlags--;
                document.querySelector(".mines-container").textContent = padWithZeros(currentFlags)
                flagSet = document.createElement("img")
                flagSet.src = "multimedia/icons/ms_flag.svg"
                flagSet.style.width = "100%"
                ev.target.appendChild(flagSet)
                ev.target.classList.add("flagged")
                //ev.target.innerHTML = "f";
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
    onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    opened.forEach(el => {
        if (onMobile) {
            el.addEventListener('touchstart', startTimer, { passive: true });
            el.addEventListener('touchmove', clearTimer, { passive: true });
            el.addEventListener('touchend', clearTimer);
            return 0;
        }
        el.removeEventListener("contextmenu", flagSurroundingElements);
        el.addEventListener("contextmenu", flagSurroundingElements)
    });
}


document.querySelector(".game-status").addEventListener("click", function() {
    resetStopwatch()
    makeTheMineLawn(rowsG, colsG);
});


function openSurroundingElements(ev) {
    if (document.querySelector(".game-status").id === "lose") return 0;

    let flags = [];
    const idArray = ev.target.id.split(":");
    const x = parseInt(idArray[0]);
    const y = parseInt(idArray[1]);

    const coordinates = [
        [0, -1],
        [-1, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, 0],
        [0, 1],
        [1, 0]
    ];

    for (const [dx, dy] of coordinates) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < rowsG && newY >= 0 && newY < colsG) {

            const adjacentElement = game[newX][newY];
            let currentElement = document.getElementById(newX + "/" + newY)
            if (currentElement) {
                if (currentElement.classList.contains("flagged")) {
                    flags.push([newX, newY]);
                }
            }
        }
    }
    if (flags.length === game[x][y]) {

        const coordinates = [
            [0, -1],
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, 0],
            [0, 1],
            [1, 0]
        ];

        for (const [dx, dy] of coordinates) {
            const newX = x + dx;
            const newY = y + dy;
            let currentElement = document.getElementById(newX + "/" + newY)
            if (!(flags.includes([newX, newY])) && currentElement && !(currentElement.classList.contains("flagged"))) {
                inGameButtonClick(currentElement)
            }
        };
    }
}


let touchTimer;

function startTimer(event) {
    touchTimer = setTimeout(function() {
        flagSurroundingElements(event, false)
    }, settings["long-tap"]); // Adjust the duration as needed (e.g., 1000 milliseconds for a 1-second long tap)
}

function clearTimer() {
    clearTimeout(touchTimer);
}

// Add touch event listeners


function flagSurroundingElements(event, onDesktop = true) {
    if (onDesktop) {
        event.preventDefault()
    }

    if (document.querySelector(".game-status").id === "lose") return 0;

    let flags = [];
    const idArray = event.target.id.split(":");
    const x = parseInt(idArray[0]);
    const y = parseInt(idArray[1]);

    const coordinates = [
        [0, -1],
        [-1, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, 0],
        [0, 1],
        [1, 0]
    ];

    for (const [dx, dy] of coordinates) {
        const newX = x + dx;
        const newY = y + dy;

        if (newX >= 0 && newX < rowsG && newY >= 0 && newY < colsG) {
            const adjacentElement = game[newX][newY];
            let currentElement = document.getElementById(newX + "/" + newY)
            if (currentElement) {
                flags.push([newX, newY]);
            }
        }
    }

    if (flags.length === game[x][y]) {
        for (const [dx, dy] of flags) {
            currentElement = document.getElementById(dx + "/" + dy)
            changeTheElement(currentElement, "flag")
        };
    }
}


document.querySelector(".new-box-button").addEventListener("click", function() {
    closeNavMenus()
    boxRadios = document.getElementsByName("box_size")
    resetStopwatch()

    for (const element of boxRadios) {
        if (element.checked) {
            if (element.value === "custom") {
                hardness = "custom"
                rowsG = document.getElementById("custom_rows").value
                colsG = document.getElementById("custom_cols").value
                mines = document.getElementById("custom_mines").value

                if (rowsG < 5) {
                    rowsG = 5
                    document.getElementById("custom_rows").value = "5"
                }
                if (colsG < 8) {
                    colsG = 8
                    document.getElementById("custom_cols").value = "8"
                }
                if (rowsG > 99) {
                    rowsG = 99
                    document.getElementById("custom_rows").value = "99"
                }
                if (colsG > 99) {
                    colsG = 99
                    document.getElementById("custom_cols").value = "99"
                }

                if (colsG * rowsG / 20 > mines && rowsG > 49) {
                    alert("This might take some time :)")
                }
                if (colsG * rowsG == mines) {
                    mines--;
                }
                makeTheMineLawn(rowsG, colsG)
            } else if (element.value === "small") {
                rowsG = 9
                colsG = 9
                mines = 10
                hardness = "easy"
                makeTheMineLawn(rowsG, colsG)
            } else if (element.value === "middle") {
                rowsG = 16
                colsG = 16
                mines = 40
                hardness = "int"
                makeTheMineLawn(rowsG, colsG)
            } else if (element.value === "big") {
                rowsG = 16
                colsG = 30
                mines = 99
                hardness = "expert"
                makeTheMineLawn(rowsG, colsG)
            }
        }
    }
})


function updateStopwatch() {
    if (!endTimeInMs) {
        seconds++;
        const formattedSeconds = seconds < 1000 ? padWithZeros(seconds) : seconds;
        document.querySelector('.time-stopwatch').innerHTML = `${formattedSeconds}`;
        return 0
    }
    stopStopwatch()
}

function updateStopwatchWithMs(ms) {
    const formattedSeconds = seconds < 1000 ? padWithZeros(seconds) : seconds;
    document.querySelector('.time-stopwatch').innerHTML = `${formattedSeconds}`;
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
    document.querySelector('.time-stopwatch').innerHTML = '000';
    stopStopwatch();
}

function padWithZeros(number) {
    const isNegative = number < 0;
    const absoluteNumber = Math.abs(number);
    const paddedNumber = String(absoluteNumber).padStart(3, '0');

    return isNegative ? `-${paddedNumber}` : paddedNumber;
}

function padWithZerosMs(number) {
    return String(number).padStart(7, '0');
}

document.querySelector(".main-game2").addEventListener("mousedown", () => {
    document.querySelector(".game-status").style.backgroundImage = `url("multimedia/images/onclick.png")`;
})

document.querySelector(".main-game2").addEventListener("mouseup", () => {
    document.querySelector(".game-status").style.backgroundImage = `url("multimedia/images/default.png")`;
})


// Navigation

document.querySelector(".menu-controls").addEventListener("click", function() {
    closeNavMenus()
    document.querySelector(".box-menu").style.display = "flex";
    document.querySelector(".box-controls").style.display = "flex";
});


document.querySelector(".menu-size").addEventListener("click", function() {
    closeNavMenus()
    document.querySelector(".box-menu").style.display = "flex";
    document.querySelector(".box-size").style.display = "flex";
});

document.querySelector(".menu-options").addEventListener("click", function() {
    closeNavMenus()
    document.querySelector(".box-menu").style.display = "flex";
    document.querySelector(".box-options").style.display = "flex";
});


document.querySelectorAll(".close-controls").forEach(function(element) {
    element.addEventListener("click", function() {
        closeNavMenus()
    });
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
    document.querySelector(".box-options").style.display = "none";
}

document.querySelector('.long-tap-option').addEventListener('input', function() {
    const currentValue = this.value;
    settings["long-tap"] = currentValue;
    localStorage.setItem("settings", JSON.stringify(settings))
    document.querySelector('.long-tap-option-setting').textContent = `Current Value: ${currentValue}`;
});

document.querySelectorAll('.hs-a').forEach((elem) => {
    elem.addEventListener("click", function(ev) {
        if (ev.target.classList.contains("disabled-a")) {
            return 0;
        } else {
            if (ev.target.classList.contains("hs-local")) {
                document.querySelector(".global-hs-container").style.display = "none";
                document.querySelector(".local-hs-container").style.display = "block";
                ev.target.classList.add("disabled-a");
                document.querySelector(".hs-global").classList.remove("disabled-a");
                return 0;
            } else if (ev.target.classList.contains("hs-global")) {
                document.querySelector(".local-hs-container").style.display = "none";
                document.querySelector(".global-hs-container").style.display = "block";
                ev.target.classList.add("disabled-a");
                document.querySelector(".hs-local").classList.remove("disabled-a");
                return 0;
            } else {
                return 0;
            }
        }
    })
});