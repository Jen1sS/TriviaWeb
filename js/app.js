//DOMANDE
let quest;
let end;
let points = 0;
let timer;
let asked = false;

let started = false;


//STATO DELL'AUTOMA
let curState = "WAITING";

//PLAYER
let totalLives;
let lives = 4;
let position = 0;
let completed = {0xd900ff: false, 0x1e00ff: false, 0x00f2ff: false, 0x00ff3c: false, 0xfbff00: false}
let oldPos = 0; //ultima posizione

//ROLL
let positions = 0; //roll uscito
let time = randBetween(5, 1);
let cumt;
let rolled = false;
let active = false
let id;

//RADDRIZZAMENTO DADO
let done = false;
let first = false;
let or;
const rotations = { // faccie dado
    1: [0, Math.PI*0.5, Math.PI * 1.5],
    2: [Math.PI*0.5, Math.PI*0.5, Math.PI * 0.5], //no
    3: [0, 0, 0],
    4: [Math.PI*0.5, Math.PI*0.5, Math.PI * 0.5],
    5: [Math.PI*0.5, 0, Math.PI * 1.5],
    6: [0, 0, Math.PI * 0.5],
}

//DICE
let dice;

//LERPING
let timeA = 1;

// CASELLE (colori)
let c;
let color = null; //colore della casella indovinata

//DELTA TIME
let dt;

class Question {

    constructor(q) {
        this.title = q.question;
        this.difficulty = q.difficulty;
        this.category = q.category;
        this.answers = [q.correct_answer];
        this.rightAnswers = q.correct_answer;

        for (let i = 0; i < q.incorrect_answers.length; i++) this.answers.push(q.incorrect_answers[i]);

        this.answers = shuffle(this.answers);
    }

    getName() {
        return this.title;
    }

    getDifficulty() {
        return this.difficulty;
    }

    getCategory() {
        return this.category;
    }

    getAnswers() {
        return this.answers;
    }

    getRightAnswer() {
        return this.rightAnswers;
    }
}


//Da la domanda per il colore e chiede anche il numero di domande da recuperare nella fetch
async function getQuestions(color, number) {
    let res;
    switch (color) {
        case 0xd900ff: //VIOLA: Entertainment (Books, Films, Music, Musical & Theaters, Television, Board Games, Video Games
            res = randBetween(16, 10) + "";
            break;
        case 0x1e00ff: //BLU: General Knowledge
            res = "9";
            break;
        case 0x00f2ff: //AZZURRO: Mithology
            res = "20";
            break;
        case 0x00ff3c: // VERDE: Science & Nature, Computers, Math
            res = randBetween(19, 17);
            break;
        case 0xfbff00: // GIALLO: History, Politics, Art
            res = randBetween(25, 23);
            break;
    }

    const response = await fetch("https://opentdb.com/api.php?amount=" + number + "&category=" + res);
    const q = await response.json();
    quest = []
    for (let i = 0; i < q.results.length; i++) quest.push(new Question(q.results[i]));
}

//Prende la prossima domanda e in caso non ci sia fa un fetch
function next() {
    if (!started) {
        getQuestions(c[position], 1).then(r => loadQuestion());
        return;
    }
    if (quest.length > 0) loadQuestion();
    else getQuestions(c[position], 1).then(r => loadQuestion());
}


//CHIEDI DOMANDA
function ask() {
    if (!asked) {
        rolled = false;
        active = false;
        done = false;
        setTimeout(next, 1000)
        asked = true;
    }
}

//Carica la domanda sulla pagina
function loadQuestion() {
    started = true;
    const body = document.getElementById("container");
    end = false;
    timer = 10;

    console.log(quest[quest.length-1].getRightAnswer()); //CHEAT MATTI D:

    if (quest[quest.length - 1].getAnswers().length === 2) {
        body.innerHTML = "<div id='question'><h2>" + quest[quest.length - 1].getName() + "</h2>" +
            "<hr>" +
            "<div id='answers'>" +
            "<button onclick='verify(quest[quest.length-1].getAnswers()[0])'>" + quest[quest.length - 1].getAnswers()[0] + "</button>" +
            "<button onclick='verify(quest[quest.length-1].getAnswers()[1])'>" + quest[quest.length - 1].getAnswers()[1] + "</button>" +
            "</div>" +
            "<hr id='timeBar'>" +
            "<div id='stats'>" +
            "<p>Difficoltà: " + quest[quest.length - 1].getDifficulty() + "</p><p>Category: " + quest[quest.length - 1].getCategory() + "</p>" +
            "</div>" +
            "</div>";
    } else {
        body.innerHTML = "<div id='question'><h2>" + quest[quest.length - 1].getName() + "</h2>" +
            "<hr>" +
            "<div id='answers'>" +
            "<button onclick='verify(quest[quest.length-1].getAnswers()[0])'>" + quest[quest.length - 1].getAnswers()[0] + "</button>" +
            "<button onclick='verify(quest[quest.length-1].getAnswers()[1])'>" + quest[quest.length - 1].getAnswers()[1] + "</button>" +
            "<button onclick='verify(quest[quest.length-1].getAnswers()[2])'>" + quest[quest.length - 1].getAnswers()[2] + "</button>" +
            "<button onclick='verify(quest[quest.length-1].getAnswers()[3])'>" + quest[quest.length - 1].getAnswers()[3] + "</button>" +
            "</div>" +
            "<hr id='timeBar'>" +
            "<div id='stats'>" +
            "<p>Difficulty: " + quest[quest.length - 1].getDifficulty() + "</p><p>Category: " + quest[quest.length - 1].getCategory() + "</p>" +
            "</div>" +
            "</div>";
    }
    setTimeout(decrementTimer, 1000);
}

