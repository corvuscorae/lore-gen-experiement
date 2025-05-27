let loreData;

fetch("./lore_keys.json").then(
    (response) => response.json()
).then(
    (json) => {
        loreData = json;
        generateLore(loreData.world, "world");
        generateLore(loreData.continent, "continent");
    }
);

function generateLore(data, level){
    const base = {};

    for(let cat in data){
        let numPicks = Math.floor(Math.random() * cat[0])
        base[cat] = new Set();

        // TODO: prevent randomIndex from repeating
        for(let i = 0; i <= numPicks; i++){
            if(data[cat].length === 0){ break; }
            if(data[cat].length < numPicks){ numPicks = data[cat.length]; }

            const randomIndex = Math.floor(Math.random() * (data[cat].length));
            const pick = data[cat][randomIndex];
            base[cat].add(pick);
        }
    }
    
    //console.log(base);
    printLore(base, level);
}

function printLore(base, level){
    let printTo = document.getElementById(`${level.toLowerCase()}-stats`)
    let printOut = `<h3>${level.toUpperCase()} STATS</h3>`;

    for(let b in base){
        let b_items = "";

        for(let item of base[b]){
            b_items += `${item}, `
        }
        b_items = b_items.slice(0, -2); // remove ", "

        printOut += `<p><b>${b.substring(2)}</b>: ${b_items}`;
    }
    //printOut += `<p><b>${pillar.substring(2)}</b>: ${dat[pillar][randomIndex]}</p>`
    printTo.innerHTML = printOut;
}

// load new lore base
document.addEventListener('keydown', (e) => {
	if(e.key.toLowerCase() === "r"){
        generateLore(loreData.continent, "continent");
	}
    if(e.key.toLowerCase() === "w"){
        generateLore(loreData.world, "world");
        generateLore(loreData.continent, "continent");
	}
});