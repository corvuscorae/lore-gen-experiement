let loreData;

fetch("./loreos.json").then(
    (response) => response.json()
).then(
    (json) => {
        loreData = json;
        generateLoreBase(loreData);
    }
);

function generateLoreBase(dat){
    const base = {};
    for(let pillar in dat){
        const randomIndex = Math.floor(Math.random() * (dat[pillar].length - 1));
        base[pillar] = dat[pillar][randomIndex];
    }
    console.log(base)
}

// load new lore base
document.addEventListener('keydown', (e) => {
	if(e.key.toLowerCase() === "r"){
        generateLoreBase(loreData)
	}
});