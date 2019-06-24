function rePositionSlat(slat: HTMLDivElement, direction: string) {
    let moveAmount: number;
    let slatGeometry = slat.getBoundingClientRect();
    let heightOfClickedItem = slatGeometry.height;
    let nextItem = slat.nextElementSibling || null;
    let duration = 0.5;
    let allItemsInContainer = Array.from(itmContainer.children);
    let indexOfClickedSlat = allItemsInContainer.findIndex(item => item === slat);
    let positionOfClickedSlat = slatGeometry.top + window.scrollY;
    let positionOfFirstSlat;
    if (io.count === 0) {
        positionOfFirstSlat = ioHeaderUnConfirmed.getBoundingClientRect().top;
    } else {
        positionOfFirstSlat =
            itmContainer.querySelector(".io-Slat:first-of-type").getBoundingClientRect().top +
            window.scrollY;
    }
    let positionOfLastSlat =
        itmContainer.getBoundingClientRect().bottom + window.scrollY - heightOfClickedItem;

    // Set the clicked slat to be position fixed;
    slat.style.zIndex = "99";
    slat.style.position = "fixed";
    slat.style.top = slatGeometry.top + "px";
    slat.style.backgroundColor = "#f9f9f9";

    let allItemsInContainerBelowClicked = allItemsInContainer.filter(
        (item, idx) => idx > indexOfClickedSlat
    );

    let allItemsInContainerAboveClicked = allItemsInContainer.filter(
        (item, idx) => idx < indexOfClickedSlat && idx > 0
    );
    if (nextItem) {
        nextItem.style.marginTop = `${heightOfClickedItem}px`;
    } else {
        slat.previousElementSibling.style.marginBottom = `${heightOfClickedItem}px`;
    }
    if (direction === "up") {
        moveAmount = positionOfFirstSlat - positionOfClickedSlat;
    } else {
        moveAmount = positionOfLastSlat - positionOfClickedSlat;
    }

    root.style.setProperty("--duration", `${duration.toFixed(2)}s`);
    function anim() {
        window.requestAnimationFrame(function(timeStamp) {
            if (direction === "up") {
                allItemsInContainerAboveClicked.forEach(item => {
                    item.style.transform = `translateY(${heightOfClickedItem}px)`;
                });
            } else {
                allItemsInContainerBelowClicked.forEach(item => {
                    item.style.transform = `translateY(-${heightOfClickedItem}px)`;
                });
            }
            slat.style.transform = `translateY(${moveAmount}px)`;
        });
    }
    window.requestAnimationFrame(anim);
}
