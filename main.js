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

    for(let c in continentStats){
        if(continentStats[c].government !== "none"){
            if(continentStats[c].allies.size === 0){
                getAllies(
                    continentStats[c], 
                    Math.floor(Math.random() * num)
                );
            }
            if(continentStats[c].enemies.size === 0){
                getEnemies(
                    continentStats[c], 
                    Math.floor(Math.random() * num)
                );
            }
        }
    }

    for(let c in continentStats){
        printLore(continentStats[c], "continent");
    }


    // DEBUG: console.log(continentStats)
}

function getAllies(self, num){
    const allies = self.allies;
    const  cKeys = Object.keys(continentStats);
    let randomIndex = Math.floor(Math.random() * cKeys.length);

    for(let i = 0; i < num; i++){
        let potentialAlly = continentStats[cKeys[randomIndex]]; 
        if(potentialAlly.government === "none"){ continue; }
        if( potentialAlly.ID !== self.ID && 
            !self.enemies.has(potentialAlly.ID) &&
            !potentialAlly.enemies.has(self.ID)
        ){
            allies.add(potentialAlly.ID);
            potentialAlly.allies.add(self.ID)           
        }   
        randomIndex = Math.floor(Math.random() * cKeys.length);
    }
}

function getEnemies(self, num){
    const enemies = self.enemies;
    const  cKeys = Object.keys(continentStats);
    let randomIndex = Math.floor(Math.random() * cKeys.length);

    for(let i = 0; i < num; i++){
        let potentialEnemy = continentStats[cKeys[randomIndex]]; 
        if( potentialEnemy.ID !== self.ID &&
            !self.allies.has(potentialEnemy.ID) &&
            !potentialEnemy.allies.has(self.ID)
        ){
            enemies.add(potentialEnemy.ID);
            potentialEnemy.enemies.add(self.ID)           
        }   
        randomIndex = Math.floor(Math.random() * cKeys.length);
    }
}

async function genContinent(loreData, i){
    let continent = await generateLore(loreData.continent);
    continent.name = [`continent ${i+1}`];  // TODO: name continents
    continent.ID = [i+1];
    continent.allies = new Set();
    continent.enemies = new Set();

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
        const maxPicks = data[cat].maxPicks;
        const minPicks = (data[cat].minPicks) ? data[cat].minPicks : 0;
        const numPicks = Math.ceil(Math.random() * (maxPicks - minPicks)) + minPicks;

        base[cat] = new Set();
        let choices;
        if(data[cat].length !== 0){ 
            choices = await getChoices(data, cat, base);
        }
        // TODO: LEFT OFF HERE
        // debug: why is revered choices not gathering all possible choices (or IS it??)

        // TODO: prevent randomIndex from repeating
        for(let i = 0; i < numPicks; i++){
            if(choices === null){
                console.error(`ERROR: unable to load choices for {${cat}}`);
                break;
            }

            if(data[cat].length < numPicks){ numPicks = choices.length; }

            const randomIndex = Math.floor(Math.random() * (choices.length));
            let pick = choices[randomIndex];

            if(pick && pick !== "none" && data[cat].modifiers){
                let mods = data[cat].modifiers.values;
                // TODO ADD WEIGHTING CONTROL FOR MODS!!!!!!!! 
                const randomIndex = Math.floor(Math.random() * (mods.length));
                const modifier = mods[randomIndex];

                if(modifier.length > 0){ pick = modifier + " " + pick; }
            }

            base[cat].add(pick);
        }
        base[cat] = [...base[cat]]; // convert to array
    }
    
    //console.log(base);
    return base;
}

async function getChoices(data, cat, self){
    let choices = [];
    if(data[cat].choice_control){
        const controller = data[cat].choice_control;
        const choiceJSON = await loadJSON(`${JSON_PATH}/${controller.json}.json`);

        let loc;
        let attr_choices;
        if(controller.location === "world"){ loc = worldStats; }
        else if(controller.location === "self"){ loc = self; }
        else {
            console.error(`Unknown control location: ${controller.location}`)
            return;
        }

        attr_choices = loc[`${controller.attribute}`]; 
        for(const c in attr_choices){
            choices = choices.concat(choiceJSON[attr_choices[c]]); 
        }
    }
    else if(data[cat].choices){
        choices = data[cat].choices;  
    }
            
    return choices;
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