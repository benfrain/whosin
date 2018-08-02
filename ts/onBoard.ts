const ioOnBoard = <HTMLElement>document.getElementById("ioOnBoard");
const ioOnBoardOK = <HTMLElement>document.getElementById("ioOnBoardOK");
const ioOnBoardDummy = <HTMLElement>document.getElementById("ioOnBoardDummy");
const ioOnBoardDismiss = <HTMLElement>document.getElementById("ioOnBoardDismiss");
const ioAbout = <HTMLElement>document.getElementById("ioAbout");

// Dismiss the intro
ioOnBoardOK.addEventListener("click", function(e) {
    root.removeAttribute("data-io-onboard");
    removeStandardClickMask();
    io.items[0] = {
        EventName: "Untitled Event",
        Selected: true,
        EventData: []
    }
    io.notify({
        items: io.items;
    });
});

ioOnBoardDismiss.addEventListener("click", function(e) {
    root.removeAttribute("data-io-onboard");
    removeStandardClickMask();
});

// Load the intro
ioAbout.addEventListener("click", function(e) {
    document.documentElement.setAttribute("data-io-onboard", "true");
    createClickMask(ioOnBoard, "data-io-onboard");
    storage.setItem("io-intro-viewed", "true");
});

(function checkIntro() {
    if (window.localStorage.getItem("io-intro-viewed")) {
        return;
    } else {
        document.documentElement.setAttribute("data-io-onboard", "true");
        createClickMask(ioOnBoard, "data-io-onboard");
        window.localStorage.setItem("io-intro-viewed", "true");
    }
})();

ioOnBoardDummy.addEventListener("click", function(e) {
    root.removeAttribute("data-io-onboard");
    removeStandardClickMask();
    populateMenu();
    io.notify({
        items: defaultDataV2
    });
});
