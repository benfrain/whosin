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
const ioSlatsAreIn = <HTMLElement>document.getElementById("ioSlatsAreIn");
const root = <HTMLHtmlElement>document.documentElement;
const wrapper = <HTMLDivElement>document.querySelector(".io-InOut");
let clickMask;
// console.log(JSON.parse(storage.getItem("players")));
// makeArrayOfStorageItems(JSON.parse(storage.getItem("players")));

class InOut {
    items: Array<Object> = [];
    observers: Array<Object>;
    showingToolTray: Boolean;
    showingInput: Boolean;
    notify: Function;
    addObserver: Function;
    deleteMode: Boolean;
    divisor: number;
    count: number;
    constructor() {
        this.items = [];
        this.observers = [];
        this.showingToolTray = false;
        this.showingInput = false;
        this.divisor = 0;
        this.count = 0;
        this.deleteMode = false;
    }
}

function makePerson(name: string) {
    this.name = name;
    this.paid = false;
    this.marked = false;
    this.team = "";
    this.in = false;
}

var io = new InOut();

InOut.prototype.addObserver = function (observer: Object) {
    this.observers.push(observer);
};

InOut.prototype.notify = function (changes: Object, callback: Function) {
    // Loop through every property in changes and set the data to that new value
    var prop;
    for (prop in changes) {
        // First catch any incorrect assignments of the data
        if (typeof this[prop] == "undefined") {
            console.log("there is no property of name " + prop);
        }
        // We want to exit if the change value is the same as what we already have, otherwise we update the main object with the new one
        if (this[prop] === changes[prop]) {
            continue;
        } else {
            this[prop] = changes[prop];
        }
    }

    // Loop through every observer and check if it matches any of the props in changes
    // Do this by filtering the existing array
    var matchedObservers = this.observers.filter(hasSomeOfTheChangedProps);

    // filter invokes this and returns observers that match into the matchedObservers array
    function hasSomeOfTheChangedProps(item) {
        // If the props contains a wildcard
        if (item.props === "*") {
            return true;
        }
        // Otherwise check if the changed prop is included in the props list
        for (var prop2 in changes) {
            // To ensure we don't quit the entire loop, we want to return true if the prop2 is in item.props. Otherwise we want to keep looping to check each prop and only quit the function by returning once the entire loop has run
            if (item.props.includes(prop2)) {
                return true;
            }
        }
        return false;
    }
    // Now for any observers that care about data that has just been changed we inform them of the changes
    matchedObservers.forEach(function (matchingObserver) {
        matchingObserver.callback.call(null);
    });
};

io.addObserver({
    props: ["*"],
    callback: function observerEverything() {
        console.warn("something changed");
    },
});

io.addObserver({
    props: ["deleteMode"],
    callback: function observerEverything() {
        if (io.deleteMode === true) {
            root.setAttribute("data-io-tools-delete-mode", "true");
            deleteModeClickMask();
        } else {
            root.setAttribute("data-io-tools-delete-mode", "false");
            removeDeleteModeClickMask();
        }
    },
});

function deleteModeClickMask() {
    let deleteMask = document.createElement("div");
    deleteMask.classList.add("io-Slat_DeleteMask");
    itmContainer.appendChild(deleteMask);
    deleteMask.addEventListener("click", function selfRemoveDeleteMask() {
        io.notify({ deleteMode: false });
        removeDeleteModeClickMask();
    });
}

function removeDeleteModeClickMask() {
    let deleteMask = itmContainer.querySelector(".io-Slat_DeleteMask");
    if (deleteMask) {
        itmContainer.removeChild(deleteMask);
    }
}

io.addObserver({
    props: ["showingToolTray"],
    callback: function toggleTools() {
        if (io.showingToolTray === true) {
            root.setAttribute("data-io-tools-exposed", "true");
            createToolsClickMask();
            let btnPosY = (window.innerHeight - ioToolsBtn.getBoundingClientRect().top) + 10;
            let btnPosX = ioToolsBtn.getBoundingClientRect().right;
            root.style.setProperty("--toolsX", `${btnPosX.toString()}px`);
            root.style.setProperty("--toolsY", `${btnPosY.toString()}px`);
        } else {
            root.removeAttribute("data-io-tools-exposed");
            removeToolsClickMask();
        }
    },
});

function createToolsClickMask() {
    clickMask = document.createElement("div");
    clickMask.classList.add("io-Tools_ClickMask");
    clickMask = ioToolsBtn.parentNode.insertBefore(clickMask, ioToolsBtn);
    clickMask.addEventListener("click", function (e) {
        io.notify({ showingToolTray: false });
        removeToolsClickMask();
    });
}

