/// <reference path="defaultData.ts" />
/// <reference path="splitTeams.ts" />
/// <reference path="deleteOrPaidClickMask.ts" />
/// <reference path="repositionSlat.ts" />
/// <reference path="createSlats.ts" />
/// <reference path="utils.ts" />
/// <reference path="countIn.ts" />
/// <reference path="loadFile.ts" />
/// <reference path="saveText.ts" />
/// <reference path="observerPattern.ts" />
/// <reference path="onBoard.ts" />
//// <reference path="eventSwitcher.ts" />

const storage = window.localStorage;
const itmContainer = document.getElementById("itmContainer");
const itmConfirmedContainer = document.getElementById("itmConfirmedContainer");
const itmUnConfirmedContainer = document.getElementById("itmUnConfirmedContainer");
const ioHeaderUnConfirmed = document.getElementById("ioHeaderUnConfirmed");

const ioTools = <HTMLElement>document.getElementById("ioTools");
// const ioSplitter = <HTMLElement>document.getElementById("ioSplitter");
const ioSplitBar = <HTMLElement>document.getElementById("ioSplitBar");
const ioSplit0 = <HTMLButtonElement>document.getElementById("ioSplit0");
const ioSplit2 = <HTMLButtonElement>document.getElementById("ioSplit2");
const ioSplit3 = <HTMLButtonElement>document.getElementById("ioSplit3");
const ioSplit4 = <HTMLButtonElement>document.getElementById("ioSplit4");
const ioAddForm = <HTMLFormElement>document.getElementById("ioAddForm");
const ioInputLabel = <HTMLLabelElement>document.getElementById("ioInputLabel");
const ioLoad = <HTMLButtonElement>document.getElementById("ioLoad");
const ioSave = <HTMLButtonElement>document.getElementById("ioSave");
const ioCount = <HTMLElement>document.getElementById("ioCount");
const ioUnconfirmedCount = <HTMLSpanElement>document.getElementById("ioUnconfirmedCount");
const ioLoadSaveBtn = <HTMLButtonElement>document.getElementById("ioLoadSaveBtn");
// const ioToolsBtn = <HTMLButtonElement>document.getElementById("ioToolsBtn");
// const ioToolsClose = <HTMLButtonElement>document.getElementById("ioToolsClose");
const ioEventSwitcherTitle = <HTMLHeadingElement>document.getElementById("ioEventSwitcherTitle");
const ioEventSwitcherBtn = document.getElementById("ioEventSwitcherBtn");
const ioAddNameBtn = document.getElementById("ioAddNameBtn");
const ioEventSwitcher = document.getElementById("ioEventSwitcher");
const ioEventSwitcherRosterCount = document.getElementById("ioEventSwitcherRosterCount");
const ioEventLoaderEditBtn = document.getElementById("ioEventLoaderEditBtn");
const ioEventLoaderAddEventBtn = document.getElementById("ioEventLoaderAddEventBtn");
const ioEventLoaderSaveBtn = document.getElementById("ioEventLoaderSaveBtn");
const ioEventLoaderCancelBtn = document.getElementById("ioEventLoaderCancelBtn");

const ioEditBarPlayersBtn = document.getElementById("ioEditBarPlayersBtn");
const ioEditBarSplitTeamsBtn = document.getElementById("ioEditBarSplitTeamsBtn");
const ioEditBarSaveBtn = document.getElementById("ioEditBarSaveBtn");
const ioEditBarCancelBtn = document.getElementById("ioEditBarCancelBtn");
const ioEditBarAddBtn = document.getElementById("ioEditBarAddBtn");
const allInHeader = document.querySelector(".io-Slats_ConfirmedHeader");
const allOutHeader = document.querySelector(".io-Slats_UnConfirmedHeader");

const root = <HTMLHtmlElement>document.documentElement;
const wrapper = <HTMLDivElement>document.querySelector(".io-InOut");
let clickMask;
let editingEvents = false;
let editingPlayers = false;
const eventsToDelete: Array<number> = [];
const playersToDelete: Array<number> = [];

var io = new InOut();

ioEventSwitcherBtn.addEventListener("click", function(e) {
    root.setAttribute(
        "data-evswitcher-showing",
        root.getAttribute("data-evswitcher-showing") === "true" ? "false" : "true"
    );
    if (editingPlayers) {
        stopEditingPlayers();
    }
    createClickMask(e.target, "data-evswitcher-showing");
});

ioEditBarAddBtn.addEventListener("click", e => {
    addTempPlayer();
});

