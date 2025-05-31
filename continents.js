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