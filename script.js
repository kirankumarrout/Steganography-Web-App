let encodebtn = document.getElementById("encodebtn");
let encodeimage1fileinput = document.getElementById("encodeimage1");
let canvasbox = document.getElementById("canvasbox");
let secretTextField = document.getElementById("secretText");

let loadedImage;
let encodedImage;

let decodebtn = document.getElementById("decodebtn");
let decodeimage1fileinput = document.getElementById("decodeimage1");
let decodeimage2fileinput = document.getElementById("decodeimage2");

let decodeimage1;
let decodeimage2;

let encodeimage1preview = document.getElementById("encodeimage1preview");
let decodeimage1preview = document.getElementById("decodeimage1preview");
let decodeimage2preview = document.getElementById("decodeimage2preview");

encodeimage1fileinput.addEventListener("change", function() {
    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            encodeimage1preview.src = e.target.result;
            encodeimage1preview.style.display = "block";
        };
        reader.readAsDataURL(encodeimage1fileinput.files[0]);
    }
});

decodeimage1fileinput.addEventListener("change", function() {
    if (decodeimage1fileinput.files && decodeimage1fileinput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            decodeimage1preview.src = e.target.result;
            decodeimage1preview.style.display = "block";
        };
        reader.readAsDataURL(decodeimage1fileinput.files[0]);
    }
});

decodeimage2fileinput.addEventListener("change", function() {
    if (decodeimage2fileinput.files && decodeimage2fileinput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            decodeimage2preview.src = e.target.result;
            decodeimage2preview.style.display = "block";
        };
        reader.readAsDataURL(decodeimage2fileinput.files[0]);
    }
});

encodebtn.addEventListener("click", e => {
    console.log("encoding...");
    encodebtn.classList.add("disabled");

    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        loadedImage = loadImage(URL.createObjectURL(encodeimage1fileinput.files[0]), () => {
            loadedImage.loadPixels();
            console.log("Pixel data:", loadedImage.pixels);

            let secretText = secretTextField.value;
            console.log("secret message:", secretText);

            encodedImage = createImage(loadedImage.width, loadedImage.height);
            encodedImage.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, loadedImage.width, loadedImage.height);
            encodedImage.loadPixels();
            console.log("Pixel data:", encodedImage.pixels);

            encodeMessage(encodedImage, secretText);

            downloadEncodedImage(encodedImage, 'encoded_image.jpg');
        });
    } else {
        alert("Please select an image file.");
    }
});

decodebtn.addEventListener("click", e => {
    console.log("decoding...");
    decodebtn.classList.add("disabled");

    if (decodeimage1fileinput.files && decodeimage1fileinput.files[0] && decodeimage2fileinput.files && decodeimage2fileinput.files[0]) {
        let reader1 = new FileReader();
        let reader2 = new FileReader();

        reader1.onload = function(e) {
            decodeimage1 = loadImage(e.target.result, () => {
                decodeimage1.loadPixels();

                reader2.onload = function(e) {
                    decodeimage2 = loadImage(e.target.result, () => {
                        decodeimage2.loadPixels();
                        let decodedText = decodeMessage(decodeimage1, decodeimage2);
                        secretTextField.value = decodedText;
                    });
                };
                reader2.readAsDataURL(decodeimage2fileinput.files[0]);
            });
        };
        reader1.readAsDataURL(decodeimage1fileinput.files[0]);
    } else {
        alert("Please select both image files.");
    }
});

function encodeMessage(image, message) {
    let data = [];
    for (let i = 0; i < message.length; i++) {
        data.push(message.charCodeAt(i));
    }
    data.push(0); // End of message

    for (let i = 0; i < data.length; i++) {
        let char = data[i];
        for (let j = 0; j < 8; j++) {
            let bit = (char >> j) & 1;
            let x = i * 8 + j;
            let y = 0;
            if (x >= image.width) {
                x -= image.width;
                y = 1;
            }
            let index = (y * image.width + x) * 4;
            image.pixels[index + 0] = (image.pixels[index + 0] & 0xFE) | bit;
        }
    }

    image.updatePixels();
}

function decodeMessage(image1, image2) {
    let data = [];
    let i = 0;
    while (true) {
        let char = 0;
        for (let j = 0; j < 8; j++) {
            let x = i * 8 + j;
            let y = 0;
            if (x >= image1.width) {
                x -= image1.width;
                y = 1;
            }
            let index = (y * image1.width + x) * 4;
            let bit = image1.pixels[index + 0] & 1;
            char |= (bit << j);
        }
        if (char === 0) break;
        data.push(char);
        i++;
    }
    return String.fromCharCode(...data);
}

function downloadEncodedImage(image, filename) {
    image.loadPixels();
    let canvas = createCanvas(image.width, image.height);
    image.copy(canvas, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
    canvas.toBlob(function(blob) {
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    });
}
