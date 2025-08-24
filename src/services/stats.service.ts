import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatsService {
  health = new BehaviorSubject<number>(0.5);
  logic = new BehaviorSubject<number>(0.5);
  belief = new BehaviorSubject<number>(0.5);
  reality = new BehaviorSubject<number>(0.5);
  value = new BehaviorSubject<number>(0.5); 

  bufferHealth = new BehaviorSubject<number>(0.5);
  bufferLogic = new BehaviorSubject<number>(0.5);
  bufferBelief = new BehaviorSubject<number>(0.5);
  bufferReality = new BehaviorSubject<number>(0.5);

  applyEffect(effect: any) {
    this.health.next(this.health.value + (effect.health || 0));
    this.logic.next(this.logic.value + (effect.logic || 0));
    this.belief.next(this.belief.value + (effect.belief || 0));
    this.reality.next(this.reality.value + (effect.reality || 0));

    setTimeout(() => {
      this.bufferHealth.next(this.bufferHealth.value + (effect.health || 0));
      this.bufferLogic.next(this.bufferLogic.value + (effect.logic || 0));
      this.bufferBelief.next(this.bufferBelief.value + (effect.belief || 0));
      this.bufferReality.next(this.bufferReality.value + (effect.reality || 0));
    }, 400)

    console.log("Health: ", this.bufferHealth);
    console.log("Logic: ", this.bufferLogic);
    console.log("Belief: ", this.bufferBelief);
    console.log("Reality: ", this.bufferReality)
  }
}
