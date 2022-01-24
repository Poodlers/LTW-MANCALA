const http = require('http');
const path = require('path');
const url  = require('url');
const fs   = require('fs');
const { parse } = require('querystring');
const conf = require('./conf.js'); 
var crypto = require("crypto");


const headers = {
    html: {"Content-Type": "text/html"},
    plain: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'        
    },
    sse: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive'
    }
};

http.createServer((request,response) => {

    switch(request.method) {
    case 'GET':
        if (request.headers.accept && request.headers.accept == 'text/event-stream'){
            sendSSE(request, response);
            
        }
        if(url.parse(request.url).pathname.includes('.') || url.parse(request.url).pathname == '/' )
            doGetRequest(request,response);
        break;
    case 'POST':
        doActualPOSTRequests(request, response);
        break;
    default:
        response.writeHead(501); // 501 Not Implemented
        response.end();    
    }

}).listen(conf.port);

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

class MancalaHelper {

    setUp(board){
        this.board = board;
        this.num_of_cavities = (this.board.length - 2) / 2;
        this.player2_storage = this.num_of_cavities + 1;
        this.player1_storage = 0;
        this.winner = null;
         
    }
    getBoard(){
        return this.board;
    }
    setUpPlayers(player1, player2, currently_playing){
        this.current_player = currently_playing;
        this.player1 = player1;
        this.player2 = player2;
    }

    isCurrentPlayerCav(cavity_num){
        if(this.current_player == this.player1){
             return this.isPlayerOneCav(cavity_num);
        }else{
            return this.isPlayerTwoCav(cavity_num);
        }
    }
    sow_board(cavity_num){
        cavity_num = this.getCurrentPlayersPitsIndexes()[cavity_num];
        let seeds_to_sow = this.board[cavity_num];
        if(seeds_to_sow == 0){
            return -1; //impossible seed
        }
        this.board[cavity_num] = 0;

        let sowing_cav = 0; //index of the board we're sowing
        for(let i = 0; i < seeds_to_sow; i++){
            sowing_cav = (cavity_num + i + 1) % (this.board.length);
            if( sowing_cav == this.oppositePlayersStorage() ){
                seeds_to_sow++;
                continue;
                
            }
            this.board[sowing_cav]++;
        } 
        
        
        //test if the last seed got in one of this player's empty cavity
        if(this.isCurrentPlayerCav(sowing_cav) && this.board[sowing_cav] == 1){
            this.board[this.currentPlayersStorage()] = this.board[this.currentPlayersStorage()] + 1 + this.board[this.oppositeCavityTo(sowing_cav)];
            this.board[sowing_cav] = 0;
            this.board[this.oppositeCavityTo(sowing_cav)] = 0;

        }
        //if sowing_cav (last sown seed) got into his own storage then the turn is still his
        if(sowing_cav == this.currentPlayersStorage()){
            console.log("The last seed was in this player's storage so he plays again!");
        }else{
             this.switchCurrentPlayer();

        }

        return this.current_player;
            
    }
    switchCurrentPlayer(){
        if(this.current_player == this.player1){
            this.current_player = this.player2;
        }else{
            this.current_player = this.player1;
        }
    }

    checkGameEnd(){
        let currentPlayersCavities = this.getCurrentPlayerCavities();
        for(let i = 0; i < currentPlayersCavities.length; i++){
            if(this.board[currentPlayersCavities[i]] > 0){
                //AT LEAST ONE CAVITY IS NOT EMPTY SO THE GAME CAN GO ON
                return false;
            }
        }

        //game is over, the current_player can't sow anything
        let opposingPlayersCavities = this.getOppositePlayerCavities();
        for(let i = 0; i < opposingPlayersCavities.length; i++){
            this.board[this.oppositePlayersStorage()] = this.board[this.oppositePlayersStorage()] + this.board[opposingPlayersCavities[i]];
            this.board[opposingPlayersCavities[i]] = 0;
        }


        if(this.board[this.player1_storage] > this.board[this.player2_storage]){
            this.winner = this.player1;
        }else if(this.board[this.player2_storage] > this.board[this.player1_storage]){
            this.winner = this.player2;
        }

        return true;

    }

