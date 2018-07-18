class InOut {
    items: Array<Object> = [];
    observers: Array<Object>;
    showingToolTray: Boolean;
    showingInput: Boolean;
    notify: Function;
    addObserver: Function;
    deleteMode: Boolean;
    paidMode: Boolean;
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
        this.paidMode = false;
    }
}

function makePerson(name: string) {
    this.name = name;
    this.paid = false;
    this.marked = false;
    this.team = "";
    this.in = true;
}

InOut.prototype.addObserver = function(observer: Object) {
    this.observers.push(observer);
};

InOut.prototype.notify = function(changes: Object, callback: Function) {
    // console.log(changes);
    // Loop through every property in changes and set the data to that new value
    var prop;
    for (prop in changes) {
        // First catch any incorrect assignments of the data
        if (typeof this[prop] === "undefined") {
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
