/*! SoundXpand Simple Image Editor v1.0.0 | (c) SoundXpand | github.com/SoundXpand/Simple-Image-Editor */

let originalImage;
let editedImage;
let selectedImage;

// Apply filters action
document.getElementById('filterGrayscale').addEventListener('click', function () {
  applyFilter('grayscale');
});

document.getElementById('filterSepia').addEventListener('click', function () {
  applyFilter('sepia');
});

document.getElementById('filterInvert').addEventListener('click', function () {
  applyFilter('invert');
});

// Remove any applied filter and restore the original image
document.getElementById('filterNone').addEventListener('click', function () {
  applyFilter('none');
});

// Apply the selected filter to the edited image
function applyFilter(filter) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const imgWidth = editedImage.width;
  const imgHeight = editedImage.height;

  canvas.width = imgWidth;
  canvas.height = imgHeight;

  context.drawImage(editedImage, 0, 0, imgWidth, imgHeight);

  const imageData = context.getImageData(0, 0, imgWidth, imgHeight);
  const data = imageData.data;

  switch (filter) {
    case 'grayscale':
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      break;
    case 'sepia':
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = r * 0.393 + g * 0.769 + b * 0.189;
        data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
        data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
      }
      break;
    case 'invert':
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
    case 'none':
      // Reset to original image
      editedImage.src = originalImage.src;
      return; // Exit
    default:
      break;
  }

  context.putImageData(imageData, 0, 0);
  editedImage.src = canvas.toDataURL();
}

// File select handler
function fileSelectHandler(event) {
  const file = event.target.files[0];
  const fileName = file.name;
  const fileType = file.type;
  const fileSize = Math.floor(file.size / 1024);

  document.getElementById('fileName').textContent = fileName;
  document.getElementById('fileType').textContent = fileType;
  document.getElementById('fileSize').textContent = fileSize + ' KB';

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      originalImage = img;
      editedImage = img.cloneNode();
      selectedImage = img; // Set the selected image
      const placeholder = document.querySelector('.placeholder');
      placeholder.innerHTML = '';
      placeholder.appendChild(editedImage);
    };
    img.src = reader.result;
    img.classList.add('max-w-full', 'max-h-full', 'object-cover', 'object-center', 'rounded');
  };
  reader.readAsDataURL(file);
}

// Handle the drop event
function dropHandler(event) {
  event.preventDefault();
  fileSelectHandler(event);
}

// Replace Image
function replaceImage(event) {
  const file = event.target.files[0];
  const fileName = file.name;
  const fileType = file.type;
  const fileSize = Math.floor(file.size / 1024);

  document.getElementById('fileName').textContent = fileName;
  document.getElementById('fileType').textContent = fileType;
  document.getElementById('fileSize').textContent = fileSize + ' KB';

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      originalImage = img;
      editedImage = img.cloneNode();
      const placeholder = document.querySelector('.placeholder');
      placeholder.innerHTML = '';
      placeholder.appendChild(editedImage);
    };
    img.src = reader.result;
    img.classList.add('max-w-full', 'max-h-full', 'object-cover', 'object-center', 'rounded');
  };
  reader.readAsDataURL(file);
}


// Image resize function
function resizeImage(scale) {
  const width = Math.floor(originalImage.width * (scale / 100));
  const height = Math.floor(originalImage.height * (scale / 100));

  // Create a new offscreen canvas to draw the resized image
  const offscreenCanvas = document.createElement('canvas');
  const offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;

  // Use createImageBitmap for resizing large images
  if (originalImage.width > 2000 || originalImage.height > 2000) {
    createImageBitmap(originalImage, 0, 0, originalImage.width, originalImage.height, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'high',
    }).then(function (resizedBitmap) {
      offscreenCtx.drawImage(resizedBitmap, 0, 0, width, height);
      const resizedImg = new Image();
      resizedImg.src = offscreenCanvas.toDataURL();
      resizedImg.onload = function () {
        resizedImg.classList.add('max-w-full', 'max-h-full', 'object-cover', 'object-center', 'rounded');
        const placeholder = document.querySelector('.placeholder');
        placeholder.innerHTML = '';
        placeholder.appendChild(resizedImg);
        editedImage = resizedImg;
      };
    });
  } else {
    // Use drawImage for resizing small images
    offscreenCtx.drawImage(originalImage, 0, 0, width, height);
    const resizedImg = new Image();
    resizedImg.src = offscreenCanvas.toDataURL();
    resizedImg.onload = function () {
      resizedImg.classList.add('max-w-full', 'max-h-full', 'object-cover', 'object-center', 'rounded');
      const placeholder = document.querySelector('.placeholder');
      placeholder.innerHTML = '';
      placeholder.appendChild(resizedImg);
      editedImage = resizedImg;
    };
  }
}

function downloadImage() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const imgWidth = editedImage.width;
  const imgHeight = editedImage.height;

  canvas.width = imgWidth;
  canvas.height = imgHeight;

  context.drawImage(editedImage, 0, 0, imgWidth, imgHeight);

  // Create a unique filename with UUID and suffix
  const uuid = generateUUID();
  const fileFormatSelect = document.getElementById('fileFormatSelect');
  const fileFormat = fileFormatSelect.value;
  const filename = `${uuid}-SoundXpand.${fileFormat}`;

  // Convert the canvas content to a data URL
  const dataURL = canvas.toDataURL(`image/${fileFormat}`);

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;

  // Simulate a click on the link to trigger the download
  link.click();
}

// Function to generate a UUID (Universally Unique Identifier)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/*

const canvas = document.getElementById("canvas");
const fileInput = document.getElementById("fileInput");
const sizeSelect = document.getElementById("sizeSelect");
const resizeButton = document.getElementById("resizeButton");
const filterSelect = document.getElementById("filterSelect");
const applyFilterButton = document.getElementById("applyFilterButton");
const downloadLink = document.getElementById("downloadLink");

let ctx = canvas.getContext("2d");
let img = new Image();

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

resizeButton.addEventListener("click", () => {
    let scale = sizeSelect.value / 100;
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
});

applyFilterButton.addEventListener("click", () => {
    let filter = filterSelect.value;
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    switch (filter) {
        case "grayscale":
            for (let i = 0; i < data.length; i += 4) {
                let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = avg;
                data[i + 1] = avg;
                data[i + 2] = avg;
            }
            break;
        case "sepia":
            for (let i = 0; i < data.length; i += 4) {
                let r = data[i];
                let g = data[i + 1];
                let b = data[i + 2];
                data[i] = r * 0.393 + g * 0.769 + b * 0.189;
                data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
                data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
            }
            break;
        case "invert":
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
        default:
            break;
    }

    ctx.putImageData(imageData, 0, 0);
});

downloadLink.addEventListener("click", () => {
    downloadLink.href = canvas.toDataURL();
    downloadLink.download = "edited-image.png";
});

// Wrap every letter in a span
var textWrapper = document.querySelector(".ml1 .letters");
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

anime
    .timeline({ loop: true })
    .add({
        targets: ".ml1 .letter",
        scale: [0.3, 1],
        opacity: [0, 1],
        translateZ: 0,
        easing: "easeOutExpo",
        duration: 600,
        delay: (el, i) => 70 * (i + 1),
    })
    .add({
        targets: ".ml1 .line",
        scaleX: [0, 1],
        opacity: [0.5, 1],
        easing: "easeOutExpo",
        duration: 700,
        offset: "-=875",
        delay: (el, i, l) => 80 * (l - i),
    })
    .add({
        targets: ".ml1",
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000,
    });
*/
