/**
 * Takes a slat as an object and compares it with the objects in the main items. A new array is made with a reduce and the only things allowed in are entries that are not the current slat. This new array is then set to be the items
 * @param {Object} slat A single slat represented as an object
 */
function removeThisSlat(slat: Object) {
    var newItems = io.activeEvent.reduce(function(acc: Array<Object>, item: Object, idx: Number) {
        if (item.name !== slat.name) {
            acc.push(item);
        }
        return acc;
    }, []);
    return newItems;
}
