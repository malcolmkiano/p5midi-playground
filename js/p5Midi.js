const p5Midi = {
  /** 
   * initializes the WebMidi instance
   * @param {string | number} device the index of the midi device to use
   * @param {boolean} verbose whether to log info messages
   */
  init(device, verbose = true) {
    WebMidi.enable((error) => {
      if (error) {
        console.error('WebMidi could not be enabled.', error);
      } else {
        console.log('WebMidi enabled!');
      }

      if (verbose) this.logDevices();

      /** holds the MIDI input device */
      const inputDevice = Number.isNaN(device)
        ? WebMidi.getInputByName(device)
        : WebMidi.inputs[device];

      if (!inputDevice) {
        console.error('WebMidi could not find the input device specified.');
        return;
      }

      // add listeners
      this.addListeners(inputDevice);
    });
  },

  /** sets up listeners for the selected input device */
  addListeners(device) {
    /**
     * adjust the event octave for A & B keys
     * @param {{note: {name: string, octave: number}}} event the MIDI event
     */
    const fixOctave = (event) => {
      let clone = { ...event };
      clone.note.octave = /(A|B)/.test(clone.note.name)
        ? clone.note.octave + 1
        : clone.note.octave;
      return clone;
    };

    // when note is pressed
    device.addListener('noteon', 'all', (event) => {
      const e = fixOctave(event);
      if (typeof midiNoteOn === 'function') {
        midiNoteOn(e);
      }

      // index the note
      this.notesPressed.push(e.note.name + e.note.octave);
    });

    // when note is released
    device.addListener('noteoff', 'all', (event) => {
      const e = fixOctave(event);
      if (typeof midiNoteOff === 'function') {
        midiNoteOff(e);
      }

      // un-index the note
      this.notesPressed = this.notesPressed.filter((note) => note !== e.note.name + e.note.octave);
    });
  },

  /** list visible MIDI input and output ports */
  logDevices() {
    console.group('Inputs Ports');
    for (i = 0; i < WebMidi.inputs.length; i++) {
      console.log(i + ': ' + WebMidi.inputs[i].name);
    }
    console.groupEnd();

    console.group('Output Ports');
    for (i = 0; i < WebMidi.outputs.length; i++) {
      console.log(i + ': ' + WebMidi.outputs[i].name);
    }
    console.groupEnd();
  },

  /** list of the notes currently pressed */
  notesPressed: [],

  /**
   * check whether a specific note is pressed
   * if no param is given, checks if any notes are pressed
   * @param {string} note the name of the note to check for
   */
  noteIsDown(note = null) {
    return !note ? !!this.notesPressed.length : this.notesPressed.includes(note);
  }
};

// Public API
const noteIsDown = (note = null) => p5Midi.noteIsDown(note);