function addTempPlayer() {
    let existingTemp = document.querySelector(".io-Slat_Temp");
    if (existingTemp) {
        return;
    }
    let firstExistingSlat = document.querySelector(`.io-Slat:first-child`);

    let tempPlayer = document.createElement("div");
    tempPlayer.classList.add("io-Slat", "io-Slat_Temp");
    tempPlayer.setAttribute("data-io-slat-in", "true");
    tempPlayer.addEventListener("click", function(e) {
        if (e.target.classList.contains("io-Slat_Name")) {
            return;
        } else {
            setEndOfContenteditable(e.target.querySelector(".io-Slat_Name"));
        }
    });

    let tempPlayerName = document.createElement("p");
    tempPlayerName.classList.add("io-Slat_Name");
    let tempName = randomName();
    tempPlayerName.textContent = tempName;
    tempPlayerName.setAttribute("contenteditable", "true");
    tempPlayer.appendChild(tempPlayerName);

    let warning = document.createElement("div");
    warning.classList.add("io-Slat_AddWarning");
    warning.textContent = `Name already exists. Please choose a unique name.`;
    tempPlayer.appendChild(warning);

    itmContainer.insertBefore(tempPlayer, firstExistingSlat);
    root.setAttribute("data-adding-player", "true");
}

ioEditBarSplitTeamsBtn.addEventListener("click", function(e) {
    if (root.getAttribute("data-splitteam-showing") === "false") {
        createClickMask(ioEditBarSplitTeamsBtn, "data-splitteam-showing");
    }
    root.setAttribute(
        "data-splitteam-showing",
        root.getAttribute("data-splitteam-showing") === "true" ? "false" : "true"
    );
});

function createClickMask(triggerElement, dataAttrb: string) {
    let deleteMask = document.createElement("div");
    deleteMask.classList.add("io-ClickMask");
    triggerElement.parentNode.insertBefore(deleteMask, triggerElement);
    deleteMask.addEventListener("touchstart", function selfRemoveDeleteMask(e) {
        // Without preventDefault touchstart would lead to a click and the menu would re-open
        e.preventDefault();
        deleteMask.parentNode.removeChild(deleteMask);
        root.setAttribute(dataAttrb, "false");
        stopEditingEvents();
        cancelEventChanges();
    });
}

ioEventLoaderEditBtn.addEventListener("click", function(e) {
    root.setAttribute("data-editing-events", "true");
    let eventName = document.querySelectorAll(".io-EventLoader_EventName");
    eventName.forEach(name => {
        name.setAttribute("contenteditable", "true");
        name.parentElement.htmlFor = "";
        // Let a tap in the middle of the name select accordingly, else select the end of the string
    });
    editingEvents = !editingEvents;
});

ioEditBarPlayersBtn.addEventListener("click", e => {
    root.setAttribute("data-editing-players", "true");
    let slatNames = document.querySelectorAll(".io-Slat_Name");
    slatNames.forEach(slatName => {
        slatName.setAttribute("contenteditable", "true");
    });
    editingPlayers = true;
});

ioEditBarCancelBtn.addEventListener("click", function(e) {
    stopEditingPlayers();
});

function stopEditingEvents() {
    root.removeAttribute("data-editing-events");
    editingEvents = false;
    let eventLabels = document.querySelectorAll(".io-EventLoader_Item");
    eventLabels.forEach((label, idx) => {
        label.setAttribute("contenteditable", "false");
        label.htmlFor = `event${idx}`;
    });
}

function stopEditingPlayers() {
    let addedPlayer = document.querySelector(".io-Slat_Temp");
    if (addedPlayer) {
        root.removeAttribute("data-adding-player");
        addedPlayer.parentNode.removeChild(addedPlayer);
    }
    root.removeAttribute("data-editing-players");
    editingPlayers = false;
    let slats = document.querySelectorAll(".io-Slat_Name");
    slats.forEach((slat, idx) => {
        slat.setAttribute("contenteditable", "false");
        slat.parentElement.classList.remove("io-Slat_DeleteSlat");
    });
}

ioEventLoaderSaveBtn.addEventListener("click", function(e) {
    stopEditingEvents();
    addTempEvent();
    updateEventNames();
    removeDeletedEvents();
});

