function splitTeams(divideBy: number, currentDataSet: number) {
    // Make an array of the people who are in
    let peopleIn = io.items[currentDataSet].EventData.reduce(function(acc, item, idx) {
        if (item.in === true) {
            acc.push(item);
        }
        return acc;
    }, []);
    // Make an array of the people who are out
    let peopleOut = io.items[currentDataSet].EventData.reduce(function(acc, item, idx) {
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
    io.items[currentDataSet].EventData = flatten(chunkedAndShuffled).concat(peopleOut);
    // Now flatten the teams into a single array and then add on the people who are out
    io.notify({ items: io.items });
}