function removeToolsClickMask() {
    if (wrapper.contains(clickMask)) {
        wrapper.removeChild(clickMask);
    }
}

// This function renders the list of items in total each time
io.addObserver({
    props: ["items"],
    callback: function renderItems() {
        // console.table(io.items);

        // clear the container
        itmContainer.innerHTML = "";

        createSlats(io.items);

        // Set the storage
        storage.setItem("players", JSON.stringify(io.items));

        // Set the count
        if (io.count !== countIn(io.items)) {
            root.setAttribute("data-io-count-update", "");
            setTimeout(function () {
                root.removeAttribute("data-io-count-update");
            }, 300);
        } else {
            root.removeAttribute("data-io-count-update");
        }
        io.count = countIn(io.items);

        // Communicate to DOM the count number
        root.setAttribute("data-io-count", io.count);
        ioCount.textContent = io.count.toString();
    },
});

// Count the people who are in
function countIn(items: Array<Object>) {
    var count = items.reduce(function (acc, item, idx) {
        if (item.in === true) {
            acc.push(item);
        }
        return acc;
    }, []);
    return count.length;
}

function rePositionSlat(slat: Element, direction: string) {
    // debugger;
    let moveAmount, indexOfClickedSlat, plusOrMinus;
    let slatGeometry = slat.getBoundingClientRect();
    let heightOfClickedItem = slatGeometry.height;
    let nextItem = slat.nextElementSibling || null;
    let positionOfClickedSlat = slatGeometry.top;

    // Wrap everything up above the clicked item
    let items = document.querySelectorAll(".io-Slat");
    var arr = Array.from(items); // Now it's an Array.

    // Create a container for the items above
    let wrapSlats = document.createElement("div");
    wrapSlats.classList.add("io-Slats_Wrapper");

    // Set the clicked slat to be position fixed;
    slat.style.zIndex = "99";
    slat.style.position = "fixed";
    slat.style.top = positionOfClickedSlat + "px";
    slat.style.backgroundColor = "#f9f9f9";

    if (direction === "up") {
        itmContainer.insertBefore(wrapSlats, itmContainer.firstChild);
        for (let i = 0; i < arr.indexOf(slat); i++) {
            wrapSlats.appendChild(items[i]);
        }
        moveAmount = positionOfClickedSlat - wrapSlats.getBoundingClientRect().top;
        plusOrMinus = "-";
    } else {
        itmContainer.insertBefore(wrapSlats, slat);
        indexOfClickedSlat = arr.indexOf(slat);
        for (let i = indexOfClickedSlat + 1; i < arr.length; i++) {
            wrapSlats.appendChild(items[i]);
        }
        // Move the clicked slat down
        let bottomOfWiSlatsContainer = itmContainer.getBoundingClientRect().bottom;
        let difference = bottomOfWiSlatsContainer - slat.getBoundingClientRect().top;
        moveAmount = difference;
    }

    // If the slat that was clicked has another item after it, add some margin above it to leave space while the clicked slat moves
    if (nextItem !== null) {
        nextItem.style.marginTop = heightOfClickedItem + "px";
    }

    // Determine transition duration
    let duration = moveAmount / 500;
    // We use a ternary operator to use one string or another based upon whether we are moving the slat up or down
    wrapSlats.style.transform = direction === "up" ? `translateY(${heightOfClickedItem}px)` : `translateY(-${heightOfClickedItem}px)`;
    slat.style.transform = direction === "up" ? `translateY(-${moveAmount}px)` : `translateY(${moveAmount}px)`;
    // Set the CSS var for the duration this click should take
    root.style.setProperty("--duration", `${duration.toFixed(2)}s`);
    console.log(duration, direction);
}

function moveEntryInArray(countNo: number, theArray: Array<Object>, endPos) {
    // console.log(countNo, theArray);
    theArray.move(countNo, endPos);
}

// We remove any team affiliation here
function removeTeams() {
    io.items.forEach(item => {
        item.team = "";
    });
}

