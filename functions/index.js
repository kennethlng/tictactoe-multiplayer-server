const functions = require('firebase-functions');
const constants = require('./constants'); 
const admin = require('firebase-admin');
const { Queue } = require('./models/queue'); 
const { gameIsWon, arraysMatch, arrayIsFilled } = require('./helpers'); 

admin.initializeApp(); 
const db = admin.firestore(); 

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.onMatchUpdated = functions.firestore
    .document(`${constants.MATCHES}/{matchId}`)
    .onUpdate((change, context) => {
        const data = change.after.data(); 
        const oldData = change.before.data(); 

        //  If the game is no longer active, don't do anything
        if (!data[constants.IS_ACTIVE]) 
            return null;

        const marks = [data.mark0, data.mark1, data.mark2, data.mark3, data.mark4, data.mark5, data.mark6, data.mark7, data.mark8]; 
        const oldMarks = [oldData.mark0, oldData.mark1, oldData.mark2, oldData.mark3, oldData.mark4, oldData.mark5, oldData.mark6, oldData.mark7, oldData.mark8]; 
        
        //  To prevent infinite loops, don't do anything unless the marks have been updated with new marks
        if (arraysMatch(marks, oldMarks)) 
            return null;

        //  Check win conditions
        //  If somebody won, declare a winner, and set isActive = false 
        if (gameIsWon(marks)) {
            return change.after.ref.set({
                [constants.WINNER]: data[constants.TURN],
                [constants.IS_ACTIVE]: false,
                [constants.MODIFIED_ON]: change.after.updateTime
            }, { merge: true })
        }

        //  If the array is filled (and no winner is declared), end the game by setting isActive = false
        if (arrayIsFilled(marks)) {
            return change.after.ref.set({
                [constants.IS_ACTIVE]: false,
                [constants.MODIFIED_ON]: change.after.updateTime
            }, { merge: true })
        }

        //  If nobody won and the game is still active, assign the next player's turn 
        const otherPlayer = data[constants.TURN] === data[constants.PLAYER_O] ? data[constants.PLAYER_X] : data[constants.PLAYER_O];
        return change.after.ref.set({
            [constants.TURN]: otherPlayer,
            [constants.MODIFIED_ON]: change.after.updateTime
        }, { merge: true })
    })

exports.OnQueueCreated = functions.firestore
    .document(`${constants.QUEUES}/{queueId}`)
    .onCreate((snapshot, context) => {
        const data = snapshot.data(); 

        //  Save the timestamp for when the queue was created and activate the queue
        return snapshot.ref.set({
            [constants.IS_ACTIVE]: true,
            [constants.CREATED_ON]: snapshot.createTime
        }, { merge: true })
        .then(() => {
            //  Just to be safe, deactive all previous queues from the same player
            return db.collection(constants.QUEUES).where(constants.USER_ID, "==", data[constants.USER_ID]).get();
        })
        .then(querySnapshot => {
            const batch = db.batch();  
            querySnapshot.forEach(function(doc) {
                const data = doc.data(); 

                //  Find queues that are still active but have a different created time than this current queue
                if (data[constants.CREATED_ON].toMillis() !== snapshot.createTime.toMillis()) {
                    //  Set these queues to inactive
                    batch.update(doc.ref, {
                        [constants.IS_ACTIVE]: false,
                    })
                }
            })

            return batch.commit(); 
        })
        .then(() => {
            //  Search for the 2 last created queues from all players
            const collectionRef = db.collection(constants.QUEUES);
            return collectionRef.where(constants.IS_ACTIVE, "==", true).orderBy(constants.CREATED_ON).limit(2).get()
        })
        .then(queuesQuerySnapshot => {
            //  If there's less than 2 total queues available, don't create a match. A match can't be started without at most 2 players. 
            if (queuesQuerySnapshot.size < 2) {
                return null;
            }

            var playerIds = []; 

            //  Perform a batch write. 
            const batch = db.batch(); 

            queuesQuerySnapshot.forEach(function(doc) {
                //  Grab the userId for each player
                const data = doc.data(); 
                playerIds.push(data[constants.USER_ID])

                //  Deactivate the queues so that they no longer pop in matchmaking requests. They can also be deleted if you want. 
                const queueRef = doc.ref; 
                batch.update(queueRef, { [constants.IS_ACTIVE]: false })
            })

            //  Choose a random player to start first
            const randomPlayerId = playerIds[Math.floor(Math.random() * playerIds.length)];
            
            //  Create a new match between the 2 players
            const newMatchRef = db.collection(constants.MATCHES).doc(); 
            batch.set(newMatchRef, {
                [constants.IS_ACTIVE]: true,
                [constants.WINNER]: "",
                [constants.TURN]: randomPlayerId,
                [playerIds[0]]: true,
                [playerIds[1]]: true,
                [constants.PLAYER_O]: playerIds[0],
                [constants.PLAYER_X]: playerIds[1],
                "mark0": "",
                "mark1": "",
                "mark2": "",
                "mark3": "",
                "mark4": "",
                "mark5": "",
                "mark6": "",
                "mark7": "",
                "mark8": ""
            })

            return batch.commit(); 
        })
        .catch(error => console.log(error)); 
    })