function createSlats(slats: Array<Object>) {
    slats.forEach(function(item, idx) {
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
            function(e) {
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
                        moveEntryInArray(
                            parseFloat(this.getAttribute("data-idx")),
                            io.items,
                            io.items.length - 1
                        );
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
            function(e) {
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
