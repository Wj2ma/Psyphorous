# Psyphorous
Swarm AI game

## How to run a game.
1. Open index.html.
2. Initialize a new game object with an array of bots, a height, and a width.
3. See the results.

## Game Rules
1. Each player starts with the same creatures.
2. The goal is to destroy all opponents creatures.
3. Each creature has an attack power, and a health. The health will be shown in the UI, and the attack is hardcoded to
2 for now.
4. On every turn, there are 3 phases: the movement phase, the duel phase, and the attacking phase. Phases are run
sequentially in that order.
5. During the movement phase, every creature can either move 1 unit up/right/down/left or stay.
6. After the movement phase, we go into the duel phase. A duel happens when 2 or more creatures occupy the same block,
regardless of their alliance (creatures are bad tempered, so if anyone is in their personal space, they need to settle
it).
7. During a duel, the creature with the highest life is the strongest and will win against all others. It will lose the
amount of hp equal to the second highest life. If there is a tie, everyone dies.
8. After all duels are settled, the attacking phase begins. In this phase, every creature will deal its damage to all
adjacent enemies. An enemy is adjacent if it is 1 unit away from the creature, including diagonals.
9. A winner is declared when there is either one player left, or no players left. However, if the number of turns
exceeds 10 * sqrt(width * height), where width and height are the width and heights of the grid, then the game ends as
well, and the player with the most hp + damage across all his or her creatures will be victorious.