//Verifica la domanda
function verify(num) {
    if (!end) {
        if (quest[quest.length - 1].getRightAnswer() === num) {
            document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,255,0,1) 100%)"
            document.getElementById("points").style.color = "green";

            completed[c[position]] = true;

            //update stats bar
            const tas = timer
            let point;
            switch (quest[quest.length - 1].getDifficulty()) {
                case "hard":
                    point = 30 * tas;
                    break;
                case "medium":
                    point = 20 * tas;
                    break;
                case "easy":
                    point = 10 * tas;
                    break;

            }
            document.getElementById("points").innerHTML += " + " + point;
            points += point;
            clearTimeout(decrementTimer);
            color = c[position];
            setTimeout(hideT, 750)

        } else {
            document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,0,0,1) 100%)"
            document.getElementById("points").style.color = "red";

            lives--;
            clearTimeout(decrementTimer);
            setTimeout(hideF, 750)
        }
        end = true;
        quest.pop();
    }
}

// Shuflle risposte alla domanda
function shuffle(ans) {
    let appeared = new Set();
    let newAns = [];

    for (let i = 0; i < ans.length; i++) {
        let pos = Math.floor(Math.random() * ans.length);
        while (appeared.has(pos)) pos = Math.floor(Math.random() * ans.length);

        appeared.add(pos);
        newAns.push(ans[pos]);
    }

    return newAns;
}

//Decrementa il timer per la domanda
function decrementTimer() {
    document.getElementById("timeBar").style.width = ((timer - 1) * 10) + "%";
    if (timer < 4) document.getElementById("timeBar").style.backgroundColor = "red";
    if (timer === 0) {
        verify(-1);
    } else if (!end) {
        setTimeout(decrementTimer, 1000)
    }
    timer--;
}


// Nascondono la domanda fatta dalla pagina
function hideF() {
    hide(false)
}

function hideT() {
    hide(true)
}

function hide(guessed) {
    document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,117,255,1) 100%)"
    document.getElementById("question").style.display = "none";
    document.getElementById("points").innerHTML = "Points: " + points;
    document.getElementById("points").style.color = "black";
    document.getElementById("heartContainter").innerHTML = "";
    for (let i = 0; i < lives; i++) {
        document.getElementById("heartContainter").innerHTML += "<img src=\"img/heart.png\" class=\"heart\">\n"
    }
    for (let i = 0; i < totalLives - lives; i++) {
        document.getElementById("heartContainter").innerHTML += "<img src=\"img/heartMissing.png\" class=\"heart\">\n"
    }

    if (guessed) curState = "REVEAL"
    else curState = "TRTDICE";
}


// random
function randBetween(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function decrement() {
    time--
}

// Lerp esponenziale per dado (formula Rossaniana)
function erp(v1, v2, alpha) { // 5 is temp
    return Math.exp(-5 * alpha) * (v1 - v2) + v2;
}


//ROLL DADO
function roll() {
    if (!rolled) {
        if (!active) {
            id = setInterval(decrement, 1000);
            //positions = randBetween(6, 1);
            positions=2;
            active = !active;
            first = false;
        }

        let speed = randBetween(100, 50);

        if (time === 0) {
            time = randBetween(5, 1);
            clearTimeout(id);
            rolled = true;
            active = false;
            straighten()
        } else {
            switch (randBetween(2, 0)) {
                case 0:
                    dice.rotation.x += speed * dt;
                    break;
                case 1:
                    dice.rotation.y += speed * dt;
                    break;
                case 2:
                    dice.rotation.z += speed * dt;
                    break;
            }
        }
    } else if (rolled && !done) straighten();
    else {
        //TODO: CAMERA TORNA A POS ORIGINALE
        oldPos = positions;
        curState = "MOVING";
        document.getElementById("rolled").innerHTML = "Rolled: " + positions;
        timeA = 1;
    }

}
function straighten() {
    if (!first) {
        first = true;
        cumt = 0;
        or = [dice.rotation.x, dice.rotation.y, dice.rotation.z]
    }

    cumt += dt;

    if (cumt < 7) {
        dice.rotation.x = erp(or[0], rotations[positions][0], cumt / 5);
        dice.rotation.y = erp(or[1], rotations[positions][1], cumt / 5);
        dice.rotation.z = erp(or[2], rotations[positions][2], cumt / 5);
    } else {
        dice.rotation.x = rotations[positions][0];
        dice.rotation.y = rotations[positions][1];
        dice.rotation.z = rotations[positions][2];
        done = true;
    }
}

//INIZIO GIOCO
function startGame() {
    curState = "QUESTION"
    document.getElementById("play").style.display = "none"
}
