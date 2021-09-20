class Synth {
  constructor(image) {
    this.image = image;
    this.synth = new Tone.PolySynth(16, Tone.Synth).toMaster();
    this.synth.set({ volume: -3, });
  }

  /** synthesizes the pressed note and plays it */
  play(note) {
    // restore original name/octave format
    const name = note.name;
    const octave = (/(A|B)/.test(note.name) ? note.octave - 1 : note.octave);

    // play the sound
    this.synth.triggerAttackRelease(name + octave, '8n');
  }

  /** draws the guides to use the synth */
  drawInstructions() {
    const synthWidth = Math.min(windowWidth * .6, 700);
    const synthHeight = synthWidth * .5625;

    noStroke();
    const x = (width / 2) - (synthWidth / 4);
    const y = (height / 2) - (synthHeight / 2);
    image(this.image, x, y, synthWidth * .5, synthHeight * .5);

    fill(255);
    textAlign(CENTER);
    textSize(synthWidth / 25);
    text('Plug in a MIDI controller to start playing', width / 2, (height / 2) + (synthHeight * .2));
  }
}