    currentPlayersStorage(){
        if(this.current_player == this.player1) return this.player1_storage;
        return this.player2_storage;
    }
    oppositePlayersStorage(){
        if(this.current_player == this.player1) return this.player2_storage;
        return this.player1_storage;
    }

    oppositeCavityTo(cavity_num){
        return (this.board.length - 1) - (cavity_num - 1);
    }
    getPlayer1Pits(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isPlayerOneCav(i)){
                result.push(this.board[i]);
            }
        }
        return result;
    }

    isPlayerTwoCav(cavity_num){
        if(cavity_num < this.player2_storage && cavity_num != this.player1_storage){
            return true;
        }
        return false;
    }

    isPlayerOneCav(cavity_num){
        if(cavity_num > this.player2_storage && cavity_num != this.player2_storage){
            return true;
        }
        return false;
    }

    getPlayer1Store(){
        return this.board[this.player1_storage];
    }   

    getPlayer2Store(){
        return this.board[this.player2_storage];
    }

    getPlayer2Pits(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isPlayerTwoCav(i)){
                result.push(this.board[i]);
            }
        }
        return result;
    }

    getPlayer2PitsIndexes(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isPlayerTwoCav(i)){
                result.push(i);
            }
        }
        return result;
    }

    getPlayer1PitsIndexes(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isPlayerOneCav(i)){
                result.push(i);
            }
        }
        return result;
    }
    getWinner(){
        return this.winner;
    }
    getCurrentPlayersPitsIndexes(){
        if (this.current_player == this.player1){
            return this.getPlayer1PitsIndexes();
        }else{
            return this.getPlayer2PitsIndexes();
        }
    }

    isCurrentPlayerCav(cavity_num){
        if(this.current_player == this.player1){
             return this.isPlayerOneCav(cavity_num);
        }else{
            return this.isPlayerTwoCav(cavity_num);
        }
    }

    isOppositePlayerCav(cavity_num){
        if(this.current_player == this.player1){
          
            return this.isPlayerTwoCav(cavity_num);
       }else{
           return this.isPlayerOneCav(cavity_num);
       }
    }

    getCurrentPlayerCavities(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isCurrentPlayerCav(i)){
                result.push(i);
            }
        }
        return result;
    }

    getOppositePlayerCavities(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isOppositePlayerCav(i)){
                result.push(i);
            }
        }
        return result;
    }
}