function createSlats(slats: Array<Object>) {
    slats.forEach(function (item, idx) {
        // The container
        let slat = document.createElement("div");
        slat.classList.add("io-Slat");
        slat.setAttribute("data-idx", idx);
        slat.setAttribute("data-io-slat-in", item.in);
        if (item.team && item.in) {
            slat.setAttribute("data-io-slat-team", item.team);
        }

        // Handle a user being clicked to be 'In'
        slat.addEventListener(
            "click",
            function (e) {
                e.stopPropagation();
                // Fork here depending upon whether item is in or out
                root.setAttribute("data-io-slat-moving", "true");
                if (e.target.getAttribute("data-io-slat-in") === "false") {
                    rePositionSlat(this, "up");
                    this.addEventListener("transitionend", function setItems() {
                        moveEntryInArray(parseFloat(this.getAttribute("data-idx")), io.items, 0);
                        removeTeams();
                        io.notify({ items: setThisItem(item) });
                        this.removeEventListener("transitionend", setItems);
                        root.setAttribute("data-io-slat-moving", "false");
                    });
                } else {
                    rePositionSlat(this, "down");
                    this.addEventListener("transitionend", function returnItems() {
                        moveEntryInArray(parseFloat(this.getAttribute("data-idx")), io.items, io.items.length - 1);
                        removeTeams();
                        io.notify({ items: setThisItem(item) });
                        this.removeEventListener("transitionend", returnItems);
                        root.setAttribute("data-io-slat-moving", "false");
                    });
                }
            },
            false
        );

        // The delete button
        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("io-Slat_Delete");
        slat.appendChild(deleteBtn);
        deleteBtn.addEventListener(
            "click",
            function (e) {
                e.stopPropagation();
                io.notify({ items: removeThisSlat(item) });
            },
            false
        );

        // The text node
        let textNode = document.createElement("p");
        textNode.classList.add("io-Slat_Name");
        textNode.textContent = item.name;
        slat.appendChild(textNode);

        // The action button
        let slatBtn = document.createElement("button");
        slatBtn.classList.add("io-Slat_Action");
        slatBtn.textContent = "paid";
        slat.appendChild(slatBtn);

        itmContainer.appendChild(slat);
    });
}

function setThisItem(slat: Object) {
    var newItems = io.items.map(function (item, idx) {
        if (item.name === slat.name) {
            item.in = !item.in;
        }
        return item;
    });
    // console.table(newItems);
    return newItems;
}

/**
 * Takes a slat as an object and compares it with the objects in the main items. A new array is made with a reduce and the only things allowed in are entries that are not the current slat. This new array is then set to be the items
 * @param {Object} slat A single slat represented as an object
 */
function removeThisSlat(slat: Object) {
    var newItems = io.items.reduce(function (acc: Array<Object>, item: Object, idx: Number) {
        if (item.name !== slat.name) {
            acc.push(item);
        }
        return acc;
    }, []);
    return newItems;
}

// If we have storage of the players then we create an array of them and notify the instance
if (storage.getItem("players")) {
    io.notify({
        items: makeArrayOfStorageItems(JSON.parse(storage.getItem("players"))),
    });
}

// wiAddForm stop the page refreshing by default
ioAddForm.addEventListener(
    "submit",
    function (e) {
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
    io.notify({
        showingToolTray: io.showingToolTray === true ? false : true,
    })
});

// Handles the loading of the JSON file
ioLoad.addEventListener(
    "change",
    function (e) {
        // Note: this was useful http://blog.teamtreehouse.com/reading-files-using-the-html5-filereader-api
        var file = ioLoad.files[0];
        var textType = /json.*/;
        if (file.type.match(textType)) {
            var reader = new FileReader();

            reader.readAsText(file);
            reader.onload = function (e) {
                let loadedJSON = JSON.parse(reader.result);
                console.log(loadedJSON);
                io.notify({ items: loadedJSON });
            };
        } else {
            alert("File type not supported!");
        }
    },
    false
);

function addName() {
    console.log(isNameValid(hdrInput.value));
    if (isNameValid(hdrInput.value) === false) {
        root.setAttribute("data-io-duplicate-name", "");
        ioInputLabel.textContent = "Name already exists";
        // return;
    } else {
        root.removeAttribute("data-io-duplicate-name");
        ioInputLabel.textContent = "Add Name";
        itemAdd(hdrInput.value);
        hdrInput.value = "";
    }
}

// We need a listener for input so we can determine if he input is filled or not
hdrInput.addEventListener(
    "input",
    function (e) {
        e.target.setAttribute("data-io-input", this.value.length > 0 ? "filled" : "empty");
    },
    false
);

function isNameValid(name: string) {
    for (let item of io.items) {
        if (item.name === name) {
            // alert(item.name, name);
            return false;
        }
    }
    return true;
}

