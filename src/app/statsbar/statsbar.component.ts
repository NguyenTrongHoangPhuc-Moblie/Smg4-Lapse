import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Effects } from 'src/models/event-card.model';
import { GameService } from 'src/services/game.service';

@Component({
  selector: 'app-statsbar',
  templateUrl: './statsbar.component.html',
  styleUrls: ['./statsbar.component.scss'],
  standalone: false,
})
export class StatsbarComponent implements OnChanges {
  @Input() highlightedStats: { [key: string]: boolean } = {};

  // Theo dõi hiệu ứng thay đổi gần nhất
  current: any;
  previous: any;

  constructor(
    public gameService: GameService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    //console.log('HighlightedStats:', this.gameService.stats);
    if (changes['highlightedStats'] && !changes['highlightedStats'].firstChange) {
      this.current = changes['highlightedStats']?.currentValue;
      this.previous = changes['highlightedStats']?.previousValue;
    }

    // Commit: khi giá trị thật đổi, mới animate thanh
  }
}
