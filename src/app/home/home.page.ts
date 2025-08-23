import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Effects, EventCard } from 'src/models/event-card.model';
import { GameService } from 'src/services/game.service';
import { StatsbarComponent } from '../statsbar/statsbar.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  cards: EventCard[] = [];
  // Preview hiệu ứng khi hover nút (hoặc chuẩn bị chọn)
  previewEffects: Effects = { health: 0, logic: 0, belief: 0, reality: 0 };
  previewDirection: 'left' | 'right' | null = null;

  highlightedStats: { [key: string]: boolean } = {};

  constructor(
    public gameService: GameService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.gameService.loadCards().subscribe(cards => {
      this.gameService.setCards(cards);
      this.loadNextCard();
    })
  }

  loadNextCard() {
    const next = this.gameService.getRandomCard();
    this.cards = [next];
  }

  trackById(index: number, item: EventCard & { uid?: string }) {
    return item.uid || item.id;  // ưu tiên uid mới tạo
  }

  onPreview(event: { direction: 'left' | 'right' | null, card: any, processOpacity: any }) {
    if (!event.direction) {
      this.highlightedStats = {}; // reset
      return;
    }

    const effects = event.card[event.direction + 'Effect'];
    // 👆 lấy ra leftEffect hoặc rightEffect tùy hướng
    
    // Lọc ra các chỉ số thay đổi
    this.highlightedStats = Object.keys(effects).reduce((acc, key) => {
      if (effects[key] !== 0) {
        acc[key] = event.processOpacity;  // đánh dấu stat này bị ảnh hưởng
      }
      return acc;
    }, {} as any);
  }

  onCardSwiped(event: { direction: 'left' | 'right' | null, card: any }, index: number) {
    if (!event.direction) return;
    
    const effects = event.card[event.direction + 'Effect'];

    this.gameService.stats.health += effects.health || 0;
    this.gameService.stats.logic += effects.logic || 0;
    this.gameService.stats.belief += effects.belief || 0;
    this.gameService.stats.reality += effects.reality || 0;


    const nextCard = {
      ...this.gameService.getRandomCard(),
      uid: Date.now().toString()  // ép unique id để tránh trùng
    };

    // tạo mảng mới => Angular chắc chắn render lại
    setTimeout(() => {
      this.cards = [
        ...this.cards.slice(0, index),
        ...this.cards.slice(index + 1),
        nextCard
      ];
      this.cdr.detectChanges(); // 👈 ép Angular render lại
    }, 100);
  }
}
