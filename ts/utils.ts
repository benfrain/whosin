function makeArrayOfStorageItems(items: String) {
    let resultantArray = [];
    for (let i = 0; i < items.length; i++) {
        resultantArray.push(items[i]);
    }
    return resultantArray;
}

function moveEntryInArray(countNo: number, theArray: Array<Object>, endPos) {
    theArray.move(countNo, endPos);
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

Array.prototype.move = function(from: number, to: number) {
    this.splice(to, 0, this.splice(from, 1)[0]);
    return this;
};

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
