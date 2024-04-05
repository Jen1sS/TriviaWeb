function onLoadSetup() {
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

async function getQuestions() {
    const response = await fetch("https://opentdb.com/api.php?amount=10");
    const q = await response.json();
    quest = []
    for (let i = 0; i < q.results.length; i++) {
        quest.push(new Question(q.results[i]));
    }
}

function verify(num) {
    if (!end) {
        if (quest[quest.length - 1].getRightAnswer() === num) {
            document.getElementsByTagName("header").item(0).style.background = "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,255,0,1) 100%)"
            document.getElementById("points").style.color = "green";
            points += 10 * timer;


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
            document.getElementById("lives").style.color = "red";
            document.getElementById("lives").innerHTML += " -1";

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
    document.getElementById("lives").innerHTML = "Lives: " + lives;
    document.getElementById("points").style.color = "black";
    document.getElementById("lives").style.color = "black";

    curState = "ROLLING";
}

function clearResult() {
    changed = true;
}

function next() {
    if (!started) {
        getQuestions().then(r => loadQuestion());
        return;
    }
    clearResult();
    if (quest.length > 0) loadQuestion();
    else getQuestions().then(r => loadQuestion());
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

function roll() {
    positions = Math.floor(Math.random() * (6 - 1 + 1) + 1);
    oldPos = positions;
    curState = "MOVING";
}

function ask() {
    if (!asked) {
        next();
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
