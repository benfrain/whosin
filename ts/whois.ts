const storage = window.localStorage;
const itmContainer = document.getElementById("itmContainer");
const hdrInputDoneBtn = <HTMLButtonElement>document.getElementById("hdrInputDoneBtn");
const hdrInput = <HTMLInputElement>document.getElementById("hdrInput");
const wiTools = <HTMLElement>document.getElementById("wiTools");
const wiSplitter = <HTMLElement>document.getElementById("wiSplitter");
const wiAddForm = <HTMLFormElement>document.getElementById("wiAddForm");
const wiInputLabel = <HTMLLabelElement>document.getElementById("wiInputLabel");
const wiLoad = <HTMLInputElement>document.getElementById("wiLoad");
const wiCount = <HTMLElement>document.getElementById("wiCount");
const wiToolsBtn = <HTMLButtonElement>document.getElementById("wiToolsBtn");
const wiToolsClose = <HTMLButtonElement>document.getElementById("wiToolsClose");
const wiSlatsAreIn = <HTMLElement>document.getElementById("wiSlatsAreIn");
// console.log(JSON.parse(storage.getItem("players")));
// makeArrayOfStorageItems(JSON.parse(storage.getItem("players")));

class Whois {
    items: Array<Object> = [];
    observers: Array<Object>;
    showingToolTray: Boolean;
    showingInput: Boolean;
    notify: Function;
    addObserver: Function;
    divisor: number;
    count: number;
    constructor() {
        this.items = [];
        this.observers = [];
        this.showingToolTray = false;
        this.showingInput = false;
        this.divisor = 0;
        this.count = 0;
    }
}

function makePerson(name: string) {
    this.name = name;
    this.paid = false;
    this.marked = false;
    this.team = "";
    this.in = false;
}

var wi = new Whois();

Whois.prototype.addObserver = function(observer: Object) {
    this.observers.push(observer);
};

Whois.prototype.notify = function(changes: Object, callback: Function) {
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
    matchedObservers.forEach(function(matchingObserver) {
        matchingObserver.callback.call(null);
    });
};

wi.addObserver({
    props: ["*"],
    callback: function observerEverything() {
        console.warn("something changed");
    },
});

// This function renders the list of items in total each time
wi.addObserver({
    props: ["items"],
    callback: function renderItems() {
        console.log("running items observer");
        console.log(wi.items);

        // clear the container
        itmContainer.innerHTML = "";

        createSlats(wi.items);

        // Set the storage
        storage.setItem("players", JSON.stringify(wi.items));

        // Set the count
        if (wi.count !== countIn(wi.items)) {
            document.body.setAttribute("data-wi-count-update", "");
            setTimeout(function() {
                document.body.removeAttribute("data-wi-count-update");
            }, 300);
        } else {
            document.body.removeAttribute("data-wi-count-update");
        }
        wi.count = countIn(wi.items);

        // Communicate to DOM the count number
        document.body.setAttribute("data-wi-count", wi.count);
        wiCount.textContent = wi.count.toString();
    },
});

// Count the people who are in
function countIn(items: Array<Object>) {
    var count = items.reduce(function(acc, item, idx) {
        if (item.in === true) {
            acc.push(item);
        }
        return acc;
    }, []);
    return count.length;
}

