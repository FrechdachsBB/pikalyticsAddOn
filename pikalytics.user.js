// ==UserScript==
// @name         Pikalytics Overlay
// @namespace    https://github.com/FrechdachsBB/
// @version      0.1
// @description  Adds helpful overlays to pikalytics.com
// @author       FrechdachsBB
// @match        https://pikalytics.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pikalytics.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.js
// @require      https://unpkg.com/pokeapi-js-wrapper/dist/index.js
// @run-at       document-end
// ==/UserScript==


(function () {
    const lang = "en"
    const P = new Pokedex.Pokedex()
    let ignoreDomChange = false;
    const pokemonTypesMap = new Map();

    const style = `
    .overlay {
        position: fixed !important;
        background-color: rgba(20, 20, 20, 0.8) !important;
        border: 2px solid darkgray !important;
        border-radius: 5px !important;
        padding: 4px 10px !important;
        z-index: 9999 !important;
        pointer-events: none !important;
        font-size: 15px !important;
        color: white !important;
    }
    .overlay * {
        color: white !important;
        font-size: 15px !important;
    }    
    
    `

    setTimeout(function () {
        typesData.forEach(type => {
            pokemonTypesMap.set(type.name.toLowerCase(), new pokemonType(type.name, type.resists, type.weakness, type.immune));
        });
        addStyle()
        act();
        monitorDomChanges();
        console.log("Script loaded!");
    }, 1000)

    function act() {
        ignoreDomChange = true;
        setTimeout(function () {
            addItemOverlays();
            addMoveOverlays();
            addAbilityOverlays();
            //addTypeOverlay(); Not good enough yet
            setTimeout(function () { ignoreDomChange = false }, 500)
        }, 1000)
    }

    function onDomChange() {
        if (!ignoreDomChange) {
            act();
        }
    }

    function monitorDomChanges() {
        const observer = new MutationObserver(function (mutationsList) {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    onDomChange();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function addStyle() {
        var styleSheet = document.createElement("style")
        styleSheet.textContent = style
        document.head.appendChild(styleSheet)
    }

    function addItemOverlays() {
        let items = $('#items_wrapper .pokedex-move-entry-new')
        items.each(function (index) {
            const target = $(this)
            let item = target.children()[1].innerText;
            if (item == "Other") return;
            item = transformPokedexName(item);
            P.getItemByName(item)
                .then(function (response) {
                    addOverlay(target, createTable([[getEffectDescr(response)]]))
                })

        })
    }

    function addMoveOverlays() {
        let moves = $('#moves_wrapper .pokedex-move-entry-new')
        moves.each(function (index) {
            const target = $(this)
            let move = target.children()[0].innerText;
            if (move == "Other") return;
            move = transformPokedexName(move);
            P.getMoveByName(move)
                .then(function (response) {
                    let dmgClass = response.damage_class.name;
                    let acc = response.accuracy
                    let pow = response.power
                    addOverlay(target, createTable(
                        [
                            [("ACC: ") + (acc ? acc : "-"), ("POW: ") + (pow ? pow : "-"), dmgClass],
                            [getEffectDescr(response)]
                        ]
                    ));
                })

        })
    }

    function addAbilityOverlays() {
        let abilities = $('#abilities_wrapper .pokedex-move-entry-new');
        abilities.each(function (index) {
            const target = $(this)
            let ability = target.children()[0].innerText;
            ability = transformPokedexName(ability);
            P.getAbilityByName(ability)
                .then(function (response) {
                    addOverlay(target, createTable([[getEffectDescr(response)]]))
                })
        })
    }

    function transformPokedexName(text) {
        text = text.toLowerCase()
        text = text.replace(" ", "-")
        return text;
    }

    function addTypeOverlay() {
        $(".type").each(function (index) {
            if ($(this).hasClass("ignore")) return;
            let target = $(this)[0];
            let type = target.innerText.toLowerCase();
            console.log(target);
            console.log(type)
            type = pokemonTypesMap.get(type);

            let table = document.createElement("table")
            let trResists = document.createElement("tr")
            let trImmuneTo = document.createElement("tr")
            let trWeakTo = document.createElement("tr")

            let tdDescrResists = document.createElement("td")
            let tdDescrImmune = document.createElement("td")
            let tdDescrWeakTo = document.createElement("td")

            let tdValResists = document.createElement("td")
            let tdValImmune = document.createElement("td")
            let tdValWeakTo = document.createElement("td")

            tdDescrResists.innerText = "Resists (x0.5)"
            tdDescrImmune.innerText = "Immunities (x0)"
            tdDescrWeakTo.innerText = "Weaknesses (x2)"


            for(let t of type.resists){
                tdValResists.appendChild(createTypeElement(t))
            }
            for(let t of type.immune){
                tdValImmune.appendChild(createTypeElement(t))
            }
            for(let t of type.weakness){
                tdValWeakTo.appendChild(createTypeElement(t))
            }

            trResists.appendChild(tdDescrResists);
            trResists.appendChild(tdValResists);
            trImmuneTo.appendChild(tdDescrImmune);
            trImmuneTo.appendChild(tdValImmune);
            trWeakTo.appendChild(tdDescrWeakTo);
            trWeakTo.appendChild(tdValWeakTo);
            table.appendChild(trResists);
            table.appendChild(trWeakTo);
            table.appendChild(trImmuneTo);
            addOverlay($(this), table);
        })
    }

    function createTypeElement(type, hasIgnoreClass=true){
        let span = document.createElement("span");
        span.classList.add("type", type)
        if(hasIgnoreClass)span.classList.add("ignore")
        span.innerText = type;
        return span;    
    }

    function addOverlay(target, content, offSetX = 0, offSetY = -100) {
        let box = document.createElement("div");
        box.classList.add("overlay");
        box.appendChild(content);
        target.on('mouseover', function (event) {
            const rect = target[0].getBoundingClientRect();
            box.style.left = `${rect.left + window.scrollX + offSetX}px`; // Position relativ zum Viewport
            box.style.top = `${rect.top + window.scrollY + offSetY}px`;  // Position relativ zum Viewport
            ignoreDomChange = true;
            document.body.appendChild(box);
            setTimeout(function () { ignoreDomChange = false }, 500)
        })

        target.on('mouseleave', function () {
            ignoreDomChange = true;
            document.body.removeChild(box)
            setTimeout(function () { ignoreDomChange = false }, 500)

        })

    }

    function getEffectDescr(element) {
        let effect = element.effect_entries.find(e => e.language.name == lang);
        if (!effect) {
            effect = element.flavor_text_entries.find(e => e.language.name == lang);
            effect = effect ? effect.flavor_text : "No description available"
        } else effect = effect.short_effect;
        return effect;
    }

    function createTable(data) {
        const table = document.createElement('table');
        const maxColumns = data.reduce((max, row) => Math.max(max, row.length), 0);
        data.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach((cellData, index) => {
                const cell = document.createElement('td');
                if (cellData instanceof HTMLElement) {
                    cell.appendChild(cellData);
                } else {
                    cell.textContent = cellData;
                }
                if (index === rowData.length - 1) {
                    cell.colSpan = maxColumns - index;
                }
                row.appendChild(cell);
            });
    
            table.appendChild(row);
        });
    
        return table;
    }
})();

class pokemonType {
    constructor(name, resists, weakness, immune) {
        this.name = name;
        this.resists = resists;
        this.immune = immune;
        this.weakness = weakness;
    }
}


const typesData = [
    { name: 'Normal', resists: [], weakness: ['Fighting'], immune: ['Ghost'] },
    { name: 'Fire', resists: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'], weakness: ['Water', 'Ground', 'Rock'], immune: [] },
    { name: 'Water', resists: ['Fire', 'Water', 'Ice', 'Steel'], weakness: ['Electric', 'Grass'], immune: [] },
    { name: 'Electric', resists: ['Electric', 'Flying', 'Steel'], weakness: ['Ground'], immune: [] },
    { name: 'Grass', resists: ['Water', 'Electric', 'Grass', 'Ground'], weakness: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'], immune: [] },
    { name: 'Ice', resists: ['Ice'], weakness: ['Fire', 'Fighting', 'Rock', 'Steel'], immune: [] },
    { name: 'Fighting', resists: ['Bug', 'Rock', 'Dark'], weakness: ['Flying', 'Psychic', 'Fairy'], immune: [] },
    { name: 'Poison', resists: ['Grass', 'Fighting', 'Poison', 'Bug', 'Fairy'], weakness: ['Ground', 'Psychic'], immune: [] },
    { name: 'Ground', resists: ['Poison', 'Rock'], weakness: ['Water', 'Ice', 'Grass'], immune: ['Electric'] },
    { name: 'Flying', resists: ['Grass', 'Fighting', 'Bug'], weakness: ['Electric', 'Ice', 'Rock'], immune: ['Ground'] },
    { name: 'Psychic', resists: ['Fighting', 'Psychic'], weakness: ['Bug', 'Ghost', 'Dark'], immune: [] },
    { name: 'Bug', resists: ['Grass', 'Fighting', 'Ground'], weakness: ['Fire', 'Flying', 'Rock'], immune: [] },
    { name: 'Rock', resists: ['Normal', 'Fire', 'Poison', 'Flying'], weakness: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'], immune: [] },
    { name: 'Ghost', resists: ['Poison', 'Bug'], weakness: ['Ghost', 'Dark'], immune: ['Normal', 'Fighting'] },
    { name: 'Dragon', resists: ['Fire', 'Water', 'Electric', 'Grass'], weakness: ['Ice', 'Dragon', 'Fairy'], immune: [] },
    { name: 'Dark', resists: ['Ghost', 'Dark'], weakness: ['Fighting', 'Bug', 'Fairy'], immune: ['Psychic'] },
    { name: 'Steel', resists: ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'], weakness: ['Fire', 'Fighting', 'Ground'], immune: ['Poison'] },
    { name: 'Fairy', resists: ['Fighting', 'Bug', 'Dark'], weakness: ['Poison', 'Steel'], immune: ['Dragon'] }
];