function sendSSE(request, response){

    let queryString = request.url.replace('/update?','');
    const args = parseQuery(queryString);
    const nick = args.nick;
    const game_name = args.game;
    let board_prev = [];
    let timeout = 0;
    // find this ongoing game in ongoinggames.json
    const updateStream = setInterval(() => {
        const fileData = fs.readFileSync('ongoinggames.json', 'utf-8');
        let ongoing_games = JSON.parse(fileData).ongoing_games;

    for(let i = 0; i < ongoing_games.length; i++){
        let game_id = Object.keys(ongoing_games[i])[0];
        let game = ongoing_games[i][game_id];
        if(game_id == game_name){
            //this players game is ongoing and we need to send him something damnnn
            let obj_to_send = {};
           
            if(game.board != undefined){
                let game_board = game.board;
                //game_board has not changed so increment the time
                if(game_board == board_prev){
                    console.log("timeout curr: ", timeout);
                    timeout = timeout + 1;
                }else{ //reset timeout
                    board_prev = game_board;
                    timeout = 0;
                }
                //two minutes have passed
                if(timeout == 120){
                    console.log("timeout");
                    //set our winner
                    game.winner = (game.turn == game.player1 ? game.player2 : game.player1);


                }

                //set up our MancalaHelper
                let Mancala_Assist = new MancalaHelper();
                Mancala_Assist.setUp(game_board);
                let player1_pits = Mancala_Assist.getPlayer1Pits();
                let player1_store = Mancala_Assist.getPlayer1Store();
                let player2_store = Mancala_Assist.getPlayer2Store();
                let player2_pits = Mancala_Assist.getPlayer2Pits();
                obj_to_send["board"] = {};
                obj_to_send["board"]["sides"] = {};
                obj_to_send["stores"] = {};
                obj_to_send["stores"][game.player1] = player1_store;
                obj_to_send["stores"][game.player2] = player2_store;
                obj_to_send["board"]["sides"][game.player1] = {
                    "store": player1_store,
                    "pits": player1_pits
                }
                obj_to_send["board"]["sides"][game.player2] = {
                    "store": player2_store,
                    "pits": player2_pits
                }

                obj_to_send["board"]["turn"] = game.turn;
                if(game.pit != null) obj_to_send["pit"] = game.pit;
            }
        
            if(game.winner != 0){
                obj_to_send["winner"] = game.winner;
                console.log(obj_to_send);
                if(game.board != undefined){
                    //if game.board is not undefined this means it was a legit win and we need to update ranking
                    //if game.board is undefined, this game came to an end via a giveup, and we do not update our ranking here
                    const rankingData = fs.readFileSync('ranking.json', 'utf-8');
                    let ranking = JSON.parse(rankingData).ranking;
                    console.log("we have winner yay")
                    if(game.winner == null){ //case of tie, increase them both games played
                        let ranking_entry_player1 = ranking.find(element => element.nick == game.player1);
                        let ranking_entry_player2 = ranking.find(element => element.nick == game.player2);
                        if(ranking_entry_player1 != undefined){
                            ranking_entry_player1["games"] = ranking_entry_player1["games"] + 1;
                        }
                        else{
                            ranking_entry_player1 = {"nick": game.player1, "victories": 0, "games": 1};
                        }

                        if(ranking_entry_player2 != undefined){
                            ranking_entry_player2["games"] = ranking_entry_player2["games"] + 1;
                        }
                        else{
                            ranking_entry_player2 = {"nick": game.player2, "victories": 0, "games": 1};
                        }
                        let filtered_ranking = ranking.filter(e => (e.nick != game.player1 && e.nick != game.player2) );

                        filtered_ranking.push(ranking_entry_player1);
                        filtered_ranking.push(ranking_entry_player2);

                        const newRankingData = {ranking: filtered_ranking};
                        fs.writeFile('ranking.json', JSON.stringify(newRankingData), (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log("JSON Ranking data is saved.");
                        });

                    }else{
                        let non_winner = (game.winner == game.player1 ? game.player2 : game.player1);
                        //update ranking.json
                        //update the ranking.json
                        
                        //remove from the ranking array the entries we are about to modify
                        let filtered_ranking = ranking.filter(e => (e.nick != game.winner && e.nick != non_winner) );
                        let ranking_entry_nonwinner = ranking.find(element => element.nick == non_winner);
                        let ranking_entry_winner = ranking.find(element => element.nick == game.winner);

                        if(ranking_entry_nonwinner != undefined){
                            ranking_entry_nonwinner["games"] = ranking_entry_nonwinner["games"] + 1;
                        }else{
                            ranking_entry_nonwinner = {"nick": non_winner, "victories": 0, "games": 1};
                        }
                        if(ranking_entry_winner != undefined){
                            ranking_entry_winner["victories"] = ranking_entry_winner["victories"] + 1;
                            ranking_entry_winner["games"] = ranking_entry_winner["games"] + 1;
                        }
                        else{
                            ranking_entry_winner = {"nick": game.winner, "victories": 1, "games": 1};
                        }
                    
                        filtered_ranking.push(ranking_entry_nonwinner);
                        filtered_ranking.push(ranking_entry_winner);

                        const newRankingData = {ranking: filtered_ranking};
                        fs.writeFile('ranking.json', JSON.stringify(newRankingData), (err) => {
                            if (err) {
                                throw err;
                            }
                            console.log("JSON Ranking data is saved.");
                        });
                    }
                }

                //ranking updated, now delete this game from the ongoing_games

                ongoing_games.splice(i,1);
                console.log(ongoing_games);
                const newOngoingData = {ongoing_games: ongoing_games};
                fs.writeFile('ongoinggames.json', JSON.stringify(newOngoingData), (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("JSON OnGoing data is saved.");
                });

            }


            response.writeHead(200, headers.sse);
            response.write('\n');
            response.write('data: ' + JSON.stringify(obj_to_send) + "\n\n");
            
            return;
        }
    }

    //no games ongoing yet, check if the player is in QUEUE
   
    const fileQueueData = fs.readFileSync('join.json', 'utf-8');
    let queue_games = JSON.parse(fileQueueData).queue_games;

    for(let i = 0; i < queue_games.length; i++){
        let game_id = Object.keys(queue_games[i])[0];
        if(game_id == game_name){
            response.writeHead(200, headers.sse);
            response.write('\n');
            response.write('data: ' + JSON.stringify({}) + "\n\n");
            
            return;
        }
    }

    //if there's no queue game for this, this means that the player has given up before someone else joined so return this
    response.writeHead(200, headers.sse);
    response.write('\n');
    response.write('data: ' + JSON.stringify({"winner": null}) + "\n\n");
    console.log("clearing the stream it dead");
    clearInterval(updateStream);

    }, 500);
    
    
    
}

