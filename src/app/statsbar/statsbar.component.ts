import { Component, ElementRef, Input, NgZone, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Effects } from 'src/models/event-card.model';
import { GameService } from 'src/services/game.service';
import { StatsService } from 'src/services/stats.service';

@Component({
  selector: 'app-statsbar',
  templateUrl: './statsbar.component.html',
  styleUrls: ['./statsbar.component.scss'],
  standalone: false,
})
export class StatsbarComponent implements OnChanges {
  @Input() health: number = 50;
  @Input() logic: number = 50;
  @Input() belief: number = 50;
  @Input() reality: number = 50;
  @Input() value: number = 50;   // giá trị hiện tại (0-100)
  @Input() highlightedStats: { [key: string]: boolean } = {};
  @Input() label: string = '';
  @ViewChild('healthBar') healthBar!: ElementRef;
  oldValue: number = 50;

  // Theo dõi hiệu ứng thay đổi gần nhất
  lastChange: Effects = { health: 0, logic: 0, belief: 0, reality: 0 };

  healthOpacity = 0;
  logicOpacity = 0;
  beliefOpacity = 0;
  realityOpacity = 0;

  current: any;
  previous: any;

  effects: Record<'health'|'logic'|'belief'|'reality', 'increase'|'decrease'|null> = {
    health: null, logic: null, belief: null, reality: null
  };

  private clearTimers: Record<string, any> = {};

  constructor(
    public gameService: GameService,
    public stats: StatsService,
    private zone: NgZone,
    private elRef: ElementRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    
    if (changes['highlightedStats'] && !changes['highlightedStats'].firstChange) {
      this.current = changes['highlightedStats']?.currentValue;
      this.previous = changes['highlightedStats']?.previousValue;

      //console.log('Current:', this.current);
      //console.log('Previous:', this.previous);

      //this.effect = newValue > this.oldValue ? 'increase' : 'decrease';

      // Lặp qua các key để biết stat nào thay đổi
      Object.keys(this.current).forEach(key => {
        if (this.current[key] !== (this.previous?.[key] ?? 0)) {
          if (this.current[key] > (this.previous?.[key] ?? 0)) {
            //console.log(`${key} tăng`);
            // hiệu ứng tăng
          } else {
            //console.log(`${key} giảm`);
            // hiệu ứng giảm
          }
        }
      });
    }

    // Commit: khi giá trị thật đổi, mới animate thanh
    const keys: Array<'health'|'logic'|'belief'|'reality'> = ['health','logic','belief','reality'];
    for (const k of keys) {
      if (changes["highlightedStats"]?.currentValue[k] && !changes["highlightedStats"]?.firstChange) {
        const prev = changes["highlightedStats"]?.previousValue[k] ?? 0;
        const curr = changes["highlightedStats"]?.currentValue[k] ?? 0;
        // this.effects[k] = curr > prev ? 'increase' : 'decrease';
        // clearTimeout(this.clearTimers[k]);
        // this.clearTimers[k] = setTimeout(() => this.effects[k] = null, 600);
        const type: 'increase'|'decrease' = curr > prev ? 'increase' : 'decrease';
        this.startEffect(k, type);
      }
    }
  }

  // 🔹 Hàm này thay cho setTimeout
  startEffect(key: 'health'|'logic'|'belief'|'reality', type: 'increase'|'decrease') {
    this.effects[key] = type;
    const el = this.healthBar.nativeElement;
    if (el) {
      const handler = () => {
        this.effects[key] = null;
        el.removeEventListener('transitionend', handler);
      };
      el.addEventListener('transitionend', handler);
    }
  }

}
