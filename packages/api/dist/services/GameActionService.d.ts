import { GameState, AttackResult } from '@world-battle/engine';
/**
 * Placement for reinforcement armies
 */
export interface ArmyPlacement {
    territoryId: string;
    armies: number;
}
/**
 * Service for executing game actions
 */
export declare class GameActionService {
    /**
     * Validate that it's the player's turn
     */
    private validatePlayerTurn;
    /**
     * Validate game phase
     */
    private validatePhase;
    /**
     * Check if a player is eliminated and handle elimination
     */
    private checkPlayerElimination;
    /**
     * Award card to player if they conquered a territory this turn
     */
    private awardCardIfEligible;
    /**
     * Trade in cards for reinforcement armies
     */
    tradeCards(gameId: string, playerId: string, cardIds: string[]): GameState;
    /**
     * Place reinforcement armies on territories
     */
    placeReinforcements(gameId: string, playerId: string, placements: ArmyPlacement[]): GameState;
    /**
     * Get reinforcement information for current player
     */
    getReinforcementInfo(gameId: string, playerId: string): {
        territoryBonus: number;
        continentBonus: number;
        cardBonus: number;
        total: number;
        reinforcementsRemaining: number;
        controlledContinents: Array<{
            id: string;
            name: string;
            bonus: number;
        }>;
        canTradeCards: boolean;
        mustTradeCards: boolean;
        possibleCardSets: string[][];
    };
    /**
     * End reinforcement phase and move to attack phase
     */
    endReinforcementPhase(gameId: string, playerId: string): GameState;
    /**
     * Execute a single attack
     */
    attack(gameId: string, playerId: string, fromTerritoryId: string, toTerritoryId: string): {
        game: GameState;
        attackResult: AttackResult;
    };
    /**
     * Execute auto-attack (attack until conquest or can't attack)
     */
    autoAttack(gameId: string, playerId: string, fromTerritoryId: string, toTerritoryId: string): {
        game: GameState;
        attackResult: AttackResult;
    };
    /**
     * Move armies after conquest
     */
    moveArmies(gameId: string, playerId: string, fromTerritoryId: string, toTerritoryId: string, armies: number): GameState;
    /**
     * End attack phase and move to fortify phase
     */
    endAttackPhase(gameId: string, playerId: string): GameState;
    /**
     * Fortify - move armies between owned territories
     */
    fortify(gameId: string, playerId: string, fromTerritoryId: string, toTerritoryId: string, armies: number): GameState;
    /**
     * Check if two territories are connected through player's own territories
     */
    private areTerritoriesConnected;
    /**
     * End turn and progress to next player
     */
    endTurn(gameId: string, playerId: string): GameState;
}
export declare const gameActionService: GameActionService;
