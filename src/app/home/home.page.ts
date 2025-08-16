import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Effects, EventCard } from 'src/models/event-card.model';
import { GameService } from 'src/services/game.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private allCards: EventCard[] = [];
  // cards = [
  //   { title: 'Card 1', description: 'Nội dung thẻ 1' },
  //   { title: 'Card 2', description: 'Nội dung thẻ 2' },
  //   { title: 'Card 3', description: 'Nội dung thẻ 3' }
  // ];
  cards: EventCard[] = [];
  // Theo dõi hiệu ứng thay đổi gần nhất
  lastChange: Effects = { health: 0, logic: 0, belief: 0, reality: 0 };

  // Preview hiệu ứng khi hover nút (hoặc chuẩn bị chọn)
  previewEffects: Effects = { health: 0, logic: 0, belief: 0, reality: 0 };


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

  onCardSwiped(direction: 'left' | 'right', index: number) {
    console.log(`Card ${index} swiped ${direction}`);
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
