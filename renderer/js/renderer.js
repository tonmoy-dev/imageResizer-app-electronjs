const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

function loadImage(e) {
  const file = e.target.files[0];

  if(!isFileImage(file)){
    alertError('please select an image');
    return;
  }
  // console.log('success');

  // get original dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  }

  // show form
  form.style.display = 'block'

  // set file name
  filename.innerText = file.name;

  // create output directory
  outputPath.innerText = path.join(os.homedir(), 'imageResizer');

}

// send image data to main process
function sendImage(e) {
  e.preventDefault();

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = img.files[0].path;

  if(!img.files[0]) {
    alertError('Please upload an image');
  }
  if(width === '' || height === ''){
    alertError('Please fill the width and height')
  }

  // send to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height
  })
}

// catch the image:done event
ipcRenderer.on('image:done', ()=>{
  alertSuccess(`Image resize to ${widthInput.value} x ${heightInput.value}`);
})

// make sure file is images
function isFileImage(file) {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}

function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style:{
      background: 'red',
      color: '#fff',
      textAlign: 'center',
      padding: '10px 0',
      fontSize: '14px'
    }
  })
}

function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style:{
      background: 'green',
      color: '#fff',
      textAlign: 'center',
      padding: '10px 0',
      fontSize: '14px'
    }
  })
}

img.addEventListener('change', loadImage);

form.addEventListener('submit', sendImage);


// console.log(versions.node())
