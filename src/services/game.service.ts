import { Injectable } from "@angular/core";
import { Effects, EventCard } from "../models/event-card.model";
import { PlayerStats } from "src/models/player-stats.model";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class GameService {
    stats: PlayerStats = {
        health: 50,
        logic: 50,
        belief: 50,
        reality: 50,
    };

    private lastCardId: string | null = null;

    private allCards: EventCard[] = [];

    constructor(private http: HttpClient) { }

    loadCards(): Observable<EventCard[]> {
        return this.http.get<EventCard[]>('assets/event-cards/card.json');
    }

    setCards(cards: EventCard[]) {
        console.log(cards);
        this.allCards = cards;
    }

    getRandomCard(): EventCard {
        console.log("Nạp thẻ");
        const unlocked = this.allCards.filter(c => c.isUnlocked);

        // loại bỏ card cuối cùng
        let choices = unlocked.filter(c => c.id !== this.lastCardId);

        // nếu chỉ còn 1 card thì buộc phải lấy
        if (choices.length === 0) {
            choices = unlocked;
        }

        const card = choices[Math.floor(Math.random() * choices.length)];
        this.lastCardId = card.id; // lưu lại id vừa chọn
        return { ...card }; // clone để Angular nhận diện là object mới
    }

    applyEffect(effect: Effects) {
        this.stats.health += effect.health;
        this.stats.logic += effect.logic;
        this.stats.belief += effect.belief;
        this.stats.reality += effect.reality;
    }

    isGameOver(): boolean {
        return Object.values(this.stats).some(val => val <= 0);
    }
}