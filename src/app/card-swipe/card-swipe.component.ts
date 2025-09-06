import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { GestureController } from '@ionic/angular';
import { GameService } from 'src/services/game.service';

@Component({
  selector: 'app-card-swipe',
  templateUrl: './card-swipe.component.html',
  styleUrls: ['./card-swipe.component.scss'],
  standalone: false,
})
export class CardSwipeComponent {
  @Input() card: any;
  @Output() swiped = new EventEmitter<{ direction: 'left' | 'right' | null, card: any }>();
  @Output() preview = new EventEmitter<{ direction: 'left' | 'right' | null, card: any, processOpacity: any }>();

  @ViewChild('cardElement', { read: ElementRef }) cardElement!: ElementRef;

  startX = 0;
  startY = 0;
  leftOpacity = 0;
  rightOpacity = 0;

  constructor(
    private gestureCtrl: GestureController,
    private renderer: Renderer2,
    private zone: NgZone,
    public gameService: GameService,
  ) { }
  ngOnChanges() {
    if (this.cardElement) {
      this.renderer.setStyle(this.cardElement.nativeElement, 'transform', 'translate(0,0) rotate(0deg)');
    }
  }

  ngAfterViewInit() {
    const gesture = this.gestureCtrl.create({
      el: this.cardElement.nativeElement,
      threshold: 15,
      gestureName: 'swipe-card',
      onStart: ev => {
        // lưu lại điểm bắt đầu
        this.startX = 0;
        this.startY = 0;

        this.renderer.setStyle(this.cardElement.nativeElement, 'transition', 'none');
      },

      onMove: ev => {
        // tính delta so với điểm bắt đầu, đảm bảo lúc mới ấn giữ là 0
        const dx = ev.deltaX;
        const dy = ev.deltaY;
        const rotate = dx / 40;

        // Hiển thị mờ dần theo độ kéo
        const progress = Math.min(Math.abs(dx) / 100, 1); // max = 1

        this.zone.run(() => {
          if (dx > 0) { // kéo phải
            this.rightOpacity = progress;
            this.leftOpacity = 0;
            this.preview.emit({ direction: 'right', card: this.card, processOpacity: progress });
          } else if (dx < 0) { // kéo trái
            this.leftOpacity = progress;
            this.rightOpacity = 0;
            this.preview.emit({ direction: 'left', card: this.card, processOpacity: progress });
          } else {
            this.leftOpacity = this.rightOpacity = 0;
            this.preview.emit({ direction: null, card: this.card, processOpacity: 0 });
          }
        });


        this.renderer.setStyle(
          this.cardElement.nativeElement,
          'transform',
          `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`
        );
      },
      onEnd: ev => {
        this.zone.run(() => {
          this.leftOpacity = this.rightOpacity = 0;
          this.preview.emit({ direction: null, card: this.card, processOpacity: 0 });
        })

        const screenWidth = window.innerWidth;
        const moveOutWidth = screenWidth * 0.35; // ngưỡng quẹt
        const cardWidth = this.cardElement.nativeElement.offsetWidth;

        this.cardElement.nativeElement.style.transition = '0.5s ease-out';

        if (ev.deltaX > moveOutWidth) {
          this.startSwipe("right", this.card);
          this.cardElement.nativeElement.style.transform = `translateX(${screenWidth + cardWidth}px)`;
          this.cardElement.nativeElement.addEventListener('transitionend', () => {
            this.swiped.emit({ direction: 'right', card: this.card });
          }, { once: true });
        } else if (ev.deltaX < -moveOutWidth) {
          this.startSwipe("left", this.card);
          this.cardElement.nativeElement.style.transform = `translateX(-${screenWidth + cardWidth}px)`;
          this.cardElement.nativeElement.addEventListener('transitionend', () => {
            this.swiped.emit({ direction: 'left', card: this.card });
          }, { once: true });
        } else {
          this.cardElement.nativeElement.style.transform = '';
        }
      }
    });
    gesture.enable(true);
  }

  startSwipe(direction: 'left' | 'right', card: any) {
    const effects = card[direction + 'Effect'];

    (Object.keys(effects) as Array<'health' | 'logic' | 'belief' | 'reality'>).forEach(key => {
      const value = effects[key];
      if (value === 0) return;

      const actionKey = `action${this.capitalize(key)}` as keyof typeof this.gameService.stats;
      const bufferKey = `buffer${this.capitalize(key)}` as keyof typeof this.gameService.stats;

      // --- Increase ---
      if (value > 0) {
        (this.gameService.stats as any)[actionKey] = 'increase';

        // 1. Move buffer immediately
        this.zone.run(() => {
          (this.gameService.stats as any)[bufferKey] += value;
        });
        
        // 2. Commit real value after 400ms
        setTimeout(() => {
          this.zone.run(() => {  // 👈 force Angular update
            this.gameService.stats[key] += value;
          });
        }, 500);

        // --- Decrease ---
      } else {
        (this.gameService.stats as any)[actionKey] = 'decrease';

        // 1. Drop real value immediately
        this.zone.run(() => {
          this.gameService.stats[key] += value;
        });

        // 2. Shrink buffer after 400ms
        setTimeout(() => {
          this.zone.run(() => {
            (this.gameService.stats as any)[bufferKey] += value;
          });
        }, 500);
      }
    });
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}