function doGetRequest(request,response) {
    const pathname = getPathname(request);
    if(pathname === null) {
        response.writeHead(403); // Forbidden
        response.end();
    } else 
        fs.stat(pathname,(err,stats) => {
            if(err) {
                response.writeHead(500); // Internal Server Error
                response.end();
            } else if(stats.isDirectory()) {
                if(pathname.endsWith('/'))
                   doGetPathname(pathname+conf.defaultIndex,response);
                else {
                   response.writeHead(301, // Moved Permanently
                                      {'Location': pathname+'/' });
                   response.end();
                }
            } else 
                doGetPathname(pathname,response);
       });    
}

function getPathname(request) {
    const purl = url.parse(request.url);
    let pathname = path.normalize(conf.documentRoot+purl.pathname);

    if(! pathname.startsWith(conf.documentRoot))
       pathname = null;

    return pathname;
}


function doGetPathname(pathname,response) {
    const mediaType = getMediaType(pathname);
    const encoding = isText(mediaType) ? "utf8" : null;

    fs.readFile(pathname,encoding,(err,data) => {
    if(err) {
        response.writeHead(404); // Not Found
        response.end();
    } else {
        response.writeHead(200, { 'Content-Type': mediaType });
        response.end(data);
    }
  });    
}


function getMediaType(pathname) {
    const pos = pathname.lastIndexOf('.');
    let mediaType;

    if(pos !== -1) 
       mediaType = conf.mediaTypes[pathname.substring(pos+1)];

    if(mediaType === undefined)
       mediaType = 'text/plain';
    return mediaType;
}

function isText(mediaType) {
    if(mediaType.startsWith('image'))
      return false;
    else
      return true;

}

function collectRequestData(request, callback,response) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body), response);
        });
    }
    else {
        console.log("Something wrong with the parser");
    }
}


