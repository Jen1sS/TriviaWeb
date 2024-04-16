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
let lives = 5;
let completed = {0xd900ff: false, 0x1e00ff: false, 0x00f2ff: false, 0x00ff3c: false, 0xfbff00: false}
let oldPos = 0; //ultima posizione
let won;


//ROLL
let positions = 0; //roll uscito
let time = randBetween(5, 1);
let rolled = false;
let active = false
let id;

//RADDRIZZAMENTO DADO
let done = false;

//DICE
let dice

//LERPING
let timeA = 1;

// CASELLE (colori)
let c;
let color = null; //colore della casella indovinata

//DELTA TIME
let dt;

//PLAYER
let player;



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
        getQuestions(c[player.getOnCell()], 1).then(r => loadQuestion());
        return;
    }
    if (quest.length > 0) loadQuestion();
    else getQuestions(c[player.getOnCell()], 1).then(r => loadQuestion());
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

            completed[c[player.getOnCell()]] = true;

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
            points += point;
            clearTimeout(decrementTimer);
            document.getElementById("question").style.background = "radial-gradient(circle, rgba(149,255,166,1) 0%, rgba(0,255,72,1) 100%)";
            color = c[player.getOnCell()];
            setTimeout(hideT, 750)
        } else {
            lives--;
            document.getElementById("question").style.background = "radial-gradient(circle, rgba(255,149,149,1) 0%, rgba(255,0,0,1) 100%)"
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
    won=false;
    hide(false)
}

function hideT() {
    won=true;
    hide(true)
}

function hide(guessed) {
    document.getElementById("question").style.display = "none";

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
            positions = randBetween(6, 1);
            active = !active;
        }

        if (time === 0) {
            time = randBetween(5, 1);
            clearTimeout(id);
            rolled = true;
            active = false;
            dice.initializeStraighten(positions);
        } else {
            dice.roll(75);
        }
    } else if (rolled && !done) done = dice.straighten(dt);
    else {
        //TODO: CAMERA TORNA A POS ORIGINALE
        oldPos = positions;
        curState = "MOVING";
        timeA = 1;
    }

}

//INIZIO GIOCO
function startGame() {
    curState = "PREPARING"
    document.getElementById("play").style.display = "none"
}
