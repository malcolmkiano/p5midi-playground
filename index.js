let particles = [];
let synth;
let userHasInteracted = false;
let synthImage;

function preload() {
  synthImage = loadImage('img/MIDI.svg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);

  // init p5Midi
  p5Midi.init(0, false);

  // init synth
  synth = new Synth(synthImage);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  background(recorder.practiceMode ? 20 : 0);

  // draw guidelines
  if (!userHasInteracted || keyIsDown(72)) {
    synth.drawInstructions();
    recorder.drawInstructions();
  }

  // draw and update particle list
  particles.forEach((particle) => {
    particle.update();
    particle.draw();
  });

  // remove invisible particles
  particles = particles.filter((particle) => particle.isVisible);

  // detect & display the chord being played
  chordDetector.detectChord(p5Midi.notesPressed);
  chordDetector.draw();

  // draw recording interface
  recorder.draw();
}

function keyPressed() {
  if (keyCode === ENTER) {
    recorder.generateSequence();
  } else if (keyCode === ESCAPE) {
    if (!recorder.practiceMode && recorder.recordedNotes.length) {
      recorder.clearRecording(true);
      recorder.setAppState(4);
    }
  } else if (keyCode === 80) {
    recorder.togglePracticeMode();
  }
}

// =======================================
// P5Midi enables & calls the following:
function midiNoteOn(event) {
  // set the interaction flag
  if (!userHasInteracted) {
    userHasInteracted = true;
  }

  // play the note
  synth.play(event.note);

  // record the played note if not in practice mode
  if (!recorder.practiceMode) {
    const note = event.note.name + event.note.octave;
    recorder.recordNote(note);
    if (recorder.appState !== 2) {
      recorder.setAppState(2);
    }
  }

  // add a particle
  particles.push(new Particle(event.velocity));
}