function removeDeletedEvents() {
    var newEvents = io.items.reduce(function(acc: Array<Object>, item: Object, idx: Number) {
        if (!eventsToDelete.includes(idx)) {
            acc.push(item);
        }
        return acc;
    }, []);
    // If there are no events left, empty everything and set a new untitled event
    if (newEvents.length === 0) {
        io.items.length = 0;
        io.items[0] = {
            EventName: "Untitled Event",
            Selected: true,
            EventData: []
        };
    } else {
        io.items = newEvents;
    }
    io.notify({ items: io.items });
    // Now we have remove the events, empty the array
    eventsToDelete.length = 0;
}

function addTempEvent() {
    let tempSlatName = document.querySelector(".io-EventLoader_TempSlat");
    editingEvents = false;
    if (!tempSlatName) {
        return;
    }
    let newEvent = {
        EventName: tempSlatName.textContent,
        Selected: false,
        EventData: []
    };
    io.items.push(newEvent);
    io.notify({ items: io.items });
}

function updateEventNames() {
    let eventLabels = document.querySelectorAll(".io-EventLoader_Item");
    eventLabels.forEach((label, idx) => {
        io.items[idx].EventName = label.textContent;
        io.notify({ items: io.items });
    });
}

ioEditBarSaveBtn.addEventListener("click", function(e) {
    updateEventPlayers();
});

var duplicateCheck;
function updateEventPlayers() {
    let addedPlayer = document.querySelector(".io-Slat_Temp p");
    if (addedPlayer) {
        let newName = addedPlayer.textContent;
        isNameValid(newName);
        if (duplicateCheck === true) {
            return;
        }
        if (isNameValid(newName) === false) {
            root.setAttribute("data-io-duplicate-name", "true");
            duplicateCheck = true;
            setTimeout(e => {
                root.removeAttribute("data-io-duplicate-name");
                duplicateCheck = false;
            }, 3000);
            return;
        } else {
            root.removeAttribute("data-io-duplicate-name");
            itemAdd(newName);
            root.setAttribute("data-adding-player", "false");
        }
    }
    let eventPlayers = document.querySelectorAll(".io-Slat_Name");
    let currentDataSet = getCurrentDataSet();
    // Set the saved data to matched the text as changed by the user
    io.items[currentDataSet].EventData.forEach((player, idx) => {
        player.name = eventPlayers[idx].textContent;
    });

    var newItems = io.items[currentDataSet].EventData.reduce(function(
        acc: Array<Object>,
        item: Object,
        idx: Number
    ) {
        if (!playersToDelete.includes(idx)) {
            acc.push(item);
        }
        return acc;
    },
    []);
    io.items[currentDataSet].EventData = newItems;

    io.notify({ items: io.items });
    stopEditingPlayers();
    removeSplits();
    // Now we have removed the players, empty the Array
    playersToDelete.length = 0;
}

function cancelEventChanges() {
    // If we have selected any items to delete we want to undo that
    eventsToDelete.length = 0;

    // Remove any temp slats
    let tempSlat = ioEventSwitcher.querySelectorAll(".io-EventLoader_TempSlat");
    if (tempSlat) {
        tempSlat.forEach(item => {
            ioEventSwitcher.removeChild(item);
        });
    }

    // Remove any marked to delete slats
    let delSlat = ioEventSwitcher.querySelectorAll(".io-EventLoader_DeleteSlat");
    if (delSlat) {
        delSlat.forEach(item => {
            item.classList.remove("io-EventLoader_DeleteSlat");
        });
    }

    // This resets the event names to whatever they were before
    let eventItems = document.querySelectorAll(".io-EventLoader_EventName");
    eventItems.forEach((item, idx) => {
        item.textContent = io.items[idx].EventName;
        item.setAttribute("contenteditable", "false");
    });
}

ioEventLoaderCancelBtn.addEventListener("click", function(e) {
    stopEditingEvents();
    cancelEventChanges();
});

ioEventLoaderAddEventBtn.addEventListener("click", function(e) {
    root.setAttribute("data-editing-events", "true");
    let eventSlat = document.createElement("div");
    eventSlat.classList.add("io-EventLoader_Slat", "io-EventLoader_TempSlat");

    let eventItem = document.createElement("label");
    eventItem.classList.add("io-EventLoader_Item");
    eventItem.addEventListener("click", function(evt) {
        if (evt.target.classList.contains("io-EventLoader_EventName")) {
            return;
        } else {
            setEndOfContenteditable(evt.target.querySelector(".io-EventLoader_EventName"));
        }
    });
    let eventName = document.createElement("span");
    eventName.classList.add("io-EventLoader_EventName");
    eventName.textContent = "Untitled Event";
    eventName.setAttribute("contenteditable", "true");
    eventItem.appendChild(eventName);

    eventSlat.appendChild(eventItem);

    let eventRadio = document.createElement("input");
    eventRadio.classList.add("io-EventLoader_Radio");
    eventRadio.type = "radio";
    eventRadio.name = "eventOption";
    eventSlat.appendChild(eventRadio);
    ioEventSwitcher.appendChild(eventSlat);
});

