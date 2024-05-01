//DOMANDE

let quest;
let end;
let points = 0;
let timer;
let asked = false;
let guessed = false;
let started = false;
let category;

//THREE
let scene = null;
let ui = null;
let camera = null;
let uiCamera = null;

//STATO DELL'AUTOMA
let curState = "WAITING";

//DELTA TIME
let dt;

//PLAYER
let player;
let streak = 0;
let errors = [0, 0, 0, 0, 0];

//sound
let am;

//font
let fm;

//livello 1
let curPos = 0;

let width;
let height;



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

//Da la domanda in base al livello che gli passi da 1 a 3, e se attivato worst chiede la categoria un cui hai fatto più schifo
async function getQuestions(level, worst) {
    let res;
    let dif;

    if (worst) {
        //FIND WORST CATEGORY
        let index = 0;
        for (let i = 0; i < errors.length; i++) if (errors[i] > errors[index]) index = i;
        category = index;
    } else {
        //RANDOM CATEGORY
        category = randBetween(4, 0);
    }

    switch (category) {
        case 0: //Entertainment (Books, Films, Music, Musical & Theaters, Television, Board Games, Video Games
            res = randBetween(16, 10) + "";
            break;
        case 1: //General Knowledge
            res = 9;
            break;
        case 2: //Mithology
            res = 20;
            break;
        case 3: //Science & Nature, Computers, Math
            res = randBetween(19, 17);
            break;
        case 4: //History, Politics, Art
            res = randBetween(25, 23);
            break;
    }

    switch (level) {
        case 1:
            dif = "easy"
            break;
        case 2:
            dif = "medium"
            break;
        case 3:
            dif = "hard"
            break;
    }

    const response = await fetch("https://opentdb.com/api.php?amount=1&category=" + res + "&difficulty=" + dif);
    const q = await response.json();
    quest = []
    for (let i = 0; i < q.results.length; i++) quest.push(new Question(q.results[i]));
}

//Prende la prossima domanda e in caso non ci sia fa un fetch
function next(level, worst) {
    if (!started) {
        getQuestions(level, worst).then(r => loadQuestion());
        return;
    }
    if (quest.length > 0) loadQuestion();
    else getQuestions(level, worst).then(r => loadQuestion());
}


//CHIEDI DOMANDA
function ask(level) {
    next(level, false);
    asked = true;
}

function askWorst(level) {
    next(level, true);
    asked = true;
}

//Carica la domanda sulla pagina
let title
let ans =[];
function loadQuestion() {
    started = true;
    const body = document.getElementById("container");
    end = false;
    timer = 10;

    console.log(quest[quest.length - 1].getRightAnswer()); //CHEAT MATTI D:


    //TITOLO DOMANDA SOPRA PERSONAGGIO
    if (curState!=="LVL3") {
        title = fm.getNewText(quest[quest.length - 1].getName(),0.05 ,0.1,"bold");
        title.position.set(player.getPosition().x, player.getPosition().y + 0.8, player.getPosition().z);
        title.lookAt(camera.position);
        scene.add(title);
    } else {
        title = fm.getNewText(quest[quest.length - 1].getName(),0 ,0.05,"bold");
        title.position.set(-0.3,-0,0.3)
        title.rotation.set(Math.PI/2,0,0);
        ui.add(title)
    }


    //RISPOSTE NELLA SECONDA SCENE
    const size = 0.01;
    const height = 0;
    ans = [];

    for (let i = 0; i < quest[quest.length - 1].getAnswers().length; i++) {
        ans.push(fm.getNewText(quest[quest.length-1].getAnswers()[i]+" - Press "+(i+1),height ,size,"bold",18))
        ans[i].rotation.set(Math.PI/2,0,0);
        ans[i].position.set((i-1.7)*0.3,-0.2,-0.15)
        ui.add(ans[i]);
    }



    //#region OLD QUESTION
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
    //#endregion
    setTimeout(decrementTimer, 1000);
}

//Verifica la domanda
function verify(num) {
    if (!end) {
        if (quest[quest.length - 1].getRightAnswer() === quest[quest.length-1].getAnswers()[num-1]) {

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
            am.play("guess",false,1);
            points += point;
            clearTimeout(decrementTimer);
            document.getElementById("question").style.background = "radial-gradient(circle, rgba(149,255,166, 0.39) 0%, rgba(0,255,72, 0.39) 100%)";
            setTimeout(hide, 750)
            guessed = true;
            streak++;
        } else {
            am.play("wrong",false,1);
            errors[category]++;
            document.getElementById("question").style.background = "radial-gradient(circle, rgba(255,149,149, 0.39) 0%, rgba(255,0,0, 0.39) 100%)"
            clearTimeout(decrementTimer);
            setTimeout(hide, 750)
            guessed = false;
            streak = 0;
        }
        end = true;
        answered = true;
        quest.pop();
    }
}

let answered = false;


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
function hide() {
    if (curState==="LVL3" ||curState==="LVL4" ) ui.remove(title);
    else scene.remove(title);
    for (let i = 0; i < ans.length; i++) ui.remove(ans[i]);
    document.getElementById("question").style.display = "none";
}


// random
function randBetween(max, min) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}


// Lerp esponenziale per dado (formula Rossaniana)
function erp(v1, v2, alpha) { // 5 is temp
    return Math.exp(-5 * alpha) * (v1 - v2) + v2;
}


//INIZIO GIOCO
function startGame() {
    curState = "PREPARING"
    document.getElementById("play").style.display = "none"
}
