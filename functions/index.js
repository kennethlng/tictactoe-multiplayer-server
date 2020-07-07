const functions = require('firebase-functions');
const constants = require('./constants'); 
const { gameIsWon, arraysMatch } = require('./helpers'); 

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.onMatchUpdated = functions.firestore
    .document('matches/{matchId}')
    .onUpdate((change, context) => {
        const data = change.after.data(); 
        const oldData = change.before.data(); 

        //  If the game is no longer active, stop checking for win conditions
        if (!data[constants.IS_ACTIVE]) {
            return null;
        }

        const marks = [data.mark0, data.mark1, data.mark2, data.mark3, data.mark4, data.mark5, data.mark6, data.mark7, data.mark8]; 
        const oldMarks = [oldData.mark0, oldData.mark1, oldData.mark2, oldData.mark3, oldData.mark4, oldData.mark5, oldData.mark6, oldData.mark7, oldData.mark8]; 
        
        //  To prevent infinite loops, only check win conditions if the marks have changed
        if (arraysMatch(marks, oldMarks)) {
            return null;
        }

        //  Check win conditions
        //  If somebody won, declare a winner, and set isActive = false 
        if (gameIsWon(marks)) {
            return change.after.ref.set({
                [constants.WINNER]: data[constants.TURN],
                [constants.IS_ACTIVE]: false 
            }, { merge: true })
        }

        //  If nobody won, assign the next player's turn 
        const otherPlayer = data[constants.TURN] === data[constants.PLAYER_O] ? data[constants.PLAYER_X] : data[constants.PLAYER_O];

        return change.after.ref.set({
            [constants.TURN]: otherPlayer
        }, { merge: true })
    })