function leaveFunc(parsedArgs, response){
    const args = JSON.parse(Object.keys(parsedArgs)[0]);
    console.log('Leave args' ,args);

    const nick = args.nick;
    const password = args.password;
    const game = args.game;

    const fileData = fs.readFileSync('ongoinggames.json', 'utf-8');
    let ongoing_games = JSON.parse(fileData).ongoing_games;
    for(let i = 0; i < ongoing_games.length; i++){
        let game_id = Object.keys(ongoing_games[i])[0];
        if(game_id == game){
            let temp_game = ongoing_games[i][game_id];
            let new_game = {};
            new_game[game_id] = {};
            let winner = (temp_game.player1 == nick ? temp_game.player2 : temp_game.player1)
            new_game[game_id]["winner"] = winner
            ongoing_games.splice(i,1);
            ongoing_games.push(new_game);
            const newOngoingData = {ongoing_games: ongoing_games};
            fs.writeFile('ongoinggames.json', JSON.stringify(newOngoingData), (err) => {
                if (err) {
                    throw err;
                }
                console.log("JSON OnGoing data is saved.");
            });

            //update the ranking.json
            const rankingData = fs.readFileSync('ranking.json', 'utf-8');
            let ranking = JSON.parse(rankingData).ranking;
            

            //remove from the ranking array the entries we are about to modify
            let filtered_ranking = ranking.filter(e => (e.nick != winner && e.nick != nick) );
            let ranking_entry_giveup = ranking.find(element => element.nick == nick);
            let ranking_entry_winner = ranking.find(element => element.nick == winner);

            if(ranking_entry_giveup != undefined){
                ranking_entry_giveup["games"] = ranking_entry_giveup["games"] + 1;
            }else{
                ranking_entry_giveup = {"nick": nick, "victories": 0, "games": 1};
            }
            if(ranking_entry_winner != undefined){
                ranking_entry_winner["victories"] = ranking_entry_winner["victories"] + 1;
                ranking_entry_winner["games"] = ranking_entry_winner["games"] + 1;
            }
            else{
                ranking_entry_winner = {"nick": winner, "victories": 1, "games": 1};
            }
           
            filtered_ranking.push(ranking_entry_giveup);
            filtered_ranking.push(ranking_entry_winner);
            const newRankingData = {ranking: filtered_ranking};
            fs.writeFile('ranking.json', JSON.stringify(newRankingData), (err) => {
                if (err) {
                    throw err;
                }
                console.log("JSON Ranking data is saved.");
            });

            response.writeHead(200, headers.plain);
            response.end(JSON.stringify({})); 
            return;
        }

    }

    //not found in ongoing games, might be in queue, check join.json
    const fileQueueData = fs.readFileSync('join.json', 'utf-8');
    let queue_games = JSON.parse(fileQueueData).queue_games;
    for(let i = 0; i < queue_games.length; i++){
        let game_id = Object.keys(queue_games[i])[0];
        if(game_id == game){
            queue_games.splice(i,1);
            const newQueueData = {queue_games: queue_games};
            fs.writeFile('join.json', JSON.stringify(newQueueData), (err) => {
                if (err) {
                    throw err;
                }
                console.log("JSON Queue data is saved.");
            }); 
            response.writeHead(200, headers.plain);
            response.end(JSON.stringify({}));
            return;
        }
    }

    response.writeHead(400, headers.plain);
    response.end(JSON.stringify({"error": "No game with id" + game}));

}

function registerFunc(parsedArgs, response){
    const args = JSON.parse(Object.keys(parsedArgs)[0]);
    console.log('Register args' ,args);

    // read from the registers file
    const fileData = fs.readFileSync('registers.json', 'utf-8');
    const registers = JSON.parse(fileData);
    let prevRegisters = registers.registers;

    const nick = args.nick;
    const password = args.password;
    if(nick == ''){
        response.writeHead(401, headers.plain);
        response.end(JSON.stringify({"error": "Can't register with empty username"}));  
        return;
    }

    for(let i = 0; i < prevRegisters.length; i++){
        if(prevRegisters[i].nick == nick ){
            if(prevRegisters[i].password == password){
                response.writeHead(200, headers.plain);
                response.end(JSON.stringify({}));
                
            }else{
                response.writeHead(401, headers.plain);
                response.end(JSON.stringify({"error": "User registered with a different password"}));  
                
            }
            return;
        }
    }
    console.log("Registering new user");

    //add this new register
    prevRegisters.push({nick: nick, password: password});
    console.log(prevRegisters);
    const newRegistersFileContent = { registers: prevRegisters };
    fs.writeFile('registers.json', JSON.stringify(newRegistersFileContent), (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON Register data is saved.");
    }); 

    response.writeHead(200, headers.plain);
    response.end(JSON.stringify({}));
    
}


