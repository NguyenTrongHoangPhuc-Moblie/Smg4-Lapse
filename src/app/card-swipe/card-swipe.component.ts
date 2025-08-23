import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { GestureController } from '@ionic/angular';
import { StatsService } from 'src/services/stats.service';

@Component({
  selector: 'app-card-swipe',
  templateUrl: './card-swipe.component.html',
  styleUrls: ['./card-swipe.component.scss'],
  standalone: false,
})
export class CardSwipeComponent {
  @Input() card: any;
  @Output() swiped = new EventEmitter<{direction: 'left' | 'right' | null, card: any}>();
  @Output() preview = new EventEmitter<{direction: 'left' | 'right' | null, card: any, processOpacity: any}>();

  @ViewChild('cardElement', { read: ElementRef }) cardElement!: ElementRef;

  startX = 0;
  startY = 0;
  leftOpacity = 0;
  rightOpacity = 0;

  constructor(
    private gestureCtrl: GestureController,
    private renderer: Renderer2,
    private zone: NgZone,
    private statsService: StatsService
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
            this.preview.emit({direction: 'right', card: this.card, processOpacity: progress});
          } else if (dx < 0) { // kéo trái
            this.leftOpacity = progress;
            this.rightOpacity = 0;
            this.preview.emit({direction: 'left', card: this.card, processOpacity: progress});
          } else {
            this.leftOpacity = this.rightOpacity = 0;
            this.preview.emit({direction: null, card: this.card, processOpacity: 0});
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
          this.preview.emit({direction: null, card: this.card, processOpacity: 0});
        })
        
        const screenWidth = window.innerWidth;
        const moveOutWidth = screenWidth * 0.35; // ngưỡng quẹt
        const cardWidth = this.cardElement.nativeElement.offsetWidth;

        this.cardElement.nativeElement.style.transition = '0.5s ease-out';

        if (ev.deltaX > moveOutWidth) {
          const effects = this.card['right' + 'Effect'];
          this.cardElement.nativeElement.addEventListener('transitionend', () => {
            this.swiped.emit({direction: 'right', card: this.card});
          }, { once: true });
          this.statsService.applyEffect(effects);
          this.cardElement.nativeElement.style.transform = `translateX(${screenWidth + cardWidth}px)`;
          
        } else if (ev.deltaX < -moveOutWidth) {
          const effects = this.card['left' + 'Effect'];
          this.cardElement.nativeElement.addEventListener('transitionend', () => {
            this.swiped.emit({direction: 'left', card: this.card});
          }, { once: true });
          this.statsService.applyEffect(effects);
          //this.renderer.setStyle(this.cardElement.nativeElement, 'transform', `translateX(-${window.innerWidth}px)`);
          this.cardElement.nativeElement.style.transform = `translateX(-${screenWidth + cardWidth}px)`;
          
        } else {
          //this.renderer.setStyle(this.cardElement.nativeElement, 'transform', '');
          this.cardElement.nativeElement.style.transform = '';
        }
      }
    });
    gesture.enable(true);
  }

  startSwipe(direction: 'left' | 'right') {
    const cardEl = this.cardElement.nativeElement;

    cardEl.style.transition = 'transform 0.6s ease-out';
    cardEl.style.transform = `translateX(${direction === 'left' ? '-150℅' : '-150%'}) rotate(${direction})`
  }
}