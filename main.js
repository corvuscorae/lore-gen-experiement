const JSON_PATH = "./json"
let loreData;

let worldStats;
let continentStats = {};

let numContinents = parseInt(document.getElementById("num-continents").value);
const updateNumContinentsButton = document.getElementById("num-continents-button");
updateNumContinentsButton.addEventListener('click', function() {
    const oldNum = numContinents;
    numContinents = parseInt(document.getElementById("num-continents").value);

    if(oldNum < numContinents){
        genMultipleContinents(loreData, numContinents, oldNum);
    } else if (oldNum > numContinents){
        trimContinents(oldNum - numContinents);
    }
});

fetch(`${JSON_PATH}/_loreKeys.json`).then(
    (response) => response.json()
).then(
    (json) => {
        loreData = json;
        init(loreData, numContinents)
    }
);

async function init(loreData, num){
    worldStats = await generateLore(loreData.world);
    document.getElementById(`world-stats`).innerHTML = "";
    printLore(worldStats, "world");
    
    document.getElementById(`continent-stats`).innerHTML = "";
    genMultipleContinents(loreData, num);
}

async function genMultipleContinents(loreData, num, from = 0) {
    num = parseInt(num);
    from = parseInt(from);

    for(let i = from; i < num; i++){
        let newContinent = await genContinent(loreData, i);
        continentStats[newContinent.name] = newContinent;
    }
    console.log(continentStats)
}

async function genContinent(loreData, i){
    let continent = await generateLore(loreData.continent);
    continent.name = [`continent ${i+1}`];  // TODO: name continents

    printLore(continent, "continent");

    return continent;
}

function trimContinents(num){
    // trim the last {num} keys
    const trimKeys = Object.keys(continentStats).slice(-num);
    for(const key of trimKeys){
        delete continentStats[key];
    }

    // update webpage to no longer show trimmed continents
    document.getElementById(`continent-stats`).innerHTML = "";
    for(let continent in continentStats){
        printLore(continentStats[continent], "continent")
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
        document.getElementById(`continent-stats`).innerHTML = "";
        genMultipleContinents(loreData, numContinents);
    }
    if(e.key.toLowerCase() === "w"){
        init(loreData, numContinents);
	}
});