function closeEventSwitcherDrop() {
    root.setAttribute("data-evswitcher-showing", "false");
}

io.addObserver({
    props: ["*"],
    callback: function observerEverything() {
        console.warn("something changed");
    }
});

io.addObserver({
    props: ["deleteMode"],
    callback: function observerEverything() {
        if (io.deleteMode === true) {
            root.setAttribute("data-io-tools-delete-mode", "true");
            deleteOrPaidModeClickMask();
        } else {
            root.setAttribute("data-io-tools-delete-mode", "false");
        }
    }
});

io.addObserver({
    props: ["showingToolTray"],
    callback: function toggleTools() {
        if (io.showingToolTray === true) {
        } else {
            root.removeAttribute("data-io-tools-exposed");
            root.setAttribute("data-splitteam-showing", "false");
        }
    }
});

function populateMenu() {
    io.items.forEach((item, idx) => {
        let eventSlat = document.createElement("div");
        eventSlat.classList.add("io-EventLoader_Slat");

        let eventItem = document.createElement("label");
        eventItem.classList.add("io-EventLoader_Item");
        eventItem.htmlFor = `event${idx}`;
        eventSlat.appendChild(eventItem);

        let eventName = document.createElement("span");
        eventName.classList.add("io-EventLoader_EventName");
        eventName.textContent = item.EventName;
        eventItem.appendChild(eventName);

        eventItem.addEventListener("click", function(e) {
            if (e.target.classList.contains("io-EventLoader_EventName")) {
                return;
            } else {
                setEndOfContenteditable(e.target.querySelector(".io-EventLoader_EventName"));
            }
        });

        let eventRadio = document.createElement("input");
        eventRadio.classList.add("io-EventLoader_Radio");
        eventRadio.type = "radio";
        eventRadio.id = `event${idx}`;
        eventRadio.name = "eventOption";
        eventRadio.value = idx.toString();

        let deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.classList.add("io-EventLoader_DeleteBtn");
        deleteBtn.id = `delete_event${idx}`;
        eventSlat.appendChild(deleteBtn);

        deleteBtn.addEventListener("click", function removeEVent(e) {
            this.parentElement.classList.add("io-EventLoader_DeleteSlat");
            eventsToDelete.push(idx);
        });

        if (item.Selected) {
            eventRadio.checked = true;
            ioEventSwitcherTitle.textContent = item.EventName;
        }

        eventRadio.addEventListener("click", function(e) {
            if (editingEvents) {
                return;
            }
            let menuItem = parseFloat(this.value);
            io.items.forEach((item, idx) => {
                if (idx === menuItem) {
                    item.Selected = true;
                } else {
                    item.Selected = false;
                }
            });
            root.setAttribute("data-loading-slats", "true");
            io.notify({ items: io.items });
            stopEditingEvents();
            closeEventSwitcherDrop();
            removeStandardClickMask();
        });
        eventSlat.appendChild(eventRadio);

        ioEventSwitcher.appendChild(eventSlat);
    });
}

// This function renders the list of items in total each time
io.addObserver({
    props: ["items"],
    callback: function renderItems() {
        ioEventSwitcher.innerHTML = "";
        populateMenu();
        // console.table(io.items);
        let allSlats = document.querySelectorAll(".io-Slat");
        allSlats.forEach(slat => {
            itmContainer.removeChild(slat);
        });
        ioSplitBar.style = "";
        ioHeaderUnConfirmed.style = "";

        // Set the storage
        storage.setItem("players", JSON.stringify(io.items));

        let currentDataSet = io.items.findIndex(item => item.Selected);
        createSlats(io.items[currentDataSet].EventData, currentDataSet);
        if (io.count !== countIn(io.items)) {
            root.setAttribute("data-io-count-update", "");
            setTimeout(function() {
                root.removeAttribute("data-io-count-update");
            }, 300);
        } else {
            root.removeAttribute("data-io-count-update");
        }
        io.count = countIn(io.items[currentDataSet].EventData);

        // Communicate to DOM the count number
        root.setAttribute("data-io-count", io.count.toString());
        ioCount.textContent = io.count.toString();
        ioUnconfirmedCount.textContent = (
            io.items[currentDataSet].EventData.length - io.count
        ).toString();
    }
});