function moveSlats(slat: Element) {
    let heightOfClickedItem = slat.getBoundingClientRect().height;
    let nextItem = slat.nextElementSibling || null;
    let positionOfClickedSlat = slat.offsetTop;

    // Create a container for the items that are in
    let wrapSlats = document.createElement("div");
    wrapSlats.classList.add("wi-Slats_Wrapper");
    itmContainer.insertBefore(wrapSlats, itmContainer.firstChild);

    // Wrap everything up above the clicked item
    let items = document.querySelectorAll(".wi-Slat");
    var arr = Array.prototype.slice.call(items); // Now it's an Array.
    console.log(arr.indexOf(slat));

    for (let i = 0; i < arr.indexOf(slat); i++) {
        wrapSlats.appendChild(items[i]);
    }

    // Set the clicked slat to be position fixed;
    slat.style.position = "absolute";
    slat.style.top = positionOfClickedSlat + "px";
    slat.style.backgroundColor = "#f9f9f9";

    // Move the clicked slat up
    let moveAmount = positionOfClickedSlat + "px";
    slat.style.transform = `translateY(-${moveAmount})`;

    // Move the 'in' container
    wrapSlats.style.transition = `transform .2s`;
    setTimeout(function() {
        wrapSlats.style.transform = `translateY(${heightOfClickedItem}px)`;
    }, 5);

    // If the slat that was clicked has another item after it, add some margin above it to leave space while the clicked slat moves
    if (nextItem !== null) {
        nextItem.style.marginTop = heightOfClickedItem + "px";
    }
}

function moveEntryInArray(countNo: number, theArray: Array<Object>) {
    console.log(countNo, theArray);
    theArray.move(countNo, 0);
}

function createSlats(slats: Array<Object>) {
    slats.forEach(function(item, idx) {
        // The container
        let slat = document.createElement("div");
        slat.classList.add("wi-Slat");
        slat.setAttribute("data-idx", idx);
        slat.setAttribute("data-wi-slat-in", item.in);
        if (item.team && item.in) {
            slat.setAttribute("data-wi-slat-team", item.team);
        }

        // Handle a user being clicked to be 'In'
        slat.addEventListener(
            "click",
            function(e) {
                e.stopPropagation();
                moveSlats(this);
                this.addEventListener("transitionend", function setItems() {
                    console.log(this);
                    moveEntryInArray(parseFloat(this.getAttribute("data-idx")), wi.items);

                    wi.notify({ items: setThisItem(item) });

                    this.removeEventListener("transitionend", setItems);
                });
            },
            false
        );

        // The delete button
        let deleteBtn = document.createElement("button");
        deleteBtn.classList.add("wi-Slat_Delete");
        deleteBtn.textContent = "X";
        slat.appendChild(deleteBtn);
        deleteBtn.addEventListener(
            "click",
            function(e) {
                e.stopPropagation();
                wi.notify({ items: removeThisSlat(item) });
            },
            false
        );

        // The text node
        let textNode = document.createElement("p");
        textNode.classList.add("wi-Slat_Name");
        textNode.textContent = item.name;
        slat.appendChild(textNode);

        // The action button
        let slatBtn = document.createElement("button");
        slatBtn.classList.add("wi-Slat_Action");
        slatBtn.textContent = "paid";
        slat.appendChild(slatBtn);

        itmContainer.appendChild(slat);
    });
}

function setThisItem(slat: Object) {
    var newItems = wi.items.map(function(item, idx) {
        if (item.name === slat.name) {
            item.in = !item.in;
        }
        return item;
    });
    console.table(newItems);
    return newItems;
}

/**
 * Takes a slat as an object and compares it with the objects in the main items. A new array is made with a reduce and the only things allowed in are entries that are not the current slat. This new array is then set to be the items
 * @param {Object} slat A single slat represented as an object
 */
function removeThisSlat(slat: Object) {
    var newItems = wi.items.reduce(function(acc: Array<Object>, item: Object, idx: Number) {
        if (item.name !== slat.name) {
            acc.push(item);
        }
        return acc;
    }, []);
    return newItems;
}

// If we have storage of the players then we create an array of them and notify the instance
if (storage.getItem("players")) {
    wi.notify({
        items: makeArrayOfStorageItems(JSON.parse(storage.getItem("players"))),
    });
}

