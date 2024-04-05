let quest;
let end;
let points = 0;
let timer;

let started = false;

let positions = 0;
let oldPos = 0;
let asked = false;

let curState = "WAITING";

//PLAYER
let lives = 3;
let onTopOf = 0;


// caselle
let c;


async function getQuestions(color,number) {
    let res;
    switch (color){
        case 0xd900ff: //VIOLA: Entertainment (Books, Films, Music, Musical & Theaters, Television, Board Games, Video Games
            res=randBetween(16,10)+"";
            break;
        case 0x1e00ff: //BLU: General Knowledge
            res="9";
            break;
        case 0x00f2ff: //AZZURRO: Mithology
            res="20";
            break;
        case 0x00ff3c: // VERDE: Science & Nature, Computers, Math
            res=randBetween(19,17);
            break;
        case 0xfbff00: // GIALLO: History, Politics, Art
            res=randBetween(25,23);
            break;
    }

    const response = await fetch("https://opentdb.com/api.php?amount="+number+"&category="+res);
    const q = await response.json();
    quest = []
    for (let i = 0; i < q.results.length; i++) {
        quest.push(new Question(q.results[i]));
    }
}

function loadQuestion() {
    started = true;
    const body = document.getElementById("container");
    end = false;
    timer = 10;


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

function verify(num) {
    if (!end) {
        if (quest[quest.length - 1].getRightAnswer() === num) {
            document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,255,0,1) 100%)"
            document.getElementById("points").style.color = "green";

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

        } else {
            document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,0,0,1) 100%)"
            document.getElementById("points").style.color = "red";

            lives--;
        }
        end = true;
        quest.pop();

        clearTimeout(decrementTimer);
        setTimeout(hide, 750)
    }
}

function hide() {
    document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,117,255,1) 100%)"
    document.getElementById("question").style.display = "none";
    document.getElementById("points").innerHTML = "Points: " + points;
    document.getElementById("points").style.color = "black";
    document.getElementById("heartContainter").innerHTML="";
    for (let i = 0; i < lives; i++) {
        document.getElementById("heartContainter").innerHTML+="<img src=\"img/heart.png\" class=\"heart\">\n"
    }
    for (let i = 0; i < 3 - lives; i++) {
        document.getElementById("heartContainter").innerHTML+="<img src=\"img/heartMissing.png\" class=\"heart\">\n"
    }

    curState = "ROLLING";
}

function clearResult() {
    changed = true;
}

function next() {

    if (!started) {
        getQuestions(c[onTopOf],1).then(r => loadQuestion());
        return;
    }
    clearResult();
    if (quest.length > 0) loadQuestion();
    else getQuestions(c[onTopOf],1).then(r => loadQuestion());
}



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

function randBetween(max,min){
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function roll() {
    positions = randBetween(6,1);
    oldPos = positions;
    curState = "MOVING";
    document.getElementById("rolled").innerHTML="Rolled: "+positions;
}

function ask() {
    if (!asked) {
        setTimeout(next,1000)
        asked = true;
    }
}

function startGame(){
    curState="QUESTION"
    document.getElementById("play").style.display="none"
}


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
