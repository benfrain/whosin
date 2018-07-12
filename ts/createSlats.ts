// From: https://gist.github.com/al3x-edge/1010364
function setEndOfContenteditable(contentEditableElement) {
    var range, selection;
    if (document.createRange) {
        //Firefox, Chrome, Opera, Safari, IE 9+
        range = document.createRange(); //Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection(); //get the selection object (allows you to change selection)
        selection.removeAllRanges(); //remove any selections already made
        selection.addRange(range); //make the range you have just created the visible selection
    } else if (document.selection) {
        //IE 8 and lower
        range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
        range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
        range.select(); //Select the range (make it the visible selection
    }
}

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

        // Handle a user being clicked to be 'In'
        slat.addEventListener(
            "click",
            function(e) {
                if (editingPlayers) {
                    // Let a tap in the middle of the name select accordingly, else select the end of the string
                    if (e.target.classList.contains("io-Slat_Name")) {
                        return;
                    } else {
                        setEndOfContenteditable(e.target.querySelector(".io-Slat_Name"));
                    }
                } else {
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

        itmContainer.appendChild(slat);
    });
}