function notifyFunc(parsedArgs, response){
    const args = JSON.parse(Object.keys(parsedArgs)[0]);
    console.log('Notify args' ,args);
    const nick = args.nick;
    const password = args.password;
    const game = args.game;
    const move = args.move;

    const fileData = fs.readFileSync('ongoinggames.json', 'utf-8');
    let ongoing_games = JSON.parse(fileData).ongoing_games;

    for(let i = 0; i < ongoing_games.length; i++){
        let game_id = Object.keys(ongoing_games[i])[0];
        if(game_id == game){
            let game_temp = ongoing_games[i][game_id];
            if(game_temp.turn != nick){
                response.writeHead(401, headers.plain);
                response.end(JSON.stringify({"error" : "Not your turn to play" }));
                return;
            }
            let board = game_temp.board;
            let Mancala_Assist = new MancalaHelper();
            Mancala_Assist.setUp(board);
            Mancala_Assist.setUpPlayers(game_temp.player1, game_temp.player2, game_temp.turn);
            let next_turn = Mancala_Assist.sow_board(move);
            if(next_turn == -1){
                response.writeHead(401, headers.plain);
                response.end(JSON.stringify({"error" : "Can't sow an empty cavity" }));
                return;
            }

            let new_board = Mancala_Assist.getBoard();
            let new_game_obj = {};
            if(Mancala_Assist.checkGameEnd()){
                new_board = Mancala_Assist.getBoard();
                new_game_obj[game_id] = {player1: game_temp.player1, player2: game_temp.player2,
                    board: new_board, turn: next_turn, pit: move, winner: Mancala_Assist.getWinner()
                }
            }
            else{
                new_game_obj[game_id] = {player1: game_temp.player1, player2: game_temp.player2,
                            board: new_board, turn: next_turn, pit: move, winner: 0
                }
                
            
            }
            //rewrite ongoinggames.json
            ongoing_games.splice(i,1);
            ongoing_games.push(new_game_obj);

            const newOnGoingFileContent = {ongoing_games: ongoing_games};
            fs.writeFile('ongoinggames.json', JSON.stringify(newOnGoingFileContent), (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON OnGoingGames data is saved.");
             }); 

            response.writeHead(200, headers.plain);
            response.end(JSON.stringify({}));
            return;
           

        }
        
        

    }

    response.writeHead(400, headers.plain);
    response.end(JSON.stringify({"error": "No game with id" + game}));
}

function hasGameFunc(parsedArgs, response){
    const args = JSON.parse(Object.keys(parsedArgs)[0]);
    console.log('HasGame args' ,args);
    const nick = args.nick;
    const onGoingData = fs.readFileSync('ongoinggames.json', 'utf-8');
    let ongoing_games = JSON.parse(onGoingData).ongoing_games;
    for(let i = 0; i < ongoing_games.length; i++){
        let ongoing_game_temp = ongoing_games[i];
        let game_id = Object.keys(ongoing_game_temp)[0];
        if(ongoing_game_temp[game_id].player1 == nick || ongoing_game_temp[game_id].player2 == nick){
            response.writeHead(200, headers.plain);
            response.end(JSON.stringify({game: game_id, size: (ongoing_game_temp[game_id].board.length - 2) / 2 }));

            //also send an update here if u figure out how xD

            return;
        }
        
    }

    response.writeHead(200, headers.plain);
    response.end(JSON.stringify({}));


}

