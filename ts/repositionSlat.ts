function rePositionSlat(slat: HTMLDivElement, direction: string) {
    // debugger;
    let moveAmount, indexOfClickedSlat;
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
        if (nextItem) {
            nextItem.style.marginTop = `${heightOfClickedItem}px`;
        }
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

    // Determine transition duration
    let duration = moveAmount / 700;
    root.style.setProperty("--duration", `${duration.toFixed(2)}s`);
    // We use a ternary operator to use one string or another based upon whether we are moving the slat up or down
    function anim() {
        window.requestAnimationFrame(function(timeStamp) {
            if (direction === "down" && nextItem !== null) {
                wrapSlats.style.top = heightOfClickedItem + "px";
            }
            wrapSlats.style.transform =
                direction === "up"
                    ? `translateY(${heightOfClickedItem}px)`
                    : `translateY(-${heightOfClickedItem}px)`;
            slat.style.transform =
                direction === "up" ? `translateY(-${moveAmount}px)` : `translateY(${moveAmount}px)`;
        });
    }
    window.requestAnimationFrame(anim);
    // Set the CSS var for the duration this click should take
    console.log(duration, direction);
}
