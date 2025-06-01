import GLOBAL from "./globals.js";
import { getChoices } from "./json_utils.js";

export async function generateWorld(loreData, num) {
    GLOBAL.WORLD_STATS = await generateLore(loreData.world);
    await genMultipleContinents(loreData, num);
}

export async function genMultipleContinents(loreData, num, from = 0) {
    num = parseInt(num);
    from = parseInt(from);

    for(let i = from; i < num; i++){
        let newContinent = await genContinent(loreData, i);
        GLOBAL.CONTINENT_STATS[newContinent.name] = newContinent;
    }

    // make relationships between continents
    // TODO: implement smarter relationship generation (maybe based on governments/ideology)
    for(let c in GLOBAL.CONTINENT_STATS){
        if(GLOBAL.CONTINENT_STATS[c].government[0] !== "none"){
            if(GLOBAL.CONTINENT_STATS[c].allies.size === 0){
                getRandomAllies(
                    GLOBAL.CONTINENT_STATS[c], 
                    Math.floor(Math.random() * num)
                );
            }
            if(GLOBAL.CONTINENT_STATS[c].enemies.size === 0){
                getRandomEnemies(
                    GLOBAL.CONTINENT_STATS[c], 
                    Math.floor(Math.random() * num)
                );
            }
        }
    }

    // DEBUG: console.log(continentStats)
}

export function trimContinents(num){
    // trim the last {num} keys
    const trimKeys = Object.keys(GLOBAL.CONTINENT_STATS).slice(-num);
    for(const key of trimKeys){
        let deleteContinent = GLOBAL.CONTINENT_STATS[key];

        for(let c in GLOBAL.CONTINENT_STATS){
            let continent = GLOBAL.CONTINENT_STATS[c];
            if(continent.enemies.has(deleteContinent.ID)){
                continent.enemies.delete(deleteContinent.ID);
            }
            if(continent.allies.has(deleteContinent.ID)){
                continent.allies.delete(deleteContinent.ID);
            }
        }

        delete GLOBAL.CONTINENT_STATS[key];
    }
}

function getRandomAllies(self, num){
    const allies = self.allies;
    const  cKeys = Object.keys(GLOBAL.CONTINENT_STATS);
    let randomIndex = Math.floor(Math.random() * cKeys.length);

    for(let i = 0; i < num; i++){
        let potentialAlly = GLOBAL.CONTINENT_STATS[cKeys[randomIndex]]; 
        if( potentialAlly.ID !== self.ID && 
            potentialAlly.government[0] !== "none" &&
            !self.enemies.has(potentialAlly.ID) &&
            !potentialAlly.enemies.has(self.ID)
        ){
            allies.add(potentialAlly.ID);
            potentialAlly.allies.add(self.ID)           
        }   
        randomIndex = Math.floor(Math.random() * cKeys.length);
    }
}

function getRandomEnemies(self, num){
    const enemies = self.enemies;
    const  cKeys = Object.keys(GLOBAL.CONTINENT_STATS);
    let randomIndex = Math.floor(Math.random() * cKeys.length);

    for(let i = 0; i < num; i++){
        let potentialEnemy = GLOBAL.CONTINENT_STATS[cKeys[randomIndex]]; 
        if( potentialEnemy.ID !== self.ID &&
            potentialEnemy.government[0] !== "none" &&
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
    continent.name = [`continent ${i+1}`];  // TODO: better continent names
    continent.ID = [i+1];
    continent.allies = new Set();
    continent.enemies = new Set();

    return continent;
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