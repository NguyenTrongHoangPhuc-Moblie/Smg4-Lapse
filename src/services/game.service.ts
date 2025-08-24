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

    private lastCardId: string | null = null;

    private allCards: EventCard[] = [];

    constructor(private http: HttpClient) { }

    loadCards(): Observable<EventCard[]> {
        return this.http.get<EventCard[]>('assets/event-cards/card.json');
    }

    setCards(cards: EventCard[]) {
        this.allCards = cards;
    }

    getRandomCard(): EventCard {
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

    isGameOver(): boolean {
        return Object.values(this.stats).some(val => val <= 0);
    }
}