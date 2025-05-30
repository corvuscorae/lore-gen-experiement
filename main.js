const JSON_PATH = "./json"
let loreData;

let worldStats;
let continentStats = [];

let numContinents = document.getElementById("num-continents").value;
const updateNumContinentsButton = document.getElementById("num-continents-button");
updateNumContinentsButton.addEventListener('click', function() {
    numContinents = document.getElementById("num-continents").value;
    genContinents(loreData, numContinents);
});

fetch(`${JSON_PATH}/_loreKeys.json`).then(
    (response) => response.json()
).then(
    (json) => {
        loreData = json;
        init(loreData, numContinents)
    }
);

async function init(loreData, numContinents){
    worldStats = await generateLore(loreData.world);
    document.getElementById(`world-stats`).innerHTML = "";
    printLore(worldStats, "world");
    
    genContinents(loreData, numContinents);
}

async function genContinents(loreData, numContinents){
    document.getElementById(`continent-stats`).innerHTML = "";
    for(let i = 0; i < numContinents; i++){
        let curr = await generateLore(loreData.continent);
        continentStats.push(curr);
        printLore(curr, "continent");
    }
}

async function generateLore(data){
    const base = {};

    for(let cat in data){
        let numPicks = data[cat].maxPicks;

        base[cat] = new Set();

        // TODO: prevent randomIndex from repeating
        for(let i = 0; i < numPicks; i++){
            if(data[cat].length === 0){ break; }

            let choices = null;
            if(data[cat].choice_control){
                // choice_control variable should refer to a worldStats param
                const choiceJSON = await loadJSON(`${JSON_PATH}/${data[cat].choice_control}.json`);
                const c = worldStats[`${data[cat].choice_control}`][0]; // assuming only once controller

                if(c){ choices = choiceJSON[c]; }
            }
            else if(data[cat].choices){
                choices = data[cat].choices;  // TODO: handle when choices are in another document??
            }

            if(choices === null){
                console.error(`ERROR: unable to load choices for {${cat}}`);
                break;
            }

            if(data[cat].length < numPicks){ numPicks = choices.length; }

            const randomIndex = Math.floor(Math.random() * (choices.length));
            const pick = choices[randomIndex];
            base[cat].add(pick);
        }
        base[cat] = [...base[cat]]; // convert to array
    }
    
    //console.log(base);
    return base;
}

function printLore(base, level){
    let printTo = document.getElementById(`${level.toLowerCase()}-stats`);
    let printOut = `<h3>${level.toUpperCase()} STATS</h3>`;

    for(let b in base){
        let b_items = "";

        for(let item of base[b]){
            b_items += `${item}, `
        }
        b_items = b_items.slice(0, -2); // remove ", "

        printOut += `<p><b>${b}</b>: ${b_items}`;
    }
    //printOut += `<p><b>${pillar.substring(2)}</b>: ${dat[pillar][randomIndex]}</p>`
    printTo.innerHTML += printOut;
}

async function loadJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not load JSON: " + error);
        return null;
    }
}

// load new lore base
document.addEventListener('keydown', (e) => {
	if(e.key.toLowerCase() === "r"){
        genContinents(loreData, numContinents);
    }
    if(e.key.toLowerCase() === "w"){
        init(loreData, numContinents);
	}
});