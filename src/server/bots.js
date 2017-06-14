import pleasejs from 'pleasejs';

const indexOffset = 100000000; // should be enougth
const positions = {
  'tokyo': [35.6735763,139.4302101],
  'london': [51.5287352,-0.3817706],
  'berlin': [52.5070545,12.8657662],
  'abidjan': [5.3489657,-4.1199461],
  'jaipur': [26.8855469,75.5103775],
  'sydney': [-33.8458814,150.3715665],
  'wellington': [-41.2435107,174.6691524],
  'saint-petersbourg': [59.9174925,30.0448894],
  'tallinn': [59.4250083,24.4580731],
  'nairobi': [-1.3041014,36.5672141],
  'quebec': [46.8564962,-71.6262467],
  'portland': [45.542575,-122.9345964],
  'new-orleans': [30.0219414,-90.1626501],
  'rio': [-22.9089855,-44.008748],
  'santiago': [-33.4719,-70.9100062],
  'pekin': [39.9385879,115.8370567],
  'le-caire': [30.0596185,31.1884248],
};
const uuids = Object.keys(positions);
const usedIndexes = [];

class Bot {
  constructor(index, uuid, coords, experience) {
    this.isBot = true;
    this.index = index;
    this.uuid = uuid;
    this.coordinates = coords;
    this.color = pleasejs.make_color({
      colors_returned: 1,
      format: 'rgb-string',
      saturation: .75,
      value: .75,
    })[0];

    this.experience = experience;
    this.activities = {};
    this.activities[this.experience.id] = {};
    this.activities[this.experience.id].echoPlayers = new Set();

    this.triggerDropMessage = this.experience.onDropMessage(this);

    this._start = this._start.bind(this);
    this._trigger = this._trigger.bind(this);

    const startDelay = (5 + 30 * Math.random()) * 1000;
    this._startTimeoutId = setTimeout(this._start, startDelay);
  }

  _start() {
    // mimic experience.enter
    this.experience.salesman.addPoi(this.uuid, this.index, this.coordinates);
    this.experience.uuidClientMap.set(this.uuid, this);
    // don't emit 'new-player' for planet (only triggers the goto behavior)
    this._trigger();
  }

  _trigger() {
    const exp = this.experience;
    const x = Math.random();
    const y = Math.random();
    const time = exp.scheduler.syncTime;
    const dropParams = exp.mapper.getDropParams(x, y, this);

    this.triggerDropMessage(time, dropParams);
    // trigger a drop each 10..20 sec
    this._triggerTimeoutId = setTimeout(this._trigger, Math.random() * 1000 * 10 + 10 * 1000);
  }

  destroy(now = false) {
    const destroyDelay = now ? 0 : (5 + 30 * Math.random()) * 1000;

    setTimeout(() => {
      // kill all time outs
      clearTimeout(this._startTimeoutId);
      clearTimeout(this._triggerTimeoutId);

      const exp = this.experience;
      // mimic experience.exit
      exp.salesman.deletePoi(this.uuid);
      exp.uuidClientMap.delete(this.uuid);
      exp.clearEchos(this);
    }, destroyDelay);
  }
}

export function create(experience) {
  let index;

  // find an index that is stiil available
  do {
    index = Math.floor(Math.random() * uuids.length);
  } while (usedIndexes.indexOf(index) !== -1);

  usedIndexes.push(index);
  const uuid = uuids[index];
  const coords = positions[uuid];

  return new Bot(indexOffset + index, uuid, coords, experience);
}

export function destroy(bot, now) {
  bot.destroy(now);
  // realease index
  const index = bot.index - indexOffset;
  usedIndexes.splice(usedIndexes.indexOf(index), 1);
}
