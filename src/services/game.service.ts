import { Injectable } from "@angular/core";
import { Effects, EventCard } from "../models/event-card.model";
import { PlayerStats } from "src/models/player-stats.model";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";


@Injectable({ providedIn: 'root' })
export class GameService {
    stats: PlayerStats = {
        health: 0.5,
        logic: 0.5,
        belief: 0.5,
        reality: 0.5,
        bufferHealth: 0.5,
        bufferLogic: 0.5,
        bufferBelief: 0.5,
        bufferReality: 0.5,
        actionHealth: 'increase',
        actionLogic: 'increase',
        actionBelief: 'increase',
        actionReality: 'increase',
    };

    private countCard: number = 0;

    private lastCardId: string | null = null;

    private allCards: EventCard[] = [];

    constructor(private http: HttpClient) { }

    loadCards(): Observable<EventCard[]> {
        return this.http.get<EventCard[]>('assets/event-cards/card.json');
    }

    setCards(cards: EventCard[]) {
        this.allCards = cards;

        const uniqueRandoms = this.getUniqueRandoms(1, this.allCards.length, this.allCards.length);

        this.allCards = this.allCards.map((card, index) => {
            if (card?.type === "special") {
                return {
                    ...card,
                    random: uniqueRandoms[index] // 20 -> 100
                };
            }
            return card;
        });
        console.log(this.allCards);
    }

    getRandomCard(): EventCard {
        // Count number card to unclock another special card
        this.countCard += 1;

        for (let c of this.allCards) {
            if (c && c.random > 0 && c.random <= this.countCard) {
                // unlock this card
                c.isUnlocked = true;

                // unlock all cards whose id is in cardEvent
                if (c.cardEvent && Array.isArray(c.cardEvent)) {
                    for (let eventId of c.cardEvent) {
                        const target = this.allCards.find(card => card?.id === eventId);
                        if (target) {
                            target.isUnlocked = true;
                        }
                    }
                }
            }
        }

        const unlocked = this.allCards.filter(c => c.isUnlocked && !c?.wasShown);
        console.log(unlocked);

        let specialIndex = unlocked.findIndex(c => c.type === "special" && !c.wasShown);

        let card;

        if(specialIndex !== -1) {
            //if special exits, take it first
            card = unlocked[specialIndex];
            card.wasShown = true;
        } else {
            // loại bỏ card cuối cùng
            let choices = unlocked.filter(c => c.id !== this.lastCardId);

            // nếu chỉ còn 1 card thì buộc phải lấy
            if (choices.length === 0) {
                choices = unlocked;
            }
            card = choices[Math.floor(Math.random() * choices.length)];
        }
        
        this.lastCardId = card.id; // lưu lại id vừa chọn
        return { ...card }; // clone để Angular nhận diện là object mới
    }

    isGameOver(): boolean {
        return Object.values(this.stats).some(val => val <= 0);
    }

    getUniqueRandoms(min: number, max: number, count: number): number[] {
        const numbers: number[] = [];

        // create array [min..max]
        for (let i = min; i <= max; i++) {
            numbers.push(i);
        }

        // shuffle the array (Fisher-Yates)
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }

        return numbers.slice(0, count); // take the first `count` numbers
    }
}