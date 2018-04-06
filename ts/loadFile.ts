function loadFile(e) {
    // Note: this was useful http://blog.teamtreehouse.com/reading-files-using-the-html5-filereader-api
    var file = ioLoad.files[0];
    var textType = /json.*/;
    if (file.type.match(textType)) {
        var reader = new FileReader();

        reader.readAsText(file);
        reader.onload = function(e) {
            let loadedJSON = JSON.parse(reader.result);
            console.log(loadedJSON);
            io.notify({ items: loadedJSON });
        };
    } else {
        alert("File type not supported!");
    }
}