function joinFunc(parsedArgs, response){
    const args = JSON.parse(Object.keys(parsedArgs)[0]);
    console.log('Join args' ,args);
    const group = args.group;
    const nick = args.nick;
    const password = args.password;
    const size = args.size;
    const initial = args.initial;
    //check if there are no games with these characteristics (read join.json)
    const fileData = fs.readFileSync('join.json', 'utf-8');
    if(fileData == ""){
        let games = [];
        let game_id = crypto.randomBytes(20).toString('hex');
        let newQueueGame = {};
        newQueueGame[game_id] =  { group: group, nick: nick, password: password, size: size, initial: initial };
        console.log(newQueueGame);
        games.push(newQueueGame);
        const newJoinFileContent = {queue_games: games};
        fs.writeFile('join.json', JSON.stringify(newJoinFileContent), (err) => {
            if (err) {
                throw err;
            }
            console.log("JSON QueueGames data is saved.");
        }); 

        response.writeHead(200, headers.plain);
        response.end(JSON.stringify({"game" : game_id.toString() }));
        return;
    }

    const fileObj = JSON.parse(fileData);
    let games = fileObj.queue_games;

    for(let i = 0; i < games.length; i++){
        const gameId = Object.keys(games[i])[0];
        if(games[i][gameId].size == size && games[i][gameId].initial == initial){
            if(games[i][gameId].nick == nick && games[i][gameId].password == password){
                response.writeHead(200, headers.plain);
                response.end(JSON.stringify({"game" : gameId }));
            }else{
                console.log("Matching these players!");
                //match these bros and delete this entry from join.json
                //add the bros to a ongoinggames.json
                const newGame = {}
                let board = [];
                for(let i = 0 ; i < (size *2) + 2; i++){
                    board.push(initial);
                }
                board[0] = 0;
                board[size + 1] = 0;
                newGame[gameId] = {player1: games[i][gameId].nick, player2: nick, board: board, turn: games[i][gameId].nick, pit: null, winner: 0 };
                const onGoingData = fs.readFileSync('ongoinggames.json', 'utf-8');
                // parse JSON object
                const ongoing = JSON.parse(onGoingData);
                let games_array = ongoing.ongoing_games;
                games_array.push(newGame);
                console.log(games_array);
                const newOngoingFileContent = {ongoing_games: games_array};
                fs.writeFile('ongoinggames.json', JSON.stringify(newOngoingFileContent), (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("JSON OnGoingGames data is saved.");
                }); 

                //remove this game from the queue
                games.splice(i,1);
                const newJoinFileContent = {queue_games: games};
                fs.writeFile('join.json', JSON.stringify(newJoinFileContent), (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("JSON QueueGames data is saved.");
                }); 
                response.writeHead(200, headers.plain);
                response.end(JSON.stringify({"game" : gameId }));
            }
        
            return;
        }
}

    //if we got here its because no existing games exist and we put the user in queue
    let newQueueGame = {};
    let game_id = crypto.randomBytes(20).toString('hex');
    newQueueGame[game_id] =  { group: group, nick: nick, password: password, size: size, initial: initial };
    console.log(newQueueGame);
    games.push(newQueueGame);

    const newJoinFileContent = {queue_games: games};
    fs.writeFile('join.json', JSON.stringify(newJoinFileContent), (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON QueueGames data is saved.");
    }); 

    
    response.writeHead(200, headers.plain);
    response.end(JSON.stringify({"game" : game_id.toString() }));

}

/**
 * Returns a hash code for a string.
 * (Compatible to Java's String.hashCode())
 *
 * The hash code for a string object is computed as
 *     s[0]*31^(n-1) + s[1]*31^(n-2) + ... + s[n-1]
 * using number arithmetic, where s[i] is the i th character
 * of the given string, n is the length of the string,
 * and ^ indicates exponentiation.
 * (The hash value of the empty string is zero.)
 *
 * @param {string} s a string
 * @return {number} a hash code value for the given string.
 */
 hashCode = function(s) {
    var h = 0, l = s.length, i = 0;
    if ( l > 0 )
      while (i < l)
        h = (h << 5) - h + s.charCodeAt(i++) | 0;
    return h;
};

function doActualPOSTRequests(request,response) {
   
    const request_type = url.parse(request.url).pathname;
    

    switch (request_type){
        case '/ranking':
            /*
            fs.writeFile('ranking.json', data, (err) => {
                if (err) {
                    throw err;
                }
                console.log("JSON Ranking data is saved.");
            }); 
            */
            //read the ranking from file
            const fileData = fs.readFileSync('ranking.json', 'utf-8');
            // parse JSON object
            let rankings = JSON.parse(fileData).ranking;
            rankings.sort(function(a, b) {
                return b.victories - a.victories;
              });
            // print JSON object
            response.writeHead(200, headers.plain);
            response.end(JSON.stringify({ranking: rankings}));
    
            break;
        case '/register':
            //get the parameters
            collectRequestData(request, registerFunc, response);
            break;
        case '/join':
            collectRequestData(request, joinFunc, response);
            break;
        case '/leave':
            collectRequestData(request, leaveFunc, response);
            break;
        case '/notify':
            collectRequestData(request, notifyFunc, response);
            break;
        case '/has-game':
            collectRequestData(request, hasGameFunc, response);
            break;
       

    }
        
}