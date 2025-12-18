"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameActionService = exports.GameActionService = void 0;
const engine_1 = require("@world-battle/engine");
const GameStore_1 = require("./GameStore");
/**
 * Service for executing game actions
 */
class GameActionService {
    /**
     * Validate that it's the player's turn
     */
    validatePlayerTurn(game, playerId) {
        const currentPlayer = (0, engine_1.getCurrentPlayer)(game);
        if (!currentPlayer || currentPlayer.id !== playerId) {
            throw new Error('Not your turn');
        }
    }
    /**
     * Validate game phase
     */
    validatePhase(game, expectedPhase) {
        if (game.phase !== expectedPhase) {
            throw new Error(`Invalid phase. Expected ${expectedPhase}, but game is in ${game.phase}`);
        }
    }
    /**
     * Check if a player is eliminated and handle elimination
     */
    checkPlayerElimination(game) {
        for (const player of game.players) {
            if (player.isEliminated)
                continue;
            const territories = (0, engine_1.getPlayerTerritories)(game, player.id);
            if (territories.length === 0) {
                player.isEliminated = true;
                return player.id;
            }
        }
        return null;
    }
    /**
     * Award card to player if they conquered a territory this turn
     */
    awardCardIfEligible(game, playerId) {
        if (!game.currentTurn || !game.currentTurn.conqueredTerritoryThisTurn) {
            return;
        }
        // Draw a card from the deck
        const result = engine_1.DeckManager.drawCard(game.deck);
        if (!result.card) {
            return; // No cards left
        }
        game.deck = result.remainingDeck;
        // Give card to player
        const player = game.players.find(p => p.id === playerId);
        if (player) {
            player.cards.push(result.card);
        }
    }
    /**
     * Trade in cards for reinforcement armies
     */
    tradeCards(gameId, playerId, cardIds) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.REINFORCE);
        // Get player
        const player = game.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Player not found');
        }
        // Trade cards
        const result = engine_1.CardTradeInManager.tradeInCards(player, cardIds);
        if (!result.success) {
            throw new Error(result.error || 'Failed to trade cards');
        }
        // Update player's cards
        player.cards = result.remainingCards;
        // Add armies to reinforcements
        if (game.currentTurn) {
            game.currentTurn.reinforcementsRemaining += result.armiesAwarded;
        }
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
    /**
     * Place reinforcement armies on territories
     */
    placeReinforcements(gameId, playerId, placements) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.REINFORCE);
        if (!game.currentTurn) {
            throw new Error('No active turn');
        }
        // Validate placements
        if (!placements || placements.length === 0) {
            throw new Error('No placements provided');
        }
        // Calculate total armies to place
        const totalArmiesToPlace = placements.reduce((sum, p) => sum + p.armies, 0);
        // Check if player has enough reinforcements
        if (totalArmiesToPlace > game.currentTurn.reinforcementsRemaining) {
            throw new Error(`Not enough reinforcements. Trying to place ${totalArmiesToPlace} but only have ${game.currentTurn.reinforcementsRemaining}`);
        }
        // Validate and apply each placement
        for (const placement of placements) {
            if (placement.armies < 1) {
                throw new Error('Must place at least 1 army');
            }
            const territory = (0, engine_1.getTerritoryState)(game, placement.territoryId);
            if (!territory) {
                throw new Error(`Territory ${placement.territoryId} not found`);
            }
            if (territory.occupiedBy !== playerId) {
                throw new Error(`You do not own territory ${placement.territoryId}`);
            }
            // Place armies
            territory.armies += placement.armies;
        }
        // Deduct reinforcements
        game.currentTurn.reinforcementsRemaining -= totalArmiesToPlace;
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
    /**
     * Get reinforcement information for current player
     */
    getReinforcementInfo(gameId, playerId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        const player = game.players.find(p => p.id === playerId);
        if (!player) {
            throw new Error('Player not found');
        }
        const breakdown = engine_1.ReinforcementCalculator.getReinforcementBreakdown(game, playerId);
        // Calculate card bonus (if any cards were traded this turn)
        let cardBonus = 0;
        if (game.currentTurn) {
            // Card bonus is difference between total reinforcements and calculated base
            const baseReinforcements = breakdown.total;
            const currentTotal = game.currentTurn.reinforcementsRemaining +
                (breakdown.total - game.currentTurn.reinforcementsRemaining);
            cardBonus = currentTotal - baseReinforcements;
        }
        return {
            territoryBonus: breakdown.territoryBonus,
            continentBonus: breakdown.continentBonus,
            cardBonus,
            total: breakdown.total,
            reinforcementsRemaining: game.currentTurn?.reinforcementsRemaining || 0,
            controlledContinents: breakdown.controlledContinents,
            canTradeCards: engine_1.CardTradeInManager.canTradeIn(player),
            mustTradeCards: engine_1.CardTradeInManager.mustTradeIn(player),
            possibleCardSets: engine_1.CardTradeInManager.getPossibleTradeSets(player)
        };
    }
    /**
     * End reinforcement phase and move to attack phase
     */
    endReinforcementPhase(gameId, playerId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.REINFORCE);
        if (!game.currentTurn) {
            throw new Error('No active turn');
        }
        // Check if all reinforcements placed
        if (game.currentTurn.reinforcementsRemaining > 0) {
            throw new Error(`Must place all reinforcements. ${game.currentTurn.reinforcementsRemaining} armies remaining`);
        }
        // Check if must trade cards
        const player = game.players.find(p => p.id === playerId);
        if (player && engine_1.CardTradeInManager.mustTradeIn(player)) {
            throw new Error('Must trade in cards before ending reinforcement phase');
        }
        // Move to attack phase
        game.phase = engine_1.GamePhase.ATTACK;
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
    /**
     * Execute a single attack
     */
    attack(gameId, playerId, fromTerritoryId, toTerritoryId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.ATTACK);
        // Execute attack using battle resolver
        const attackResult = engine_1.BattleResolver.executeSingleAttack(game, fromTerritoryId, toTerritoryId, playerId);
        if (!attackResult.success) {
            throw new Error(attackResult.error || 'Attack failed');
        }
        // Mark territory conquered if successful
        if (attackResult.territoryConquered && game.currentTurn) {
            game.currentTurn.conqueredTerritoryThisTurn = true;
        }
        // Check for player elimination
        const eliminatedPlayerId = this.checkPlayerElimination(game);
        if (eliminatedPlayerId) {
            // Transfer eliminated player's cards to attacker
            const eliminatedPlayer = game.players.find(p => p.id === eliminatedPlayerId);
            const attackingPlayer = game.players.find(p => p.id === playerId);
            if (eliminatedPlayer && attackingPlayer) {
                attackingPlayer.cards.push(...eliminatedPlayer.cards);
                eliminatedPlayer.cards = [];
            }
        }
        // Check for victory
        const activePlayers = game.players.filter(p => !p.isEliminated);
        if (activePlayers.length === 1) {
            game.phase = engine_1.GamePhase.GAME_OVER;
            game.winner = activePlayers[0].id;
        }
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return { game, attackResult };
    }
    /**
     * Execute auto-attack (attack until conquest or can't attack)
     */
    autoAttack(gameId, playerId, fromTerritoryId, toTerritoryId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.ATTACK);
        // Execute auto-attack using battle resolver
        const attackResult = engine_1.BattleResolver.executeAutoAttack(game, fromTerritoryId, toTerritoryId, playerId);
        if (!attackResult.success) {
            throw new Error(attackResult.error || 'Auto-attack failed');
        }
        // Mark territory conquered if successful
        if (attackResult.territoryConquered && game.currentTurn) {
            game.currentTurn.conqueredTerritoryThisTurn = true;
        }
        // Check for player elimination
        const eliminatedPlayerId = this.checkPlayerElimination(game);
        if (eliminatedPlayerId) {
            // Transfer eliminated player's cards to attacker
            const eliminatedPlayer = game.players.find(p => p.id === eliminatedPlayerId);
            const attackingPlayer = game.players.find(p => p.id === playerId);
            if (eliminatedPlayer && attackingPlayer) {
                attackingPlayer.cards.push(...eliminatedPlayer.cards);
                eliminatedPlayer.cards = [];
            }
        }
        // Check for victory
        const activePlayers = game.players.filter(p => !p.isEliminated);
        if (activePlayers.length === 1) {
            game.phase = engine_1.GamePhase.GAME_OVER;
            game.winner = activePlayers[0].id;
        }
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return { game, attackResult };
    }
    /**
     * Move armies after conquest
     */
    moveArmies(gameId, playerId, fromTerritoryId, toTerritoryId, armies) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.ATTACK);
        // Move armies using battle resolver
        const result = engine_1.BattleResolver.moveArmiesAfterConquest(game, fromTerritoryId, toTerritoryId, armies);
        if (!result.success) {
            throw new Error(result.error || 'Failed to move armies');
        }
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
    /**
     * End attack phase and move to fortify phase
     */
    endAttackPhase(gameId, playerId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.ATTACK);
        // Award card if player conquered a territory this turn
        this.awardCardIfEligible(game, playerId);
        // Move to fortify phase
        game.phase = engine_1.GamePhase.FORTIFY;
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
    /**
     * Fortify - move armies between owned territories
     */
    fortify(gameId, playerId, fromTerritoryId, toTerritoryId, armies) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        this.validatePhase(game, engine_1.GamePhase.FORTIFY);
        // Validate armies
        if (armies < 1) {
            throw new Error('Must move at least 1 army');
        }
        // Get territories
        const fromTerritory = (0, engine_1.getTerritoryState)(game, fromTerritoryId);
        const toTerritory = (0, engine_1.getTerritoryState)(game, toTerritoryId);
        if (!fromTerritory || !toTerritory) {
            throw new Error('Territory not found');
        }
        // Validate ownership
        if (fromTerritory.occupiedBy !== playerId || toTerritory.occupiedBy !== playerId) {
            throw new Error('You must own both territories');
        }
        // Validate army count
        if (fromTerritory.armies <= armies) {
            throw new Error('Must leave at least 1 army in source territory');
        }
        // Check if territories are connected (owned territories form a path)
        if (!this.areTerritoriesConnected(game, playerId, fromTerritoryId, toTerritoryId)) {
            throw new Error('Territories must be connected through your own territories');
        }
        // Move armies
        fromTerritory.armies -= armies;
        toTerritory.armies += armies;
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
    /**
     * Check if two territories are connected through player's own territories
     */
    areTerritoriesConnected(game, playerId, fromTerritoryId, toTerritoryId) {
        // BFS to find path through owned territories
        const visited = new Set();
        const queue = [fromTerritoryId];
        while (queue.length > 0) {
            const current = queue.shift();
            if (current === toTerritoryId) {
                return true;
            }
            if (visited.has(current)) {
                continue;
            }
            visited.add(current);
            // Get adjacent territories from map data
            const territory = (0, engine_1.getTerritoryState)(game, current);
            if (!territory || territory.occupiedBy !== playerId) {
                continue;
            }
            // Import areTerritoriesAdjacent from engine to check adjacencies
            // For now, check all territories to find adjacent owned ones
            for (const otherTerritory of game.territories) {
                if (otherTerritory.occupiedBy === playerId &&
                    !visited.has(otherTerritory.territoryId) &&
                    (0, engine_1.areTerritoriesAdjacent)(current, otherTerritory.territoryId)) {
                    queue.push(otherTerritory.territoryId);
                }
            }
        }
        return false;
    }
    /**
     * End turn and progress to next player
     */
    endTurn(gameId, playerId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        this.validatePlayerTurn(game, playerId);
        // Can end turn from ATTACK or FORTIFY phase
        if (game.phase !== engine_1.GamePhase.ATTACK && game.phase !== engine_1.GamePhase.FORTIFY) {
            throw new Error('Can only end turn during ATTACK or FORTIFY phase');
        }
        // If in ATTACK phase, award card if eligible
        if (game.phase === engine_1.GamePhase.ATTACK) {
            this.awardCardIfEligible(game, playerId);
        }
        // Progress to next player
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.turnOrder.length;
        // Skip eliminated players
        let attempts = 0;
        while (attempts < game.players.length) {
            const nextPlayerId = game.turnOrder[game.currentPlayerIndex];
            const nextPlayer = game.players.find(p => p.id === nextPlayerId);
            if (nextPlayer && !nextPlayer.isEliminated) {
                break;
            }
            game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.turnOrder.length;
            attempts++;
        }
        // Calculate reinforcements for next player
        const nextPlayerId = game.turnOrder[game.currentPlayerIndex];
        const reinforcements = engine_1.ReinforcementCalculator.calculateReinforcements(game, nextPlayerId);
        // Initialize new turn
        game.currentTurn = {
            playerId: nextPlayerId,
            reinforcementsRemaining: reinforcements,
            conqueredTerritoryThisTurn: false
        };
        // Set phase to REINFORCE
        game.phase = engine_1.GamePhase.REINFORCE;
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
}
exports.GameActionService = GameActionService;
// Singleton instance
exports.gameActionService = new GameActionService();
//# sourceMappingURL=GameActionService.js.map