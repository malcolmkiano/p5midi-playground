class Synth {
  constructor() {
    this.synth = new Tone.PolySynth(16, Tone.Synth).toMaster();
    this.synth.set({ volume: -3, });
  }

  play(note) {
    // restore original name/octave format
    const name = note.name;
    const octave = (/(A|B)/.test(note.name) ? note.octave - 1 : note.octave);

    // play the sound
    this.synth.triggerAttackRelease(name + octave, '8n');
  }
}