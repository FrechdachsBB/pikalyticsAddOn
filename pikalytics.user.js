// ==UserScript==
// @name         New Userscript
// @namespace    https://github.com/FrechdachsBB/
// @version      2024-08-01
// @description  try to take over the world!
// @author       FrechdachsBB
// @match        https://pikalytics.com/** */
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pikalytics.com
// @grant        none
// @require      https://code.jquery.com/jquery-3.7.1.js
// @require      https://unpkg.com/pokeapi-js-wrapper/dist/index.js
// @run-at       document-end
// ==/UserScript==


(function () {

    const P = new Pokedex.Pokedex()
    let ignoreDomChange = false;

    setTimeout(function () {
        //addOverlay($('h1'))
        act();
        monitorDomChanges();
        /*P.getItemByName("choice-scarf")
            .then(function (response) {
                console.log(response)
            })*/
        console.log("Script loaded!");





    }, 1000)

    function act() {
        console.log("ACT!")
        ignoreDomChange = true;
        setTimeout(function(){
            addItemOverlays();
            addMoveOverlays();
            addAbilityOverlays();
            setTimeout(function () { ignoreDomChange = false }, 500)
        }, 1000)
    }

    function onDomChange() {
        if (!ignoreDomChange) {
            act();
        }
    }

    // Funktion zur Überwachung von DOM-Änderungen
    function monitorDomChanges() {
        const observer = new MutationObserver(function (mutationsList) {
            // Überprüfe alle Mutationen
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList') {
                    onDomChange();
                }
            });
        });

        // Beobachte Änderungen am gesamten Body
        observer.observe(document.body, { childList: true, subtree: true });
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

                    let effect = response.effect_entries[0].short_effect;
                    let content = document.createElement("span")
                    content.innerText = effect;
                    addOverlay(target, content)
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
                   
                    
                    let effect = response.effect_entries[0]?.short_effect;
                    effect = effect ? effect : "Keine Kurzbescheibung verfügbar"

                    let acc = response.accuracy
                    let pow = response.power

                    let content = document.createElement("div")
                    let table = document.createElement("table")
                    let tr1 = document.createElement("tr")
                    let tr2 = document.createElement("tr")
                    let td11 = document.createElement("td")
                    let td12 = document.createElement("td")
                    let td13 = document.createElement("td")
                    let td21 = document.createElement("td")

                    td11.innerText = ("ACC: ") + (acc ? acc : "-");
                    td12.innerText = ("POW: ") + (pow ? pow : "-");
                    td13.innerText = dmgClass;
                    td21.innerText = effect;
                    td21.colSpan = 3

                    tr1.appendChild(td11);
                    tr1.appendChild(td12);
                    tr1.appendChild(td13);
                    tr2.appendChild(td21);
                    table.appendChild(tr1);
                    table.appendChild(tr2);
                    content.appendChild(table);

                    table.style.fontSize = "15px"

                    addOverlay(target, content, 0, -120);
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
                    console.log(response)
                    let effect = response.effect_entries[0].short_effect;
                    let content = document.createElement("span")
                    content.innerText = effect;
                    addOverlay(target, content)
                })
        })
    }

    function transformPokedexName(text) {
        text = text.toLowerCase()
        text = text.replace(" ", "-")
        return text;
    }

    function addOverlay(target, content, offSetX = 0, offSetY = -25) {
        let box = document.createElement("div");
        //box.appendChild(overlay);
        box.style.position = 'fixed'; // Fixierte Position auf dem Bildschirm
        box.style.backgroundColor = 'rgba(20, 20, 20)'; // Halbtransparentes Schwarz
        box.style.border = '2px solid darkgray'; // Beispiel für einen Rand
        box.style.borderRadius = '5px'; // Abgerundete Ecken
        box.style.padding = '4px 10px'
        box.style.zIndex = '9999'; // Hoch genug, damit es über anderen Elementen liegt
        box.style.pointerEvents = 'none'; // Verhindert, dass das Overlay Mausklicks blockiert
        //box.style.transform = "translate(-100%, -100%)";
        box.style.color = 'white';
        box.style.fontSize = "15px"

        box.appendChild(content);
        target.on('mouseover', function (event) {

            //box.style.left = `${event.clientX}px`; // 10px Abstand vom Cursor
            //box.style.top = `${event.clientY - 20}px`;  // 10px Abstand vom Cursor
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




})();



