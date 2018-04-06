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
