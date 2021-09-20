const chordDetector = {
  /** holds the current chord being played */
  currentChord: '',
  currentDescription: '',

  /** base scale */
  baseScale: {
    'A': 1,
    'A#': 1.5,
    'B': 2,
    'C': 2.5,
    'C#': 3,
    'D': 4,
    'D#': 4.5,
    'E': 5,
    'F': 5.5,
    'F#': 6,
    'G': 6.5,
    'G#': 7
  },

  /** chords */
  chords: {
    '1 3 5': ['', 'Major'],
    '1 2.5 5': ['m', 'Minor'],
    '1 3 5 6.5': ['7', '7th '],
    '1 3 5 7': ['maj7', 'Major 7th'],
    '1 2.5 5 6.5': ['m7', 'Minor 7th'],
    '1 3 5 6': ['6', '6th'],
    '1 2.5 5 6': ['m6', 'Minor 6th'],
    '1 2.5 4.5': ['dim', 'Diminished'],
    '1 2.5 4.5 6.5': ['m7b5', 'Half diminished 7th'],
    '1 3 5.5': ['aug', 'Augmented'],
    '1 3 5 6.5 9': ['9', '9th'],
    '1 3 5 6.5 9.5': ['7#9', '7th #9'],
    '1 3 5 7 9': ['maj9', 'Major 9th'],
    '1 2.5 5 6.5 9': ['m9', 'Minor 9th'],
    '1 2 3 5': ['add2', 'Added 2nd'],
    '1 3 5 9': ['add9', 'Added 9th'],
    '1 2.5 5 9': ['madd9', 'Minor add 9th'],
    '1 5 6.5 9 11': ['11', '11th'],
    '1 3 5 6.5 9 11': ['11', '11th'],
    '1 2.5 5 6.5 9 11': ['m11', 'Minor 11th'],
    '1 3 5 6.5 9 13': ['13', '13th'],
    '1 3 5 6.5 9 11 13': ['13', '13th'],
    '1 3 5 7 9 13': ['maj13', 'Major 13th'],
    '1 3 5 7 9 11 13': ['maj13', 'Major 13th'],
    '1 2.5 5 6.5 9 11 13': ['m13', 'Minor 13th'],
    '1 4 5': ['sus', 'Suspended 4th'],
    '1 2 5': ['sus2', 'Suspended 2nd'],
    '1 5': ['5', '5th (power chord)']
  },

  /** detects the current chord being played */
  detectChord(notes = []) {
    if (!notes.length) {
      this.clearCurrentChord();
      return;
    }

    // break up the keys and their respective octaves
    const keysAndOctaves = notes.map((note) => {
      const key = note.match(/[A-G\#]/g).join('');
      const octave = +note.match(/\d+/g).join('');
      return { key, octave };
    });

    // find root & chord structure
    const root = this.findLowest(keysAndOctaves);
    const transposedScale = this.transpose(root.key);
    const positions = this.getChordStructure(keysAndOctaves, transposedScale);

    // try and find a chord based on our structure
    const chord = this.chords[positions.join(' ')];
    if (chord) {
      this.setCurrentChord(root.key, chord);
    } else {
      const swappedChord = this.findSwappedChord(positions);
      if (swappedChord) {
        this.setCurrentChord(root.key, swappedChord);
        return;
      }

      // try inversions
      const inversion = this.findInversion(positions, transposedScale, keysAndOctaves);
      if (inversion) {
        this.setCurrentChord(inversion.root, inversion.chord);
        return;
      }

      this.clearCurrentChord();
    }
  },

  /** attempts to swap values greater than 7 to find a chord */
  findSwappedChord(positions) {
    // swap >7 values
    const rawSwapped = positions
      .map((pos) => +pos > 7 ? (pos % 7) || 7 : +pos);

    const swapped = this.removeDuplicates(rawSwapped)
      .sort((a, b) => a - b);

    const swappedChord = this.chords[swapped.join(' ')];
    return swappedChord;
  },

  /** assigns the current chord & description */
  setCurrentChord(root, chord) {
    this.currentChord = root + chord[0];
    this.currentDescription = root + ' ' + chord[1];
  },

  /** clears the current chord */
  clearCurrentChord() {
    this.currentChord = '';
    this.currentDescription = '';
  },

  /** attempts to find an inversion given keys */
  findInversion(positions, transposedScale, keysAndOctaves) {
    for (let i = 1; i < positions.length; i++) {
      let newRootIndex = Object.values(transposedScale).indexOf((+positions[i] % 7) || 7);
      let newRoot = Object.keys(transposedScale)[newRootIndex];
      let newTransposedScale = this.transpose(newRoot);
      let newPositions = this.getChordStructure(keysAndOctaves, newTransposedScale);
      let newChord = this.chords[newPositions.join(' ')];
      if (newChord) {
        return { root: newRoot, chord: newChord };
      }
    }
  },

  /** transposes the base scale to the given root */
  transpose(root) {
    const keys = Object.keys(this.baseScale);
    const transposeIndex = keys.findIndex((key) => key === root);
    const transposedScale = {};
    const transposedKeys = [...keys.slice(transposeIndex), ...keys.slice(0, transposeIndex)];
    transposedKeys.forEach((key, index) => {
      transposedScale[key] = Object.values(this.baseScale)[index];
    });

    return transposedScale;
  },

  /** find the lowest octave in the chord */
  findMinOctave(keysAndOctaves) {
    return keysAndOctaves.reduce((prev, curr) => {
      return prev.octave < curr.octave ? prev : curr;
    }).octave;
  },

  /** finds the lowest note in a chord (assuming not an inversion) */
  findLowest(keysAndOctaves) {
    const minOctave = this.findMinOctave(keysAndOctaves);

    // find the root in the chord
    const root = keysAndOctaves
      .map((ko) => {
        return {
          position: this.baseScale[ko.key] + ((ko.octave - minOctave) * 7),
          key: ko.key
        };
      })
      .reduce((prev, curr) => prev.position < curr.position ? prev : curr);

    return root;
  },

  /** obtains the positional chord structure from given ko & scale */
  getChordStructure(keysAndOctaves, scale) {
    const minOctave = this.findMinOctave(keysAndOctaves);

    // find the new positions in this scale
    let positions = keysAndOctaves.map((ko) =>
      scale[ko.key] + ((ko.octave - minOctave) * 7)
    );

    // filter out weirdness
    [...positions].forEach((pos, index) => {
      if (pos > 13) {
        let p = pos % 7;
        positions[index] = p ? 7 + p > 13 ? p : 7 + p : 7;
      } else if (pos <= 13 && pos > 7 && ![9, 11, 13].includes(pos)) {
        positions[index] = (pos % 7) || 7;
      }
    });

    return this.removeDuplicates(positions)
      .filter(p => p !== 8)
      .sort((a, b) => a - b);
  },

  /** removes duplicate items from an array */
  removeDuplicates(array) {
    const noDuplicates = {};
    array.forEach((item) => {
      noDuplicates[item] = null;
    });

    return Object.keys(noDuplicates);
  },

  /** draws current chord to the canvas */
  draw() {
    let fontSize = Math.max(height / 10, width / 20);

    fill(255);
    textSize(fontSize);
    rectMode(CENTER);
    textAlign(CENTER);
    text(this.currentChord, width / 2, height / 2);

    fill(140);
    textSize(fontSize * .25);
    text(this.currentDescription, width / 2, (height / 2) + (fontSize / 2));
  },
}