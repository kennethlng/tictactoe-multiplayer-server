# tictactoe-multiplayer-cloud-functions

This is a Cloud Functions backend that handles the backend game logic for the [multiplayer TicTacToe game](https://github.com/kennethlng/tictactoe-multiplayer). There are 2 Firestore trigger functions: `onQueueCreated` and `onMatchUpdated`.  
 
### `onQueueCreated`

While in the lobby, players can submit matchmaking requests. Each matchmaking request creates an active `queue` document in the `queues` Firestore collection. Each time a new `queue` is created, the `onQueueCreated` trigger function will:

1. Clean out previous matchmaking requests from the same player by deactivating them (`isActive` = `false`). 
2. Search for active matchmaking requests from all players. For simplicity's sake, I only looked for the 2 most recent queues to create a match. In a real-life game example, you would probably create more complex logic to match players based on level, region, etc. 
3. If two queues have been found, create a new `match` document between the two players. 

### `onMatchUpdated`

Each time a match is updated with new marks, the `onMatchUpdated` trigger function runs the backend game logic to determine whose turn it is next and whether a winner has been identified.

## Contact

If you have any questions or concerns, message me on [Twitter](https://twitter.com/kennethlng) or email me at hello@kennethlng.com.
