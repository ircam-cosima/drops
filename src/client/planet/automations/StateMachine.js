import { audioContext } from 'soundworks/client';

import FollowPath from './FollowPath';
import Goto from './Goto';
import RandomPath from './RandomPath';
import Stop from './Stop';


// @todo - states should emit an 'ended' event and handle their duration alone
class StateMachine {
  constructor(planet, defaultScale, scaleExtent) {
    this.planet = planet;
    this.scaleExtent = scaleExtent;
    this.states = {
      'random-path': new RandomPath(this.planet, defaultScale, scaleExtent),
      'follow-path': new FollowPath(this.planet, defaultScale, scaleExtent),
      'stop': new Stop(this.planet, defaultScale, scaleExtent),
      'goto': new Goto(this.planet, defaultScale, scaleExtent),
    }

    this.currentState = null;
    this.lastInteractionTime = audioContext.currentTime;

    this.trigger = this.trigger.bind(this);

    for (let name in this.states)
      this.states[name].addListener('ended', this.trigger);
  }

  suspend() {
    this.trigger(null);
    this.lastInteractionTime = audioContext.currentTime;
  }

  trigger(stateName, ...args) {
    console.log(`%ctrigger "${stateName}"`, 'color: green');
    const now = audioContext.currentTime;

    if (this.currentState !== null)
      this.currentState.exit();

    if (stateName !== null && this.states[stateName]) {
      this.currentState = this.states[stateName];

      switch (stateName) {
        case 'follow-path':
          this.currentState.enter(this.planet.path);
          break;
        case 'goto':
          // cannot call goto more than every 10 minutes
          if (now - this.currentState.lastEntered > 10 * 60)
            this.currentState.enter(now, args[0]);
          else
            this.getNewState();
          break;
        default:
          this.currentState.enter();
          break;
      }

    } else {
      this.currentState = null;
    }
  }

  // @todo important - don't trigger follow-path if planet.path is null or empty
  getNewState() {
    const rand = Math.random();

    if (rand < 0.5 && this.planet.path && this.planet.path.length > 1)
      this.trigger('follow-path');
    else
      this.trigger('random-path');
  }

  update(dt, projection) {
    const now = audioContext.currentTime;

    if (this.currentState === null && now - this.lastInteractionTime > 5)
      this.getNewState();

    if (this.currentState)
      this.currentState.update(dt, projection);
  }

  debugRender(...args) {
    if (this.currentState)
      this.currentState.debugRender(...args);
  }
}

export default StateMachine;
