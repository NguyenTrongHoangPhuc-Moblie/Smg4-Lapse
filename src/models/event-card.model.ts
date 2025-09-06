export interface EventCard {
    id: string;
    character: string;
    image: string;
    description: string;
    leftChoice: string;
    rightChoice: string;
    leftEffect: Effects;
    rightEffect: Effects;
    isUnlocked: boolean;
    type: string;
    random: number;
    cardEvent: [];
    wasShown: boolean;
}

export interface Effects {
    health: number;
    logic: number;
    belief: number;
    reality: number;
}