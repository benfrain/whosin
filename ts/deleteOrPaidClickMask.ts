function deleteOrPaidModeClickMask() {
    let deleteMask = document.createElement("div");
    deleteMask.classList.add("io-Slat_DeleteMask");
    itmContainer.appendChild(deleteMask);
    deleteMask.addEventListener("click", function selfRemoveDeleteMask() {
        io.notify({ deleteMode: false, paidMode: false });
        removeDeleteOrPaidModeClickMask();
    });
}

function removeDeleteOrPaidModeClickMask() {
    let deleteMask = itmContainer.querySelector(".io-Slat_DeleteMask");
    if (deleteMask) {
        itmContainer.removeChild(deleteMask);
    }
}
