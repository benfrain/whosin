function createSlats(slats: Array<Object>, currentDataSet: number) {
    // console.log(slats);
    setTimeout(() => {
        root.removeAttribute("data-loading-slats");
    }, slats.length * 100);
    slats.forEach(function(item, idx) {
        // The container
        let slat = document.createElement("div");
        slat.classList.add("io-Slat");
        slat.setAttribute("data-idx", idx);
        slat.style.setProperty("--delay", `${idx / 20}s`);
        slat.setAttribute("data-io-slat-in", item.in);
        if (item.team && item.in) {
            slat.setAttribute("data-io-slat-team", item.team);
        }

        // let noOfEventBeingUsed = io.items.findIndex(item => item.Selected);
        // console.log(noOfEventBeingUsed);
        // Handle a user being clicked to be 'In'
        slat.addEventListener(
            "click",
            function(e) {
                e.stopPropagation();
                // Fork here depending upon whether item is in or out
                root.setAttribute("data-io-slat-moving", "true");
                if (e.target.getAttribute("data-io-slat-in") === "false") {
                    console.log("up");
                    rePositionSlat(this, "up");
                    this.addEventListener("transitionend", function setItems() {
                        moveEntryInArray(
                            parseFloat(this.getAttribute("data-idx")),
                            io.items[currentDataSet].EventData,
                            0
                        );
                        removeTeams(currentDataSet);
                        io.items[currentDataSet].EventData = setThisItem(item, currentDataSet);
                        io.notify({ items: io.items });
                        this.removeEventListener("transitionend", setItems);
                        root.setAttribute("data-io-slat-moving", "false");
                    });
                } else {
                    console.log("down");

                    rePositionSlat(this, "down");
                    this.addEventListener("transitionend", function returnItems() {
                        moveEntryInArray(
                            parseFloat(this.getAttribute("data-idx")),
                            io.items[currentDataSet].EventData,
                            io.items[currentDataSet].EventData.length - 1
                        );
                        removeTeams(currentDataSet);
                        io.items[currentDataSet].EventData = setThisItem(item, currentDataSet);
                        io.notify({ items: io.items });
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
            function(e) {
                e.stopPropagation();
                io.notify({ activeEvent: removeThisSlat(item) });
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
