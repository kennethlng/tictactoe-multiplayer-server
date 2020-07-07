function gameIsWon(marks) {
    if (marks[0] !== "" && marks[1] !== "" && marks[2] !== "" &&
        marks[0] === marks[1] && marks[0] === marks[2]) 
        return true; 

    if (marks[3] !== "" && marks[4] !== "" && marks[5] !== "" &&
        marks[3] === marks[4] && marks[3] === marks[5]) 
        return true;

    if (marks[6] !== "" && marks[7] !== "" && marks[8] !== "" &&
        marks[6] === marks[7] && marks[6] === marks[8]) 
        return true; 

    if (marks[0] !== "" && marks [3] !== "" && marks[6] !== "" &&
        marks[0] === marks[3] && marks[0] === marks[6]) 
        return true; 

    if (marks[1] !== "" && marks[4] !== "" && marks[7] !== "" &&
        marks[1] === marks[4] && marks[1] === marks[7])
        return true;
        
    if (marks[2] !== "" && marks[5] !== "" && marks[8] !== "" &&
        marks[2] === marks[5] && marks[2] === marks[8])
        return true; 
    
    if (marks[0] !== "" && marks[4] !== "" && marks[8] !== "" &&
        marks[0] === marks[4] && marks[0] === marks[8])
        return true; 

    if (marks[2] !== "" && marks[4] !== "" && marks[6] !== "" &&
        marks[2] === marks[4] && marks[2] === marks[6])
        return true; 

    return false; 
}

function arraysMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) return false; 

    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false; 
    }

    return true; 
}

exports.gameIsWon = gameIsWon;
exports.arraysMatch = arraysMatch;
