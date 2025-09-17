import { COMMON_MONSTERS } from '../../data/monsters/common.js';

export const DUNGEONS = {
    GOBLIN_CAVE: {
        id: 'DUNGEON_GOBLIN_CAVE',
        name: 'Goblin-Höhle',
        type: 'dungeon',
        description: 'Eine feuchte, modrige Höhle, in der sich Goblins eingenistet haben.',
        monsters: [
            COMMON_MONSTERS.GOBLIN,
            COMMON_MONSTERS.GIANT_RAT
        ]
    }
};