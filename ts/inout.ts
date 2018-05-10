/// <reference path="defaultData.ts" />
/// <reference path="splitTeams.ts" />
/// <reference path="deleteOrPaidClickMask.ts" />
/// <reference path="toolsClickMask.ts" />
/// <reference path="repositionSlat.ts" />
/// <reference path="createSlats.ts" />
/// <reference path="utils.ts" />
/// <reference path="removeThisSlat.ts" />
/// <reference path="countIn.ts" />
/// <reference path="loadFile.ts" />
/// <reference path="saveText.ts" />
/// <reference path="observerPattern.ts" />
//// <reference path="eventSwitcher.ts" />

const storage = window.localStorage;
const itmContainer = document.getElementById("itmContainer");
const hdrInputDoneBtn = <HTMLButtonElement>document.getElementById("hdrInputDoneBtn");
const hdrInput = <HTMLInputElement>document.getElementById("hdrInput");
const ioTools = <HTMLElement>document.getElementById("ioTools");
const ioSplitter = <HTMLElement>document.getElementById("ioSplitter");
const ioSplit2 = <HTMLButtonElement>document.getElementById("ioSplit2");
const ioSplit3 = <HTMLButtonElement>document.getElementById("ioSplit3");
const ioSplit4 = <HTMLButtonElement>document.getElementById("ioSplit4");
const ioAddForm = <HTMLFormElement>document.getElementById("ioAddForm");
const ioInputLabel = <HTMLLabelElement>document.getElementById("ioInputLabel");
const ioLoad = <HTMLInputElement>document.getElementById("ioLoad");
const ioCount = <HTMLElement>document.getElementById("ioCount");
const ioToolsBtn = <HTMLButtonElement>document.getElementById("ioToolsBtn");
const ioToolsClose = <HTMLButtonElement>document.getElementById("ioToolsClose");
const ioEventSwitcherTitle = <HTMLHeadingElement>document.getElementById("ioEventSwitcherTitle");
const ioEventSwitcherBtn = document.getElementById("ioEventSwitcherBtn");
const ioAddNameBtn = document.getElementById("ioAddNameBtn");
const ioEventSwitcherDrop = document.getElementById("ioEventSwitcher");
const ioEventSwitcherRosterCount = document.getElementById("ioEventSwitcherRosterCount");

// const ioSlatsAreIn = <HTMLElement>document.getElementById("ioSlatsAreIn");
const root = <HTMLHtmlElement>document.documentElement;
const wrapper = <HTMLDivElement>document.querySelector(".io-InOut");
let clickMask;
// console.log(JSON.parse(storage.getItem("players")));
// makeArrayOfStorageItems(JSON.parse(storage.getItem("players")));

var io = new InOut();

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
            if (io.paidMode === false) {
                removeDeleteOrPaidModeClickMask();
            }
        }
    }
});

// io.addObserver({
//     props: ["paidMode"],
//     callback: function observerEverything() {
//         if (io.paidMode === true) {
//             root.setAttribute("data-io-tools-paid-mode", "true");
//             deleteOrPaidModeClickMask();
//         } else {
//             root.setAttribute("data-io-tools-paid-mode", "false");
//             if (io.deleteMode === false) {
//                 removeDeleteOrPaidModeClickMask();
//             }
//         }
//     }
// });

io.addObserver({
    props: ["showingToolTray"],
    callback: function toggleTools() {
        if (io.showingToolTray === true) {
            root.setAttribute("data-io-tools-exposed", "true");
            createToolsClickMask();
            let btnPosY = window.innerHeight - ioToolsBtn.getBoundingClientRect().top + 10;
            let btnPosX = ioToolsBtn.getBoundingClientRect().right;
            root.style.setProperty("--toolsX", `${btnPosX.toString()}px`);
            root.style.setProperty("--toolsY", `${btnPosY.toString()}px`);
        } else {
            root.removeAttribute("data-io-tools-exposed");
            removeToolsClickMask();
        }
    }
});

// // EventSwitcher.Init();
// Ben activeEvent is a bad idea. You can just use the index of the array item that is selected to know which set of data to send into the createSlats and update etc. Need to remove it from the Observer and refactor. I have made this far more complicated than it should have been!

// This function renders the list of items in total each time
// io.addObserver({
//     props: ["items"],
//     callback: function renderEventSwitcher() {
//         eventSwitcherDrop.innerHTML = "";
//         populateMenu();
//         // let activeEventList = io.items.filter(item => item.Selected);
//         // io.notify({ activeEvent: activeEventList[0].EventData });
//     }
// });

