function saveText(text: Array<Object>, filename: string) {
    var a = document.createElement("a");
    a.setAttribute("href", "data:text/plain;charset=utf-u," + encodeURIComponent(text));
    a.setAttribute("download", filename);
    a.click();
}
