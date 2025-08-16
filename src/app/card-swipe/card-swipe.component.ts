import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { GestureController } from '@ionic/angular';

@Component({
  selector: 'app-card-swipe',
  templateUrl: './card-swipe.component.html',
  styleUrls: ['./card-swipe.component.scss'],
  standalone: false,
})
export class CardSwipeComponent {
  @Input() card: any;
  @Output() swiped = new EventEmitter<"left" | "right">();

  @ViewChild('cardElement', { read: ElementRef }) cardElement!: ElementRef;

  private startX = 0;
  private startY = 0;

  constructor(
    private gestureCtrl: GestureController,
    private renderer: Renderer2
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

        this.renderer.setStyle(
          this.cardElement.nativeElement,
          'transform',
          `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`
        );
      },
      onEnd: ev => {
        const dx = ev.deltaX - this.startX;
        const screenWidth = window.innerWidth;
        const moveOutWidth = screenWidth * 0.35; // ngưỡng quẹt
        const cardWidth = this.cardElement.nativeElement.offsetWidth;

        this.cardElement.nativeElement.style.transition = '0.5s ease-out';

        if (ev.deltaX > moveOutWidth) {
          //this.renderer.setStyle(this.cardElement.nativeElement, 'transform', `translateX(${window.innerWidth}px)`);

          this.cardElement.nativeElement.style.transform = `translateX(${screenWidth + cardWidth}px)`;
          this.cardElement.nativeElement.addEventListener('transitionend', () => {
            this.swiped.emit('right');
          }, { once: true });
        } else if (ev.deltaX < -moveOutWidth) {
          //this.renderer.setStyle(this.cardElement.nativeElement, 'transform', `translateX(-${window.innerWidth}px)`);
          this.cardElement.nativeElement.style.transform = `translateX(-${screenWidth + cardWidth}px)`;
          this.cardElement.nativeElement.addEventListener('transitionend', () => {
            this.swiped.emit('left');
          }, { once: true });
        } else {
          //this.renderer.setStyle(this.cardElement.nativeElement, 'transform', '');
          this.cardElement.nativeElement.style.transform = '';
        }
      }
    });
    gesture.enable(true);
  }
}
