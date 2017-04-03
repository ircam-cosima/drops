class Mapper {
  constructor(metricScheduler) {
    this.metricScheduler = metricScheduler;

    this.min = 60;
    this.max = 72;

    this.patterns = [
      [62, 64, 67, 69, 72],
      [62, 64, 67, 69, 71],
      [62, 64, 66, 69, 71],
      [61, 64, 66, 69, 71],
      [61, 64, 66, 68, 71],
      [61, 63, 66, 68, 71],
      [61, 63, 66, 68, 70],
      [61, 63, 65, 68, 70],
      [60, 63, 65, 68, 70],
      [60, 63, 65, 67, 70],
      [60, 62, 65, 67, 70],
      [60, 62, 65, 67, 69],
    ];

    this.nbrPatterns = this.patterns.length;
    this.patternSize = 5;

    this._forcePattern = null;
  }

  // debug mode
  set forcePattern(value) {
    if (value === 'off')
      this._forcePattern = null;
    else
      this._forcePattern = value;
  }

  getDropParams(x, y, client) {
    const invY = 1 - y;
    const currentPosition = this.metricScheduler.currentPosition;
    const mod = currentPosition % this.nbrPatterns;

    let patternIndex;
    let cyclePhase;

    if (this._forcePattern === null) {
      patternIndex = Math.floor(mod);
      cyclePhase = mod / this.patternSize;
    } else {
      patternIndex = this._forcePattern;
      cyclePhase =  this._forcePattern / this.patternSize;
    }

    const decayY = cyclePhase * (1 / this.patternSize);
    const pitchIndex = Math.floor(invY * this.patternSize + decayY);
    let midiKey;

    if (pitchIndex < this.patternSize)
      midiKey = this.patterns[patternIndex][pitchIndex];
    else
      midiKey = this.patterns[patternIndex][0] + 12;

    return {
      index: client.index,
      x: x,
      y: y,
      midiKey: midiKey,
      color: client.color,
      gain: 1,
    };
  }
}

export default Mapper;