// wiAddForm stop the page refreshing by default
wiAddForm.addEventListener(
    "submit",
    function(e) {
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

wiToolsBtn.addEventListener("click", e => {
    document.body.setAttribute("data-wi-tools-exposed", document.body.getAttribute("data-wi-tools-exposed") === "true" ? "false" : "true");
});

// Handles the loading of the JSON file
wiLoad.addEventListener(
    "change",
    function(e) {
        // Note: this was useful http://blog.teamtreehouse.com/reading-files-using-the-html5-filereader-api
        var file = wiLoad.files[0];
        var textType = /json.*/;
        if (file.type.match(textType)) {
            var reader = new FileReader();

            reader.readAsText(file);
            reader.onload = function(e) {
                let loadedJSON = JSON.parse(reader.result);
                console.log(loadedJSON);
                wi.notify({ items: loadedJSON });
            };
        } else {
            alert("File type not supported!");
        }
    },
    false
);

// hdrInputDoneBtn.addEventListener("click", function(e){
//     addName();
// });

function addName() {
    console.log(isNameValid(hdrInput.value));
    if (isNameValid(hdrInput.value) === false) {
        document.body.setAttribute("data-wi-duplicate-name", "");
        wiInputLabel.textContent = "Name already exists";
        // return;
    } else {
        document.body.removeAttribute("data-wi-duplicate-name");
        wiInputLabel.textContent = "Add Name";
        itemAdd(hdrInput.value);
        hdrInput.value = "";
    }
}

// We need a listener for input so we can determine if he input is filled or not
hdrInput.addEventListener(
    "input",
    function(e) {
        e.target.setAttribute("data-wi-input", this.value.length > 0 ? "filled" : "empty");
    },
    false
);

wiToolsClose.addEventListener(
    "click",
    e => {
        document.body.setAttribute("data-wi-tools-exposed", "false");
    },
    false
);

function isNameValid(name: string) {
    for (let item of wi.items) {
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

wiTools.addEventListener(
    "click",
    function(e) {
        if (e.target.id === "wiDeleteMode") {
            document.body.setAttribute("data-wi-tools-delete-mode", document.body.getAttribute("data-wi-tools-delete-mode") === "true" ? "false" : "true");
        }
        if (e.target.id === "wiPaidMode") {
            document.body.setAttribute("data-wi-tools-paid-mode", document.body.getAttribute("data-wi-tools-paid-mode") === "true" ? "false" : "true");
        }
        if (e.target.id === "wiSave") {
            saveText(JSON.stringify(wi.items), "whosin.json");
        }
    },
    false
);

// This is our splitter functionality
wiSplitter.addEventListener(
    "click",
    function(e) {
        wi.divisor = parseFloat(e.target.getAttribute("data-wi-divisor"));
        splitTeams(wi.divisor);
    },
    false
);

function splitTeams(divideBy) {
    // Make an array of the people who are in
    let peopleIn = wi.items.reduce(function(acc, item, idx) {
        if (item.in === true) {
            acc.push(item);
        }
        return acc;
    }, []);
    // Make an array of the people who are out
    let peopleOut = wi.items.reduce(function(acc, item, idx) {
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
    chunkedAndShuffled.forEach(function(arrayOfSplit, idx) {
        // For each person in each team
        arrayOfSplit.forEach(function(itemInArraySplit) {
            // Set them on their relevant team. Adding one here to give more human friendly team numbers
            itemInArraySplit.team = idx + 1;
        });
    });
    // Now flatten the teams into a single array and then add on the people who are out
    wi.notify({ items: flatten(chunkedAndShuffled).concat(peopleOut) });
}

function itemAdd(itemString: string) {
    var newPerson = new makePerson(itemString);
    wi.items.push(newPerson);
    wi.notify({
        items: wi.items,
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
function chunkify(a: Array<Object>, n: Number, balanced: Boolean) {
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
    return arr.reduce(function(flat: Array<Object>, toFlatten: Array<Object>) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

function saveText(text: Array<Object>, filename: string) {
    var a = document.createElement("a");
    a.setAttribute("href", "data:text/plain;charset=utf-u," + encodeURIComponent(text));
    a.setAttribute("download", filename);
    a.click();
}

Array.prototype.move = function(from: number, to: number) {
    this.splice(to, 0, this.splice(from, 1)[0]);
    return this;
};