function populateMenu() {
    io.items.forEach((item, idx) => {
        let eventSlat = document.createElement("div");
        eventSlat.classList.add("io-EventLoader_Slat");

        let eventItem = document.createElement("label");
        eventItem.classList.add("io-EventLoader_Item");
        eventItem.htmlFor = `event${idx}`;
        eventItem.textContent = item.EventName;
        eventSlat.appendChild(eventItem);

        let eventRadio = document.createElement("input");
        eventRadio.classList.add("io-EventLoader_Radio");
        eventRadio.type = "radio";
        eventRadio.id = `event${idx}`;
        eventRadio.name = "eventOption";
        eventRadio.value = idx.toString();
        if (item.Selected) {
            eventRadio.checked = true;
            ioEventSwitcherTitle.textContent = item.EventName;
            ioEventSwitcherRosterCount.textContent = item.EventData.length;
        }

        eventRadio.addEventListener("change", function(e) {
            let menuItem = parseFloat(this.value);
            io.items.forEach((item, idx) => {
                if (idx === menuItem) {
                    item.Selected = true;
                } else {
                    item.Selected = false;
                }
            });
            // let activeEventList = io.items.filter(item => item.Selected);
            io.notify({ items: io.items });
        });
        eventSlat.appendChild(eventRadio);

        ioEventSwitcherDrop.appendChild(eventSlat);
    });
    // looks at the data and creates a link for each event, appending it to the menu
    // adds a data attribute or similar to create a unique reference
}

// This function renders the list of items in total each time
io.addObserver({
    props: ["items"],
    callback: function renderItems() {
        ioEventSwitcherDrop.innerHTML = "";
        populateMenu();
        // console.table(io.items);

        // clear the container
        itmContainer.innerHTML = "";

        // Set the storage
        storage.setItem("players", JSON.stringify(io.items));

        // Set the count
        let currentDataSet = io.items.findIndex(item => item.Selected);

        console.log(currentDataSet);
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
    }
});

if (storage.getItem("players")) {
    io.notify({
        items: makeArrayOfStorageItems(JSON.parse(storage.getItem("players")))
    });
} else {
    io.notify({
        items: defaultDataV2
    });
}
// If we have storage of the players, and the array isn't empty then we create an array of them and notify the instance

// if (storage.getItem("players") && storage.getItem("players") !== "[]") {

// function discernActiveEvent() {
//     let
// }

ioAddForm.addEventListener(
    "submit",
    function(e) {
        // stop the page refreshing by default
        e.preventDefault();
        // If nothing has been entered in the text box
        if (hdrInput.value === "") {
            console.warn("nothing entered");
            return;
        }
        // Otherwise, add the name
        addName();
    },
    false
);

ioToolsBtn.addEventListener("click", e => {
    e.target.setAttribute("aria-selected", "true");
    setTimeout(fire => {
        e.target.removeAttribute("aria-selected");
    }, 200);
    io.notify({
        showingToolTray: io.showingToolTray === true ? false : true
    });
});

// Handles the loading of the JSON file
ioLoad.addEventListener("change", loadFile, false);

// We need a listener for input so we can determine if he input is filled or not
hdrInput.addEventListener(
    "input",
    function(e) {
        e.target.setAttribute("data-io-input", this.value.length > 0 ? "filled" : "empty");
    },
    false
);

ioTools.addEventListener(
    "click",
    function(e) {
        if (e.target.id === "ioDeleteMode" || e.target.parentNode.id === "ioDeleteMode") {
            io.notify({ paidMode: false });
            io.notify({ deleteMode: io.deleteMode === true ? false : true });
            io.notify({ showingToolTray: false });
        }
        if (e.target.id === "ioPaidMode" || e.target.parentNode.id === "ioPaidMode") {
            // root.setAttribute("data-io-tools-paid-mode", root.getAttribute("data-io-tools-paid-mode") === "true" ? "false" : "true");
            io.notify({ paidMode: io.paidMode === true ? false : true });
            io.notify({ deleteMode: false });
            io.notify({ showingToolTray: false });
        }
        if (e.target.id === "ioSave" || e.target.parentNode.id === "ioSave") {
            io.notify({ deleteMode: false, paidMode: false });
            saveText(JSON.stringify(io.items), "inout.json");
        }
    },
    false
);

ioSplit2.addEventListener("click", function split2ways() {
    splitTeams(2);
    io.notify({ showingToolTray: false });
});

ioSplit3.addEventListener("click", function split3ways() {
    splitTeams(3);
    io.notify({ showingToolTray: false });
});

ioSplit4.addEventListener("click", function split4ways() {
    splitTeams(4);
    io.notify({ showingToolTray: false });
});

function itemAdd(itemString: string) {
    var newPerson = new makePerson(itemString);
    io.activeEvent.push(newPerson);
    io.notify({
        activeEvent: io.activeEvent
    });
}

function isNameValid(name: string) {
    for (let item of io.activeEvent) {
        if (item.name === name) {
            return false;
        }
    }
    return true;
}

function addName() {
    if (isNameValid(hdrInput.value) === false) {
        root.setAttribute("data-io-duplicate-name", "");
        ioInputLabel.textContent = "Name already exists";
    } else {
        root.removeAttribute("data-io-duplicate-name");
        ioInputLabel.textContent = "Add Name";
        itemAdd(hdrInput.value);
        hdrInput.value = "";
    }
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
    console.log(newItems);
    return newItems;
}
