

//          SEQUENCER

var playButton, stopButton;
var isPlaying = 0;
var sounds = ['kick','perc','snare','tom','closedHH'];

function setup() {
    createCanvas(100, 100);
    background(0);
    playButton = createButton('Play');
    playButton.position(19, 350);
    playButton.mousePressed(playSeq);
    
    stopButton = createButton('Stop');
    stopButton.position(59, 350);
    stopButton.mousePressed(stopSeq);
    
    background(220, 100, 50);

    cnv = createCanvas(500, 300);
    noFill(); 
    stroke(0,100);
    source = new p5.AudioIn();
    source.start();

    fft = new p5.FFT(0.9, 1024);
    fft.setInput(source);

}

function preload(){
    
    sounds[0] = loadSound('sounds/kick.wav');
    
    sounds[1] = loadSound('sounds/perc.wav');
    
    sounds[2] = loadSound('sounds/snare.wav');
    
    sounds[3] = loadSound('sounds/tom.wav');
    
    sounds[4] = loadSound('sounds/closedHH.wav');
    
    
}


function playSeq(){
    if(isPlaying == 0){
        sequencer.start();
        isPlaying = 1;
    }
}

function stopSeq(){
    
    sequencer.stop();
    isPlaying = 0;
}

function playStep(v){
    
    for(i=0; i<v.length; i++){
        if(v[i] == 1){
            sounds[i].play();
        }
    }
}


//          PIANO


var osc = new p5.SinOsc(440);
osc.amp(0.2);
var freq;



function keyPressed(note){
    
    freq = midiToFreq(note.note);
    console.log(freq);
    
    if(note.state){
        osc.freq(freq);
        osc.start();
        
    }else{
        osc.stop();
    }
}




//            Visuals

var source, fft;

// height of fft == height/divisions
var divisions = 5;
var cnv;
var speed = 1;

var color1 = 0;
var color2 = 100;
var color3 = 200;







function draw() {
  var h = height/divisions;
  var spectrum = fft.analyze();
  var newBuffer = [];

    
    if(color1 == 255){
        color1 = 0;
    }
    
    if(color2 == 255){
        color2 = 0;
    }
    
    if(color3 == 255){
        color3 = 0;
    }
    
    color1 += 1;
    color2 += 1;
    color3 += 1;

    

  var scaledSpectrum = splitOctaves(spectrum, 12);
  var len = scaledSpectrum.length;

  background(color1, color2, color3, 1);
  // copy before clearing the background
  copy(cnv,0,0,width,height,0,speed,width,height);

  // draw shape
  beginShape();

    // one at the far corner
    curveVertex(0, h);

    for (var i = 0; i < len; i++) {
      var point = smoothPoint(scaledSpectrum, i, 2);
      var x = map(i, 0, len-1, 0, width);
      var y = map(point, 0, 255, h, 0);
      curveVertex(x, y);
    }

    // one last point at the end
    curveVertex(width, h);

  endShape();
}


/**
 *  Divides an fft array into octaves with each
 *  divided by three, or by a specified "slicesPerOctave".
 *  
 *  There are 10 octaves in the range 20 - 20,000 Hz,
 *  so this will result in 10 * slicesPerOctave + 1
 *
 *  @method splitOctaves
 *  @param {Array} spectrum Array of fft.analyze() values
 *  @param {Number} [slicesPerOctave] defaults to thirds
 *  @return {Array} scaledSpectrum array of the spectrum reorganized by division
 *                                 of octaves
 */
function splitOctaves(spectrum, slicesPerOctave) {
  var scaledSpectrum = [];
  var len = spectrum.length;

  // default to thirds
  var n = slicesPerOctave|| 3;
  var nthRootOfTwo = Math.pow(2, 1/n);

  // the last N bins get their own 
  var lowestBin = slicesPerOctave;

  var binIndex = len - 1;
  var i = binIndex;


  while (i > lowestBin) {
    var nextBinIndex = round( binIndex/nthRootOfTwo );

    if (nextBinIndex === 1) return;

    var total = 0;
    var numBins = 0;

    // add up all of the values for the frequencies
    for (i = binIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }

    // divide total sum by number of bins
    var energy = total/numBins;
    scaledSpectrum.push(energy);

    // keep the loop going
    binIndex = nextBinIndex;
  }

  // add the lowest bins at the end
  for (var j = i; j > 0; j--) {
    scaledSpectrum.push(spectrum[j]);
  }

  // reverse so that array has same order as original array (low to high frequencies)
  scaledSpectrum.reverse();

  return scaledSpectrum;
}


// average a point in an array with its neighbors
function smoothPoint(spectrum, index, numberOfNeighbors) {

  // default to 2 neighbors on either side
  var neighbors = numberOfNeighbors || 2;
  var len = spectrum.length;

  var val = 0;

  // start below the index
  var indexMinusNeighbors = index - neighbors;
  var smoothedPoints = 0;

  for (var i = indexMinusNeighbors; i < (index+neighbors) && i < len; i++) {
    // if there is a point at spectrum[i], tally it
    if (typeof(spectrum[i]) !== 'undefined') {
      val += spectrum[i];
      smoothedPoints++;
    }
  }

  val = val/smoothedPoints;

  return val;
}






