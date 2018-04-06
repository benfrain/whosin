function createToolsClickMask() {
    clickMask = document.createElement("div");
    clickMask.classList.add("io-Tools_ClickMask");
    clickMask = ioToolsBtn.parentNode.insertBefore(clickMask, ioToolsBtn);
    clickMask.addEventListener("click", function(e) {
        io.notify({ showingToolTray: false });
        removeToolsClickMask();
    });
}

function removeToolsClickMask() {
    if (wrapper.contains(clickMask)) {
        wrapper.removeChild(clickMask);
    }
}
