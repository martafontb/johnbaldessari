//pick the header tag from my page
const headerTag = document.querySelector('header')
const arrowTag = document.querySelector('img.arrow')

const blobGroups = document.querySelectorAll('g.blob')
const sectionTags = document.querySelectorAll('section')

const pixelsTag = document.querySelector("div.pixels")
const bodyTag = document.querySelector("body")
const progressTag = document.querySelector("div.progress")

const easing = function(x) {
  return x * x * x
}

const fadeHeader = function() {
  const pixels = window.pageYOffset

  headerTag.style.opacity = 1 - easing(pixels / 500)
}

const fadeArrow = function() {
  const pixels = window.pageYOffset

  arrowTag.style.opacity = 1 - easing((pixels / 250))
}

const checkBlobs = function() {
  const pixels = window.pageYOffset

  blobGroups.forEach((blob, index) => {
    const currentSection = sectionTags[index]

    if (pixels > currentSection.offsetTop - 300) {
      blob.classList.add('in-view')
    } else {
      blob.classList.remove('in-view')
    }
  })
}

window.addEventListener('scroll', function() {
  fadeHeader()
  fadeArrow()
  checkBlobs()
})


// when we scroll the page, update the pixels tag to be how far we've scrolled
// document.addEventListener("scroll", function () {
//   const pixels = window.pageYOffset
//
//   pixelsTag.innerHTML = pixels
// })

// when we scroll the page, make a progress bar that track of the distance
document.addEventListener("scroll", function () {
  const pixels = window.pageYOffset
  const pageHeight = bodyTag.getBoundingClientRect().height
  const totalScrollableDistance = pageHeight - window.innerHeight

  const percentage = pixels / totalScrollableDistance

  progressTag.style.width = `${100 * percentage}%`
})




//Face-detection starts

//Set up HTML selectors
const input = document.getElementById('camera-stream');
let displaySize = {
	width: input.offsetWidth,
	height: input.offsetHeight
};
const canvas = document.getElementById('overlay')
const canvasContext = canvas.getContext("2d");

const dots = [
	"angry0.png", "fearful0.png",
	"happy0.png", "neutral0.png",
	"sad0.png", "surprised0.png",
].map(function(src) {
	const i = new Image();
	i.src = "dots/" + src;
	return i;
});

let currentExpression = "surprised";

// Load machine learning models
faceapi.nets.faceExpressionNet.loadFromUri("models");
faceapi.nets.tinyFaceDetector.loadFromUri("models");

// Set up camera stream, then run detection on it.
setupCameraInput();
setInterval(() => {
	lookForFaces();
}, 20);

function drawFace(detections, expressions) {
		// Clear the screen
	canvasContext.clearRect(0,0, canvas.width, canvas.height);

	//mood detection
	if (moodDetectionMode) {
		currentExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
	}

	// TODO:
	const box = detections[0].box;
	const x = box.x ;
	const y = box.y ;
	const width = box.width;
	const height = box.height;
	const exprImg = dots.filter(f => f.src.includes(currentExpression))[0];
	canvasContext.drawImage(exprImg, x, y, width, height)

	// canvasContext.strokeStyle = "red";
	// canvasContext.strokeWidth= 3;
	// canvasContext.strokeRect(x,y,width, height);

	// const img = new Image();
	// img.src = "dots/happy0.png"
	// canvasContext.drawImage(img,x,y,width, height);
}

async function lookForFaces() {
	// Resize the overlay, if the screen was resized.
	if (input.offsetWidth !== displaySize.width || input.offsetHeight !== displaySize.height) {
		displaySize = {
			width: input.offsetWidth,
			height: input.offsetHeight
		};
		faceapi.matchDimensions(canvas, displaySize);
	}
	// Get the detection and if no faces are seen return.
	const detectionResult = await faceapi.detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({
		inputSize: 128
	})).withFaceExpressions();
	if (detectionResult === undefined) {
		return;
	}

	// resize the detected boxes in case your displayed image has a different size than the original
	const detections = [detectionResult.detection];
	const expressions = detectionResult.expressions;
	const resizedDetections = faceapi.resizeResults(detections, displaySize)

	drawFace(resizedDetections, expressions);
	}


	async function setupCameraInput() {
		let stream = null;
		let constraints = {
			audio: false,
			video: {
				facingMode: "user"
			}
		};

		try {
			stream = await navigator.mediaDevices.getUserMedia(constraints);
			var video = document.querySelector('video');
      video.srcObject = stream;
		} catch (err) {
			input.style.display = "none";
			document.getElementById('mood-detection').style.display = "none";
			document.getElementById('camera-denied').style.display = "inherit";
		}
	}
	let moodDetectionMode = false;

	function toggleMoodDetectionMode() {
		moodDetectionMode = !moodDetectionMode;
	}

  stopVideo = function () {
    var video = document.querySelector('video');
    video.srcObject = undefined;

  }


//Face-detection ends

//Face-detection info toggle
const questionMark = document.querySelector('.explainer');
const explanation = document.querySelector('.explanation');

questionMark.addEventListener("click", function(){
  if (questionMark.innerHTML == "?") {
      questionMark.innerHTML = "X";
  } else {
    questionMark.innerHTML = "?";
  }

  questionMark.classList.toggle("clicked");
  explanation.classList.toggle("d-none");
});