if (storage.getItem("players")) {
    io.notify({
        items: makeArrayOfStorageItems(JSON.parse(storage.getItem("players")))
    });
}

ioLoadSaveBtn.addEventListener("click", function(e) {
    if (root.getAttribute("data-toolsmenu-showing") === "false") {
        createClickMask(ioLoadSaveBtn, "data-toolsmenu-showing");
    }
    root.setAttribute(
        "data-toolsmenu-showing",
        root.getAttribute("data-toolsmenu-showing") === "true" ? "false" : "true"
    );
});

// Handles the loading of the JSON file
ioLoad.addEventListener("change", loadFile, false);

ioSave.addEventListener("click", function(e) {
    io.notify({ deleteMode: false });
    saveText(JSON.stringify(io.items), "inout.json");
});

ioSave.addEventListener("click", function(e) {
    io.notify({ deleteMode: false, paidMode: false });
    saveText(JSON.stringify(io.items), "inout.json");
});

function removeSplits() {
    let currentDataSet = getCurrentDataSet();
    io.items[currentDataSet].EventData.forEach((player: object, idx: number) => {
        player.team = "";
        let playerInDom = document.querySelector(`.io-Slat[data-idx="${idx}"]`);
        playerInDom.removeAttribute("data-io-slat-team");
    });
    io.notify({ items: io.items });
}

ioSplit0.addEventListener("click", function split2ways() {
    removeSplits();
    root.setAttribute("data-splitteam-showing", "false");
    removeStandardClickMask();
});

ioSplit2.addEventListener("click", function split2ways() {
    let currentDataSet = getCurrentDataSet();
    splitTeams(2, currentDataSet);
    // io.notify({ showingToolTray: false });
    root.setAttribute("data-splitteam-showing", "false");
    removeStandardClickMask();
});

ioSplit3.addEventListener("click", function split3ways() {
    let currentDataSet = getCurrentDataSet();
    splitTeams(3, currentDataSet);
    // io.notify({ showingToolTray: false });
    root.setAttribute("data-splitteam-showing", "false");
    removeStandardClickMask();
});

ioSplit4.addEventListener("click", function split4ways() {
    let currentDataSet = getCurrentDataSet();
    splitTeams(4, currentDataSet);
    // io.notify({ showingToolTray: false });
    root.setAttribute("data-splitteam-showing", "false");
    removeStandardClickMask();
});

function removeStandardClickMask() {
    let clickMaskPresent = document.querySelector(".io-ClickMask");
    if (clickMaskPresent) {
        clickMaskPresent.parentNode.removeChild(clickMaskPresent);
    }
}

function itemAdd(itemString: string) {
    let currentDataSet = getCurrentDataSet();
    var newPerson = new makePerson(itemString);
    io.items[currentDataSet].EventData.splice(0, 0, newPerson);
    io.notify({
        items: io.items
    });
}

function isNameValid(name: string) {
    let currentDataSet = getCurrentDataSet();
    for (let item of io.items[currentDataSet].EventData) {
        if (item.name === name) {
            return false;
        }
    }
    return true;
}

// We remove any team affiliation here
function removeTeams(currentDataSet) {
    io.items[currentDataSet].EventData.forEach(participant => {
        participant.team = "";
    });
}

function setThisItem(slat: Object, currentDataSet) {
    var newItems = io.items[currentDataSet].EventData.map(function(participant, idx) {
        if (participant.name === slat.name) {
            participant.in = !participant.in;
        }
        return participant;
    });
    // console.log(newItems);
    return newItems;
}

function getCurrentDataSet() {
    return io.items.findIndex(item => item.Selected);
}

function randomName() {
    let names = [
        "Humpty Dumpty",
        "Santa Claus",
        "Homer Simpson",
        "Floella Benjamin",
        "Melvin Udall",
        "Lieutenant Colonel Frank Slade"
    ];
    let choice = Math.floor(Math.random() * Math.floor(names.length));
    return names[choice];
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("/sw.js").then(
            function(registration) {
                // Registration was successful
                console.log(
                    "ServiceWorker registration successful with scope: ",
                    registration.scope
                );
            },
            function(err) {
                // registration failed :(
                console.log("ServiceWorker registration failed: ", err);
            }
        );
    });
}
