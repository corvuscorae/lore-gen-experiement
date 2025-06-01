import GLOBAL from "./globals.js";
import { generateWorld, genMultipleContinents, trimContinents } from "./lore.js";

const updateNumContinentsButton = document.getElementById("num-continents-button");
updateNumContinentsButton.addEventListener('click', async function() {
    const oldNum = GLOBAL.NUM_CONTINENTS;
    GLOBAL.NUM_CONTINENTS = parseInt(document.getElementById("num-continents").value);

    if(oldNum < GLOBAL.NUM_CONTINENTS){
        await genMultipleContinents(GLOBAL.LORE_DATA, GLOBAL.NUM_CONTINENTS, oldNum);
        printContinents();
    } else if (oldNum > GLOBAL.NUM_CONTINENTS){
        trimContinents(oldNum - GLOBAL.NUM_CONTINENTS);
        printContinents();
    }
});

fetch(`${GLOBAL.JSON_PATH}/_loreKeys.json`).then(
    (response) => response.json()
).then(
    (json) => {
        GLOBAL.LORE_DATA = json;
        init(GLOBAL.LORE_DATA, GLOBAL.NUM_CONTINENTS);
    }
);

// load new lore base
document.addEventListener('keydown', (e) => {
	if(e.key.toLowerCase() === "r"){
        document.getElementById(`continent-stats`).innerHTML = "";
        genMultipleContinents(GLOBAL.LORE_DATA, GLOBAL.NUM_CONTINENTS);
        printContinents();
    }
    if(e.key.toLowerCase() === "w"){
        init(GLOBAL.LORE_DATA, GLOBAL.NUM_CONTINENTS);
        printWorld();
	}
});

async function init(loreData, num){
    await generateWorld(loreData, num);

    printWorld();
    printContinents();
}

function printWorld(){
    document.getElementById(`world-stats`).innerHTML = "";
    printLore(GLOBAL.WORLD_STATS, "world");
}

function printContinents(){
    document.getElementById(`continent-stats`).innerHTML = "";
    for(let continent in GLOBAL.CONTINENT_STATS){
        printLore(GLOBAL.CONTINENT_STATS[continent], "continent")
    }
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