function makeArrayOfStorageItems(items: String) {
    let resultantArray = [];
    for (let i = 0; i < items.length; i++) {
        resultantArray.push(items[i]);
    }
    return resultantArray;
}

ioTools.addEventListener(
    "click",
    function (e) {
        if (e.target.id === "ioDeleteMode" || e.target.parentNode.id === "ioDeleteMode") {
            io.notify({ deleteMode: io.deleteMode === true ? false : true });
            io.notify({ showingToolTray: false });

        }
        if (e.target.id === "ioPaidMode" || e.target.parentNode.id === "ioPaidMode") {
            root.setAttribute("data-io-tools-paid-mode", root.getAttribute("data-io-tools-paid-mode") === "true" ? "false" : "true");
            io.notify({ showingToolTray: false });
        }
        if (e.target.id === "ioSave" || e.target.parentNode.id === "ioSave") {
            saveText(JSON.stringify(io.items), "inout.json");
        }
    },
    false
);

ioSplit2.addEventListener("click", function split2ways() {
    splitTeams(2);
    io.notify({ showingToolTray: false });
})

ioSplit3.addEventListener("click", function split3ways() {
    splitTeams(3);
    io.notify({ showingToolTray: false });
})

ioSplit4.addEventListener("click", function split4ways() {
    splitTeams(4);
    io.notify({ showingToolTray: false });
});

function splitTeams(divideBy: number) {
    // Make an array of the people who are in
    let peopleIn = io.items.reduce(function (acc, item, idx) {
        if (item.in === true) {
            acc.push(item);
        }
        return acc;
    }, []);
    // Make an array of the people who are out
    let peopleOut = io.items.reduce(function (acc, item, idx) {
        if (item.in !== true) {
            acc.push(item);
        }
        return acc;
    }, []);
    // Shuffle up the people who are in
    let shuffledArray = shuffleArray(peopleIn);
    // Of the people who are now in and shuffled, split them into teams
    let chunkedAndShuffled = chunkify(shuffledArray, divideBy, true);

    // Now for each team of people
    chunkedAndShuffled.forEach(function (arrayOfSplit, idx) {
        // For each person in each team
        arrayOfSplit.forEach(function (itemInArraySplit) {
            // Set them on their relevant team. Adding one here to give more human friendly team numbers
            itemInArraySplit.team = idx + 1;
        });
    });
    // Now flatten the teams into a single array and then add on the people who are out
    io.notify({ items: flatten(chunkedAndShuffled).concat(peopleOut) });
}

function itemAdd(itemString: string) {
    var newPerson = new makePerson(itemString);
    io.items.push(newPerson);
    io.notify({
        items: io.items,
    });
}



/**
 * Randomize array element order in-place. From: http://stackoverflow.com/a/12646864/1147859
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array: Array<Object>) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/**
 * Create balanced or even arrays. From: http://stackoverflow.com/a/8189268/1147859
 * @param {[Array]} a is the array we want to balance/split
 * @param {[Number]} n is the number we want to split the array by
 * @param {[Boolean]} balanced (subarrays' lengths differ as less as possible) or even (all subarrays but the last have the same length)
 */
function chunkify(a: Array<Object>, n: number, balanced: Boolean) {
    if (n < 2) {
        return [a];
    }
    var len = a.length,
        out = [],
        i = 0,
        size;
    if (len % n === 0) {
        size = Math.floor(len / n);
        while (i < len) {
            out.push(a.slice(i, (i += size)));
        }
    } else if (balanced) {
        while (i < len) {
            size = Math.ceil((len - i) / n--);
            out.push(a.slice(i, (i += size)));
        }
    } else {
        n--;
        size = Math.floor(len / n);
        if (len % size === 0) {
            size--;
        }
        while (i < size * n) {
            out.push(a.slice(i, (i += size)));
        }
        out.push(a.slice(size * n));
    }
    return out;
}

/**
 * Utility to flatten a nested array. From: https://stackoverflow.com/a/15030117/1147859
 * @param {[Array]} arr [An array containing nested arrays]
 */
function flatten(arr: Array<Object>) {
    return arr.reduce(function (flat: Array<Object>, toFlatten: Array<Object>) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

function saveText(text: Array<Object>, filename: string) {
    var a = document.createElement("a");
    a.setAttribute("href", "data:text/plain;charset=utf-u," + encodeURIComponent(text));
    a.setAttribute("download", filename);
    a.click();
}

Array.prototype.move = function (from: number, to: number) {
    this.splice(to, 0, this.splice(from, 1)[0]);
    return this;
};

