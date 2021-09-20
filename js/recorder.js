const recorder = {
  appState: 1,
  bitOn: true,
  practiceMode: true,
  recordedNotes: [],
  waiting: false,

  /** converts the array of notes & timestamps into a JSON entity */
  generateSequence() {
    // ignore if no notes recorded
    if (!this.recordedNotes.length) {
      console.log('No notes recorded.');
      return;
    }

    // create the sequence
    const sequence = {};
    const notes = [...this.recordedNotes];
    const firstFrame = notes[0][1];
    notes.forEach(([note, framePlayed]) => {
      const relativeFrame = framePlayed - firstFrame;
      if (sequence[relativeFrame]) {
        sequence[relativeFrame].push(note);
      } else {
        sequence[relativeFrame] = [note];
      }
    });
    console.log(JSON.stringify(sequence));

    // clear the recording
    this.clearRecording();
    this.setAppState(3);
  },

  /**
   * clears all recorded notes
   * @param {boolean} verbose whether to print info messages
   */
  clearRecording(verbose = false) {
    this.recordedNotes = [];
    if (verbose) {
      console.log('Recorded sequence cleared');
    }
  },

  /** indexes a played note */
  recordNote(note) {
    this.recordedNotes.push([note, frameCount]);
  },

  /** update the app state */
  setAppState(value) {
    this.appState = value;
  },

  /** toggles practice mode during which sequences are not recorded */
  togglePracticeMode() {
    this.practiceMode = !this.practiceMode;
    this.setAppState(this.practiceMode ? 1 : 0);
    this.clearRecording();
  },

  /** cooldown to reset the app to a ready state after task completion */
  resetAppState() {
    if ([3, 4].includes(this.appState)) {
      if (!this.waiting) {
        this.waiting = frameCount;
      } else {
        if (frameCount - (frameRate() * 3) > this.waiting) {
          this.waiting = null;
          this.setAppState(this.practiceMode ? 1 : 0);
        }
      }
    }
  },

  /** get the status message associated with the app state */
  statusMessage() {
    const states = ['Ready', 'Practice', 'Recording...', 'Sequence in console', 'Sequence cleared'];
    return states[this.appState];
  },

  /** show the recording status on the canvas */
  draw() {
    let fontSize = Math.max(height / 40, width / 80);

    // if recording, show recording blinker
    if (this.appState === 2) {
      push();
      noStroke();
      fill(this.bitOn ? '#F00' : 0);
      ellipse((width / 2) - (fontSize * 3.5), height - (fontSize * 1.5), fontSize * .95);
      pop();

      if (frameCount % 45 === 0) {
        this.bitOn = !this.bitOn;
      }
    }

    // show app status message
    fill(this.appState === 1 ? '#4FF' : 255);
    rectMode(CORNER);
    textAlign(CENTER);
    textSize(fontSize);
    text(this.statusMessage(), width / 2, height - (fontSize * 1.15));

    // watch for cooldowns
    this.resetAppState();
  },

  /** draws the guides to use the recorder */
  drawInstructions() {
    let fontSize = height / 40;
    let startY = height * .75;
    let lineHeight = fontSize * 1.4;

    fill(140);
    textSize(fontSize);
    text('Press [P] to toggle Practice mode', width / 2, startY);
    text('Press [Enter] to log MIDI sequence', width / 2, startY + (lineHeight));
    text('Press [Escape] to clear MIDI sequence', width / 2, startY + (2 * lineHeight));
  }
}