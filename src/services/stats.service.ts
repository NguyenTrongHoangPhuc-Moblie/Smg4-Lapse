import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatsService {
  health = new BehaviorSubject<number>(50);
  logic = new BehaviorSubject<number>(50);
  belief = new BehaviorSubject<number>(50);
  reality = new BehaviorSubject<number>(50);
  value = new BehaviorSubject<number>(50); 

  applyEffect(effect: any) {
    this.health.next(this.health.value + (effect.health || 0));
    this.logic.next(this.logic.value + (effect.logic || 0));
    this.belief.next(this.belief.value + (effect.belief || 0));
    this.reality.next(this.reality.value + (effect.reality || 0));
  }
}
