let poseNet, 
    pose,
    brain, 
    currentImage, 
    currentImageString, 
    loadedImage,
    fileName,
    totalImages, 
    processSwitch,
    myJSON = {};

function setup(){
  // size of the elecrow 7" displays/ size of the stills
  createCanvas(1028, 600);
  // alternate between the 2 states: detecting poses and changing image
  processSwitch = false;
  // starts on the first image
  currentImage = 1;
  fileName = 'scene2outfit2';
  // change depending on amount of images in folder
  totalImages = 3488;

  loadedImage = getImage(currentImage);

  // load up the machine learning model PoseNet, and the 'brain'
  poseNet = ml5.poseNet('single', modelReady);
  brainSetup();
  frameRate(5);
}

function brainSetup(){
  // start our neural network, so we can start training
  // inputs/outputs to be the images in and out
  let options = {
    inputs: 34,
    outputs: totalImages,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
}

function draw(){
  if(pose){
    // draw the current image
    image(loadedImage, 0, 0, 1024, 600);
    
    // draw its keypoints
    for (let keypoint of pose.keypoints){
      let x = keypoint.position.x;
      let y = keypoint.position.y;
      fill(120, 120, 120);
      stroke(255, 180, 0);
      beginShape();
      vertex(x, y-5);
      vertex(x+3, y);
      vertex(x, y+5);
      vertex(x-3, y);
      endShape(CLOSE);
    }

    if(currentImage < totalImages){
      if(processSwitch == true){
        nextImage();
        console.log('nextImage:', currentImage, ' / ', totalImages);
        processSwitch = false;
      }
      else{
        modelReady();
        console.log('modelReady');
        processSwitch = true;
      }
    } 
    else{
      console.log("all images processed");
    }
  }
}

function getImage(currentImage){
  currentImageString = `${fileName}_${('0000'+currentImage).slice(-4)}`;
  // (adjusted to pad number with leading zeros)
  return createImg(`assets/${fileName}/${fileName}-${('0000'+currentImage).slice(-4)}.jpg`);
}

function modelReady(){
  // when the model is ready, run the singlePose() function
  // if/when  pose is detected, poseNet.on('pose', ...) will be listening for the detection results
  // in the draw() loop, if there is any poses, then carry out the draw commands
  poseNet.singlePose(loadedImage, gotPoses);
}

function gotPoses(poses){

  // console.log("poses.length:", poses.length)
  if (poses.length > 0){
    pose = poses[0].pose;

    //inputs array for coords to go in
    let inputs = [];
    // console.log(currentImageString, inputs);

    // myJSON['currentImageString'] = inputs;

    for (let keypoint of pose.keypoints){
      let x = keypoint.position.x;
      let y = keypoint.position.y;
      inputs.push(x);
      inputs.push(y);

      // or maybe possible with string?
      let target = [currentImage];

      // add it to the model ready for training later

      // console.log(myJSON);
      // if(myJSON.length == 10){
      //   debugger
      // }
      // brain.addData(inputs, target);
    }

    myJSON[currentImageString] = inputs;
    console.log(myJSON);
    // debugger;
  }
}  

// load and analyse the next image unless there are no more
function nextImage(){

  currentImage += 1;
  // console.log("current image:", currentImage);
  // change loaded image to the next image
  loadedImage = getImage(currentImage);
  // give the img tag a width + height attribute, so DOM element knows the size each time
  loadedImage.size(1024, 600);
  loadedImage.hide(); 
}

// press s to save the json file (saves as the name of the fileName)
function keyPressed(){
  if (key == "s"){
    downloadObjectAsJson(myJSON, `${fileName}`);
  } 
}  

// function to download an object of arrays to JSON, each with a file name
// https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}