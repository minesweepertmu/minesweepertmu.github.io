import { initializeApp } from "firebase/app"
import {
    getFirestore,
    collection,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore"

import {
    numberColorsHex,
    darkNumberColorsHex,
    lightModeColors,
    darkModeColors,
    firebaseConfig
} from "./constants.js";

import html2canvas from 'html2canvas';
html2canvas.logging = 'error';

let rowsG = 9,
    colsG = 9,
    mines = 10,
    hardness = "easy",
    game = [],
    currentFlags = 10,
    seconds = 0,
    stopwatchInterval, startTimeInMs, endTimeInMs, onMobile, uiMode, modeContainer, openedDivs, gameStatus, i, j, k, l, randomRow, randomCols, currentElement, count, mainGameHTML, newRow, currentCol, currentRecords, idArray, coordinates, parentOfElement, flagSet, allClosedTiles, allFlaggedTiles, intervalInMs, boxRadios, firstTapIsSafe, importedGame;

let namesOfNumbers = ["st", "nd", "rd"]

let settings = {
    "long-tap": 250,
    "firstTapIsSafe": true,
}

let currentPallete = numberColorsHex;

initializeApp(firebaseConfig)

let db = getFirestore();


function applySettings() {
    let settingsTemp = JSON.parse(localStorage.getItem('settings'));
    if (!settingsTemp || !settingsTemp["firstTapIsSafe"]) {
        localStorage.setItem('settings', JSON.stringify(settings));
        firstTapIsSafe = true;
        return 0;
    }
    settings = settingsTemp
    document.querySelector(".long-tap-option").value = settings["long-tap"]
    onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (onMobile) {
        document.querySelector(".long-tap-option").removeAttribute("disabled");
    }
    document.querySelector('.long-tap-option-setting').textContent = `Current Value: ${settings["long-tap"]}`;

    firstTapIsSafe = settings["firstTapIsSafe"];
    document.querySelector('.first-tap-safe-check').checked = firstTapIsSafe;
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
    importedGame = false;
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

    if (importedGame) {
        return 0;
    }

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
    if (event.target.classList.contains("flagged") || event.target.parentNode.classList.contains("flagged") || event.target.parentNode.parentNode.classList.contains("flagged") || event.target.classList.contains("closed")) {
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
        return 0;
    } else if (!firstTapIsSafe) {
        startStopwatch()
        inGameButtonClick(event.target)
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
            //element.style.backgroundImage = 'url("multimedia/icons/ms_flag.svg")'
            /*flagSet = document.createElement("img")
            flagSet.src = "multimedia/icons/ms_flag.svg"
            flagSet.style.width = "100%"*/
            element.appendChild(createSvgFlag())
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
            changeTheElement(el, "openFlag")
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
    //if(event.pointerId === "4") return 0;
    if(eventTarget.tagName === "svg") {
        idArray = eventTarget.parentNode.id.split("/");
    }
    else if (eventTarget.parentNode.tagName === "svg") {
        idArray = eventTarget.parentNode.parentNode.id.split("/");
    }
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
    onMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)


    buttons.forEach(el => {
        if (onMobile) {
            el.addEventListener('touchstart', startTimerThis, { passive: true });
            el.addEventListener('touchmove', clearTimerThis, { passive: true });
            el.addEventListener('touchend', clearTimerThis);
            return 0;
        }
        /*el.removeEventListener("contextmenu", flagSurroundingElements);
        el.addEventListener("contextmenu", flagSurroundingElements)*/
    });

    if (!onMobile) {
        buttons.forEach(button => {
            button.addEventListener('contextmenu', (ev) => { flagThisTile(ev) }, false);
        });
    }
}

function startTimerThis(event) {
    let eventTarget = event.target.tagName === 'DIV' ? event.target : (event.target.parentNode.tagName === 'DIV' ? event.target.parentNode : event.target.parentNode.parentNode)
    eventTarget.removeEventListener("click", handleButtonClick)

    touchTimer = setTimeout(function() {
        flagThisTile(event)
        console.log(eventTarget)
        console.log(1)
        eventTarget.removeEventListener("click", handleButtonClick)
        setTimeout(function() {eventTarget.addEventListener("click", handleButtonClick)},300)
    }, settings["long-tap"]);
}

function clearTimerThis(event) {
    clearTimeout(touchTimer);
    let eventTarget = event.target;
    while (eventTarget && eventTarget.tagName !== 'DIV') {
        eventTarget = eventTarget.parentNode;
    }

    eventTarget.addEventListener("click", handleButtonClick)
}

function flagThisTile(ev) {
    if (ev.cancelable) {
        ev.preventDefault();
    }
    if (document.querySelector(".game-status").id == "lose") {
        return 0;
    }
    if (ev.target.classList.contains("flagged") || ev.target.tagName === "svg" || ev.target.parentNode.tagName === "svg") {
        currentFlags++;
        document.querySelector(".mines-container").textContent = padWithZeros(currentFlags)
        if (ev.target.tagName === "svg") {
            ev.target.parentNode.classList.remove("flagged")
            ev.target.remove()
            return 0;
        }
        else if (ev.target.parentNode.tagName === "svg") {
            ev.target.parentNode.parentNode.classList.remove("flagged")
            ev.target.parentNode.remove()
            return 0;
        }
        ev.target.classList.remove("flagged");
        ev.target.innerHTML = ""
        return 0;
        //ev.target.innerHTML = " ";
    } else {
        currentFlags--;
        document.querySelector(".mines-container").textContent = padWithZeros(currentFlags)
        //ev.target.style.backgroundImage = 'url("multimedia/icons/ms_flag.svg")'
        /*flagSet = document.createElement("img")
        flagSet.src = "multimedia/icons/ms_flag.svg"
        flagSet.style.width = "100%"*/
        ev.target.appendChild(createSvgFlag())
        ev.target.classList.add("flagged")
        //ev.target.innerHTML = "f";
    }

    return 0;
}

function createSvgFlag() {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", "0 0 76 76"); // Adjust viewBox as needed

    // Append the SVG content
    svg.innerHTML = `
        <style type="text/css">
            .st0{fill:#E11F23;}
        </style>
        <polygon points="38.2,62 38.2,6.3 43.9,6.3 43.9,62 "/>
        <polygon class="st0" points="43.9,2.6 14.5,21.3 43.9,40 "/>
        <rect x="27.6" y="56.4" width="26.9" height="7.8"/>
        <rect x="15.7" y="63.4" width="50.8" height="10"/>
    `;
    return svg;
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
            el.addEventListener('touchstart', startTimerSurr, { passive: true });
            el.addEventListener('touchmove', clearTimerSurr, { passive: true });
            el.addEventListener('touchend', clearTimerSurr);
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

function startTimerSurr(event) {
    touchTimer = setTimeout(function() {
        flagSurroundingElements(event, false)
    }, settings["long-tap"]); // Adjust the duration as needed (e.g., 1000 milliseconds for a 1-second long tap)
}

function clearTimerSurr() {
    clearTimeout(touchTimer);
}

// Add touch event listeners


function flagSurroundingElements(event, onDesktop = true) {
    if (onDesktop) {
        event.preventDefault();
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

async function takeScreenshotOfDiv() {
    let divElement = document.querySelector(".playground");

    try {
        let canvas = await html2canvas(document.querySelector(".game-container"), {
            logging: false
        });
        return canvas;

    } catch (error) {
        console.error('Error capturing screenshot:', error);
    }
}


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

function matrixToString(matrix) {
    const colsStr = colsG.toString().padStart(2, '0'); // Convert to string and pad with leading zeros if needed
    const matrixString = matrix.flat().map(element => (element === -1 ? '9' : element.toString())).join('');
    return colsStr + matrixString;
}

function encodeMatrix(matrix) {
    const matrixString = matrixToString(matrix);
    return btoa(matrixString); // Base64 encoding
}

function decodeMatrix(encodedString) {
    const decodedString = atob(encodedString); // Base64 decoding
    const cols = parseInt(decodedString.substring(0, 2)); // Extract number of columns
    const matrixString = decodedString.substring(2); // Extract matrix string
    // Convert string back to matrix
    const matrix = matrixString.match(new RegExp(`.{1,${cols}}`, 'g')).map(row => row.split('').map(element => (element === '9' ? -1 : parseInt(element))));
    return matrix;
}


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

document.querySelector(".menu-import").addEventListener("click", function() {
    closeNavMenus()
    document.querySelector(".box-menu").style.display = "flex";
    document.querySelector(".box-import").style.display = "flex";

    document.querySelector(".import-textarea").value = encodeMatrix(game);
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
    document.querySelector(".box-import").style.display = "none";
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


document.querySelector(".import-button-click").addEventListener('click', () => {

    let imported = document.querySelector(".input-import").value;
    try {
        let decodedImport = decodeMatrix(imported);
    } catch (error) {
        document.querySelector(".error-message-prompt").textContent = "Import impossible. Original messege was altered"
        return 0;
    }
    let decodedImport = decodeMatrix(imported);
    document.querySelector(".error-message-prompt").textContent = ""
    if (decodedImport[0].length === decodedImport.at(-1).length) {
        let importMines = 0;
        decodedImport.forEach((rows) => {
            rows.forEach((e) => {
                if (e <= -2 || e >= 9) {
                    throw new Error("Import string has been altered")
                }
                if (e === -1) {
                    importMines += 1;
                }
            })
        })
        rowsG = decodedImport.length;
        colsG = decodedImport[0].length;
        mines = importMines;
        makeTheMineLawn(rowsG, colsG, -1, -1, 0, [], false);
        stopStopwatch();
        resetStopwatch();
        importedGame = true;
        game = decodedImport;
        document.querySelector(".first-tap-safe-check").checked = false;
        settings['firstTapIsSafe'] = false;
        firstTapIsSafe = false;
        localStorage.setItem('settings', JSON.stringify(settings));
        closeNavMenus();
    } else {
        throw new Error("Import string has been altered")
    }
});

document.querySelector(".first-tap-safe-check").addEventListener('click', () => {
    let checkbox = document.querySelector(".first-tap-safe-check");

    if (checkbox.checked) {
        settings['firstTapIsSafe'] = true;
        firstTapIsSafe = true;
        localStorage.setItem('settings', JSON.stringify(settings));
    } else {
        settings['firstTapIsSafe'] = false;
        firstTapIsSafe = false;
        localStorage.setItem('settings', JSON.stringify(settings));
    }
})

document.querySelector(".import-button-copy").addEventListener('click', (e) => {
    navigator.clipboard.writeText(document.querySelector(".import-textarea").value);
})

document.querySelector('.screenshot-link').addEventListener('click', async function(event) {
    try {
        let canvas = await takeScreenshotOfDiv();

        if (canvas) {
            let dataURL = canvas.toDataURL('image/png');

            // Create a temporary anchor element
            let downloadLink = document.createElement('a');
            downloadLink.href = dataURL;
            downloadLink.download = 'canvas_image.png';

            // Simulate a click on the anchor element to trigger download
            downloadLink.click();
        } else {
            console.error('Canvas not available');
        }
    } catch (error) {
        console.error('Error capturing screenshot:', error);
    }
});