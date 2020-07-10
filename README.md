# tictactoe-multiplayer-server

This is a Firebase Cloud Functions server that handles the backend logic for the [multiplayer TicTacToe game](https://github.com/kennethlng/tictactoe-multiplayer). There are 2 Firestore trigger functions: `onQueueCreated` and `onMatchUpdated`.  
 
## `onQueueCreated`

While in the lobby, players can submit matchmaking requests. Each matchmaking request creates an active `queue` document in the `queues` Firestore collection. Each time a new `queue` is created, the `onQueueCreated` trigger function will:

1. Clean out previous matchmaking requests from the same player by deactivating them (`isActive` = `false`). 
2. Search for active matchmaking requests from all players. For simplicity's sake, I only looked for the 2 most recent queues to create a match. In a real-life game example, you would probably create more complex logic to match players based on level, region, etc. 
3. Once two queues have been identified, create a `match` between the two players. 

## `onMatchUpdated`

Each time a match is updated with new marks, the `onMatchUpdated` trigger function runs the backend game logic to determine whose turn it is next and whether a winner has been identified.
