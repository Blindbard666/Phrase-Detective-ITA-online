// ======================================================
// Phrase Detective
// script.js
// ======================================================

// ------------------------------------------------------
// Costanti colori
// ------------------------------------------------------

const COLORS = {
    correct: "#00c853",
    veryClose: "#c9a92c",
    close: "#c97a2c",
    far: "#a83232",
    veryFar: "#5a3b1e"
};

// ------------------------------------------------------
// Elementi della pagina
// ------------------------------------------------------

const grid = document.getElementById("grid");
const message = document.getElementById("message");

const btnShuffle = document.getElementById("btn-shuffle");
const btnNew = document.getElementById("btn-new");
const difficultySelect = document.getElementById("difficulty");

// ------------------------------------------------------
// Stato del gioco
// ------------------------------------------------------

let currentPhrase = "";

let phraseNoSpaces = [];

let wordLengths = [];

let letters = [];

let selectedIndex = null;

let usedPhrases = {
    facile: [],
    media: [],
    difficile: []
};

// ------------------------------------------------------
// Salva/Ripristina difficoltà
// ------------------------------------------------------

const savedDifficulty = localStorage.getItem("difficulty");

if (savedDifficulty && FRASI[savedDifficulty]) {

    difficultySelect.value = savedDifficulty;

}

difficultySelect.addEventListener("change", () => {

    localStorage.setItem("difficulty", difficultySelect.value);

    startNewGame();

});

// ------------------------------------------------------
// Utilità
// ------------------------------------------------------

function cloneLetters(array){

    return array.map(l => ({...l}));

}

function randomItem(array){

    return array[Math.floor(Math.random()*array.length)];

}

// ------------------------------------------------------
// Estrae una frase casuale
// senza ripetizioni
// ------------------------------------------------------

function getRandomPhrase(level){

    const archive = FRASI[level];

    if(usedPhrases[level].length === archive.length){

        usedPhrases[level] = [];

    }

    let available = archive.filter(

        p => !usedPhrases[level].includes(p)

    );

    const phrase = randomItem(available);

    usedPhrases[level].push(phrase);

    return phrase;

}

// ------------------------------------------------------
// Carica una frase
// ------------------------------------------------------

function loadPhrase(text){

    currentPhrase = text;

    phraseNoSpaces = Array.from(

        text.replace(/ /g,"")

    ).map((char,index)=>({

        char,

        id:index

    }));

    wordLengths = text

        .split(" ")

        .map(word => Array.from(word).length);

    letters = cloneLetters(phraseNoSpaces);

    selectedIndex = null;

    message.textContent = "";

    initialShuffle();

    render();

}

// ------------------------------------------------------
// Nuova partita
// ------------------------------------------------------

function startNewGame(){

    const level = difficultySelect.value;

    const phrase = getRandomPhrase(level);

    loadPhrase(phrase);

}

// ------------------------------------------------------
// Mischia iniziale
// evitando lettere già corrette
// ------------------------------------------------------

function initialShuffle(){

    let ok = false;

    while(!ok){

        const shuffled = letters

            .map(value=>({

                value,

                sort:Math.random()

            }))

            .sort((a,b)=>a.sort-b.sort)

            .map(obj=>obj.value);

        const hasCorrect = shuffled.some(

            (obj,index)=>

                obj.id===phraseNoSpaces[index].id

        );

        if(!hasCorrect){

            letters = shuffled;

            ok = true;

        }

    }

}

// ------------------------------------------------------
// Rimescola
// solo lettere sbagliate
// ------------------------------------------------------

function shuffleWrongLetters(){

    const wrong = letters.filter(

        (obj,index)=>

            obj.id!==phraseNoSpaces[index].id

    );

    const shuffled = wrong

        .map(value=>({

            value,

            sort:Math.random()

        }))

        .sort((a,b)=>a.sort-b.sort)

        .map(obj=>obj.value);

    let i = 0;

    letters = letters.map((obj,index)=>{

        if(obj.id===phraseNoSpaces[index].id){

            return obj;

        }

        return shuffled[i++];

    });

    selectedIndex = null;

    render();

}
// ------------------------------------------------------
// Colore della casella
// ------------------------------------------------------

function distanceColor(index){

    const correctObj = phraseNoSpaces[index];

    if(letters[index].id === correctObj.id){

        return COLORS.correct;

    }

    const positions = phraseNoSpaces

        .map((obj,i)=>obj.id===letters[index].id ? i : null)

        .filter(i=>i!==null);

    if(positions.length===0){

        return COLORS.veryFar;

    }

    let min = Infinity;

    for(const p of positions){

        const d = Math.abs(index-p);

        if(d<min){

            min=d;

        }

    }

    if(min<=3) return COLORS.veryClose;

    if(min<=6) return COLORS.close;

    if(min<=12) return COLORS.far;

    return COLORS.veryFar;

}

// ------------------------------------------------------
// Disegna la griglia
// ------------------------------------------------------

function render(){

    grid.innerHTML="";

    let pos=0;

    wordLengths.forEach(len=>{

        const word=document.createElement("div");

        word.className="word";

        for(let j=0;j<len;j++,pos++){

            const i=pos;

            const obj=letters[i];

            const cell=document.createElement("div");

            cell.className="cell";

            if(obj.id===phraseNoSpaces[i].id){

                cell.classList.add("locked");

            }

            if(selectedIndex===i){

                cell.classList.add("selected");

            }

            cell.textContent=obj.char;

            cell.style.background=distanceColor(i);

            cell.addEventListener(

                "click",

                ()=>clickLetter(i)

            );

            word.appendChild(cell);

        }

        grid.appendChild(word);

    });

}

// ------------------------------------------------------
// Click su una lettera
// ------------------------------------------------------

function clickLetter(index){

    if(letters[index].id===phraseNoSpaces[index].id){

        return;

    }

    if(selectedIndex===null){

        selectedIndex=index;

        render();

        return;

    }

    if(selectedIndex===index){

        selectedIndex=null;

        render();

        return;

    }

    swapLetters(selectedIndex,index);

    selectedIndex=null;

    render();

    checkWin();

}

// ------------------------------------------------------
// Scambia due lettere
// ------------------------------------------------------

function swapLetters(a,b){

    const tmp=letters[a];

    letters[a]=letters[b];

    letters[b]=tmp;

}

// ------------------------------------------------------
// Controlla la vittoria
// ------------------------------------------------------

function checkWin(){

    const ok=letters.every(

        (obj,index)=>obj.id===phraseNoSpaces[index].id

    );

    if(!ok){

        message.textContent="";

        return;

    }

    message.textContent="🎉 Complimenti!";

    setTimeout(()=>{

        startNewGame();

    },1200);

}

// ------------------------------------------------------
// Pulsanti
// ------------------------------------------------------

btnShuffle.addEventListener(

    "click",

    shuffleWrongLetters

);

btnNew.addEventListener(

    "click",

    startNewGame

);

// ------------------------------------------------------
// Avvio
// ------------------------------------------------------

startNewGame();
