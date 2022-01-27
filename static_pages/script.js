class PlayerType {
    // Create new instances of the same class as static attributes
    static Human = new PlayerType("Human")
    static CPU = new PlayerType("CPU")
    constructor(name) {
      this.name = name
    }


}

class MancalaPlayer{
    constructor(playerType, name){
        this.score = 0;
        this.playerType = playerType;
        this.playerName = name;
    }

    getScore(){
        return this.score;
    }

    setScore(new_score){
        this.score = new_score;
    }

    getType(){
        return this.playerType;
    }

    getName(){
        return this.playerName;
    }

    setName(name){
        this.playerName = name;
    }
    

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

class MancalaGame{
    constructor(num_of_cavities, num_of_seeds_per_cav, player1, player2){
        this.num_of_cavities = num_of_cavities;
        this.num_of_seeds_per_cav = num_of_seeds_per_cav;
        this.player1 = player1;
        this.player2 = player2;
        this.current_player = this.player1;
        this.board = [];
        this.player2_storage = this.num_of_cavities + 1;
        this.player1_storage = 0;
        this.winner = undefined;
        this.game_end = false;
        this.isonline = false;
        this.min_max_depth = 1;
        this.online_hash = undefined;
        this.updateSource = undefined;
        this.CPUStart = false;
    }

    setCPUStart(CPUStart){
        this.CPUStart = CPUStart;
    }

    isCPUStart(){
        return this.CPUStart;
    }

    getDepth(){
        return this.min_max_depth;
    }

    setDepth(depth){
        this.min_max_depth = depth;
    }

    setGameHash(hash){
        this.online_hash = hash;
    }

    isOnline(){
        return this.isonline;
    }

    resetGameState(){
        this.game_end = false;
        this.winner = undefined;
        this.current_player = this.player1;
    }
        
    addCPUOpponent(){
        this.player2 = new MancalaPlayer(PlayerType.CPU, "CPU");
    }

    removeCPUOpponent(){
        this.player2 = new MancalaPlayer(PlayerType.Human, "PLAYER 2");
    }

    createBoard(){
        this.board = [];
        this.updatePlayerStorageIndex();
        for(let i = 0; i < (this.num_of_cavities * 2)  + 2; i++){
            this.board.push(this.num_of_seeds_per_cav);
        }
        this.board[this.player1_storage] = 0; //player 1's armazem
        this.board[this.player2_storage] = 0; //player 2's armazem
        
    }

    updatePlayerStorageIndex(){
        this.player2_storage = this.num_of_cavities + 1;
        this.player1_storage = 0;
    }

    getNumOfCavities(){
        return this.num_of_cavities;
    }

    getNumOfSeeds(){
        return this.num_of_seeds_per_cav;
    }

    setNumOfCavities(num_of_cavities){
        this.num_of_cavities = num_of_cavities;
    }

    setNumOfSeeds(num_of_seeds){
        this.num_of_seeds_per_cav = num_of_seeds;
    }

    displayPlayersNames(){
        let player_1_name_div = document.getElementById("player_1_name");
        let player_2_name_div = document.getElementById("player_2_name");
        player_1_name_div.innerHTML = this.player1.getName() + ": ";
        player_2_name_div.innerHTML = this.player2.getName() + ": ";
    }

    valid_sow(cavity_num){
        if(this.isOppositePlayerCav(cavity_num)){
            console.log("Can't sow your opponent's cavities!");
            return false;
        }
        return true;
    }

    getPlayerOneCavs(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isPlayerOneCav(i)){
                result.push(i);
            }
        }
        return result;
    }

    getPlayerTwoCavs(){
        let result = []
        for(let i = 0; i < this.board.length;i++){
            if(this.isPlayerTwoCav(i)){
                result.push(i);
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

    checkGameEnd(board){
        let currentPlayersCavities = this.getCurrentPlayerCavities();
        for(let i = 0; i < currentPlayersCavities.length; i++){
            if(board[currentPlayersCavities[i]] > 0){
                //AT LEAST ONE CAVITY IS NOT EMPTY SO THE GAME CAN GO ON
                return false;
            }
        }

        //game is over, the current_player can't sow anything
        let opposingPlayersCavities = this.getOppositePlayerCavities();
        for(let i = 0; i < opposingPlayersCavities.length; i++){
            board[this.oppositePlayersStorage()] = board[this.oppositePlayersStorage()] + board[opposingPlayersCavities[i]];
            board[opposingPlayersCavities[i]] = 0;
        }

        this.player1.setScore(board[this.player1_storage]);
        this.player2.setScore(board[this.player2_storage]);

        if(board[this.player1_storage] > board[this.player2_storage]){
            this.winner = this.player1;
        }else if(board[this.player2_storage] > board[this.player1_storage]){
            this.winner = this.player2;
        }

        return true;

    }

    setPlayersName(player1_name, player2_name){
        this.player1.setName(player1_name);
        this.player2.setName(player2_name);
    }

    unsetOnline(){
        this.isonline = false;
    }

    setOnline(){
        this.isonline = true;
    }

    updateBoard(board){
        let sides = board.sides;
        let your_side = sides[this.player1.getName()];
        let opponent_side = sides[this.player2.getName()];
        this.board[this.player1_storage] = your_side["store"];
        this.board[this.player2_storage] = opponent_side["store"];
        let your_pits = your_side["pits"];
        let opponent_pits = opponent_side["pits"];
        for(let i = 0; i < opponent_pits.length; i++){
            this.board[i + 1] = opponent_pits[i];
        }
        let v = 0;
        for(let i = this.player2_storage + 1; i < this.board.length; i++){
            this.board[i] = your_pits[v];
            v++;
        }
    }

    updatePlayersName(stores){
        let keys = Object.keys(stores);
        if(keys[0] == username){
            this.player1.setName(keys[0]);
            this.player2.setName(keys[1]);
        }
        else{
            this.player1.setName(keys[1]);
            this.player2.setName(keys[0]);
        }
        

    }
    

    getBoard(){
        return this.board;
    }

    giveUpOnline(){
        let xhttp_leave = new XMLHttpRequest();

        xhttp_leave.open("POST", backend + '/leave', true);
        xhttp_leave.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp_leave.onreadystatechange = function() {
           
            if (this.readyState == 4){
                console.log(xhttp_leave.responseText);
                const data = JSON.parse(xhttp_leave.responseText);
                console.log(data);
                if(this.status == 200) {
                    let queue_display = document.getElementById("queue_display");
                    queue_display.innerHTML = "Gave up on this game!";
                    console.log("Leave success")
                }
            }
        
        };
        Mancala.closeUpdate();
        let request_body = { game: this.online_hash,nick: username, password: password};
        xhttp_leave.send(JSON.stringify(request_body));
    }

    updateCurrentPlayerOnline(turn){
        if(turn == this.player1.getName()){
            this.current_player = this.player1;
        }else{
            this.current_player = this.player2;
        }
    }

    checkGameEndOnline(winner, final_board){
        if(final_board != undefined){
            let sides = final_board.sides;
            let player1_side = sides[this.player1.getName()];
            let player2_side = sides[this.player2.getName()];
            let player1_store = player1_side["store"];
            let player2_store = player2_side["store"];
            let player1_pits = player1_side["pits"];
            let player2_pits = player2_side["pits"];
            let final_player1_score = 0;
            let final_player2_score = 0;

            for(let i = 0; i < player1_pits.length; i++){
                final_player1_score+= player1_pits[i];
            }
            final_player1_score = final_player1_score + player1_store;

            for(let i = 0; i < player2_pits.length; i++){
                final_player2_score+= player2_pits[i];
            }
            final_player2_score = final_player2_score + player2_store;

            //prepare the board for the final display
            for(let i = 0; i < this.board.length; i++){
                this.board[i] = 0;
            }
            this.board[this.player1_storage] = final_player1_score;
            this.board[this.player2_storage] = final_player2_score;
            
            
            this.player1.setScore(final_player1_score);
            this.player2.setScore(final_player2_score);
        }
        
        console.log(winner);
        if(winner == null){
            this.winner = undefined;
        }
        else if(winner == this.player1.getName()){
            this.winner = this.player1;
        }else if(winner == this.player2.getName() ){
            this.winner = this.player2;
        }
    }

    closeUpdate(){
        if(this.updateSource != undefined){
            this.updateSource.close();
            this.updateSource = undefined;
        }
            
        
    }

    serverHandling(username, game){
        this.updateSource = new EventSource( backend + "/update?nick="+username+"&game="+game);

        this.updateSource.onmessage = function(event) {
            console.log(event.data);
            //const newElement = document.createElement("li");
            //const eventList = document.getElementById("demo");
            //newElement.innerHTML =  event.data;
            //eventList.appendChild(newElement);
            const data = JSON.parse(event.data);
            if(data.stores != undefined){
                Mancala.updatePlayersName(data.stores);
                Mancala.updateBoard(data.board);
                Mancala.updateCurrentPlayerOnline(data.board.turn);
                Mancala.buildBoard();
            }
           
            
        
            if(data.winner != undefined){ 
                //on win event display winners and what not and its nasa (and close eventSource)
                console.log("Game ended!");
                Mancala.checkGameEndOnline(data.winner, data.board);
                Mancala.displayWinner();
                Mancala.buildBoard();
                Mancala.closeUpdate();
            }
            //on win event display winners and what not and its nasa (and close eventSource)
            
          }
        
    }

    onlineSow(cavity_num){
        let xhttp_notify = new XMLHttpRequest();

        xhttp_notify.open("POST", backend + '/notify', true);
        xhttp_notify.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp_notify.onreadystatechange = function() {
            if (this.readyState == 4){
                console.log(xhttp_notify.responseText);
                const data = JSON.parse(xhttp_notify.responseText);
                console.log(data);
                if(this.status == 200) {
                    // logIn is successful  
                    document.getElementById("demo").innerHTML = "Logged in with great success!";
                    //assuming the log in was successful
                    let login_container = document.getElementById("container");
                    let logged_in_container = document.getElementById("logged_in_info");
                    let logged_in_name = document.getElementById("logged_in_name");
                    logged_in_name.innerHTML = username;
                    logged_in_container.style.display = "block";
                    logged_in = true;

                    login_container.style.display = "none";
                }else{ //logIn unsuccess

                    document.getElementById("demo").innerHTML = "Log In failed: " + data.error;
                }
            
            }
            
        
        };
        
        let request_body = {nick: username, password: password, game: this.online_hash, move: cavity_num - this.num_of_cavities - 2};
        console.log(request_body);
        xhttp_notify.send(JSON.stringify(request_body));
            
            
        
    }   

    displayWinner(){
        let winner_display = document.getElementById("winner_display");
        let give_up_game_button = document.getElementById("give_up_game_button");
        give_up_button.innerHTML = "END GAME";
        let winner_text = document.createElement("p");
        if(this.winner != undefined){
            if(this.winner.getScore() == 0){
                winner_text.innerHTML = "Winner is: " + this.winner.getName() + "due to the other party giving up!";
            }else{
                winner_text.innerHTML = "Winner is: " + this.winner.getName() + " with a total of " + this.winner.getScore();
            }
             
        }
        else{
            winner_text.innerHTML = "IT'S A TIE YUPIEEEEEE";
        }

        winner_display.appendChild(winner_text);
    }

    addToRankingTable(){
        let rankingsString = window.localStorage.getItem("rankings");
        let ranking_list = [];
        let player1_games = 0;
        let player1_victories = 0;
        let player2_victories = 0;
        let player2_games = 0;
        let loser = (this.winner == this.player1 ? this.player2 : this.player1);
        if(rankingsString != null){
            let rankingObj = JSON.parse(rankingsString);
            ranking_list = rankingObj.rankings;
            let player1_entry = ranking_list.find(element=> element.name == this.player1.getName());
            let player2_entry = ranking_list.find(element=> element.name == this.player2.getName());
            if(player1_entry != undefined){
                player1_games = player1_entry.games;
                player1_victories = player1_entry.victories;
            }
            if(player2_entry != undefined){
                player2_victories = player2_entry.victories;
                player2_games = player2_entry.games;
            }            

            ranking_list = ranking_list.filter(element => element.name != this.player1.getName() && element.name != this.player2.getName());

        }
        

        if(this.winner == undefined){
            ranking_list.push({name : this.player1.getName(), games: 1 + player1_games, victories: 0 + player1_victories });
            ranking_list.push({name : this.player2.getName(), games: 1 + player2_games, victories: 0 + player2_victories});
        }else{
            ranking_list.push({name : this.winner.getName(), games: 1 + (this.winner == this.player1 ? player1_games : player2_games), victories: 1 + (this.winner == this.player1 ? player1_victories : player2_victories) });
            ranking_list.push({name : loser.getName(), games: 1 + (loser == this.player1 ? player1_games : player2_games), victories: 1 + (loser == this.player1 ? player1_victories : player2_victories)});
        }

        ranking_list.sort(function(a,b){
            if (a.victories > b.victories) {
                return 1;
              }
              if (a.victories < b.victories) {
                return -1;
              }
              // a must be equal to b
              return 0;
        });

        const objToStore = {rankings: ranking_list};
        console.log(objToStore);
        rankingsString = JSON.stringify(objToStore);
        window.localStorage.setItem("rankings", rankingsString);
        
    }
    async getCPUMove(board){
        //make local copy of board
        let local_board = [];
        for(let i = 0; i < board.length; i++){
            local_board.push(board[i]);
        }

        let score, move;
        //returns (bestScore, moveForBestScore)
        //isMax is always true cuz we only want the best move for our player2 (CPU)
        await sleep(1000);
        [score, move] = this.findMoveHelper(local_board,this.min_max_depth, true );
        return move;
    }

    findMoveHelper(current_board, depth, isMax){
        if(this.checkGameEnd(current_board)){
            return [(isMax ? -999999: 9999999), -1 ];
        }
        else if(depth == 0){
            return [this.heuristicFunc(current_board), -1];
        }
        let children = this.allPossibleChildren(current_board, isMax);
        let finalScore = 0;
        let finalMove = -1;
        let shouldReplace;
        if(isMax){
            finalScore = -999999;
            shouldReplace = (val) => {return val > finalScore};
        }
        else{
            finalScore = 9999999;
            shouldReplace = (val) => {return val < finalScore};

        }

        for(let i = 0; i < children.length; i++){
            let child = children[i];
            let childMove = child.cavity_played;
            let childBoard = child.board_state;
            let tempVal = this.findMoveHelper(childBoard,depth - 1, !isMax)[0];

            if( shouldReplace(tempVal)){
                finalScore = tempVal;
                finalMove = childMove;
            }
        }

        return [finalScore, finalMove];
    }

   

    heuristicFunc(board){
        let CPUStones = 0;
        let CPUCavities = this.getPlayerTwoCavs();
        for(let i = 0; i < CPUCavities.length; i++ ){
            CPUStones = CPUStones + board[CPUCavities[i]]
        }
        CPUStones = CPUStones + board[this.player2_storage] * 1.5;

        let playerStones = 0;
        let playerCavities = this.getPlayerOneCavs();
        for(let i = 0; i < playerCavities.length; i++ ){
            playerStones = playerStones + board[playerCavities[i]];
        }

        playerStones = playerStones + board[this.player1_storage] * 1.5;

        return CPUStones - playerStones;
    }

    allPossibleChildren(board, isMax){
        let possible_children = [];
        let CPUCavities = [];
        if(isMax){
            CPUCavities = this.getPlayerTwoCavs();
        }else{
            CPUCavities = this.getPlayerOneCavs();
        }
        
        let board_state, last_sowed = 0;
        for(let i = 0; i < CPUCavities.length; i++){
            if(board[CPUCavities[i]] == 0){
                continue;
            }
            [board_state, last_sowed] = this.sow_board(CPUCavities[i], board);
            possible_children.push({board_state: board_state, last_sowed : last_sowed, cavity_played: CPUCavities[i] });
        }
        //all the possible board_states after every single possible valid move by the CPU
        return possible_children;
    }

     sow_board(cavity_num, board){

        //copy the board into a local variable cuz we dont wanna alter it 
        let local_board = [];
        for(let i = 0; i < board.length; i++){
            local_board.push(board[i]);
        }


        let seeds_to_sow = local_board[cavity_num];
        if(seeds_to_sow == 0){
            console.log("Can't play! There are no seeds here!");
            return;
        }
        local_board[cavity_num] = 0;

        let sowing_cav = 0; //index of the board we're sowing
        for(let i = 0; i < seeds_to_sow; i++){
            sowing_cav = (cavity_num + i + 1) % (local_board.length);
            if( sowing_cav == this.oppositePlayersStorage() ){
                seeds_to_sow++;
                continue;
                
            }
            local_board[sowing_cav]++;
        } 
        
        

        
        //test if the last seed got in one of this player's empty cavity
        if(this.isCurrentPlayerCav(sowing_cav) && local_board[sowing_cav] == 1){
            local_board[this.currentPlayersStorage()] = local_board[this.currentPlayersStorage()] + 1 + local_board[this.oppositeCavityTo(sowing_cav)];
            local_board[sowing_cav] = 0;
            local_board[this.oppositeCavityTo(sowing_cav)] = 0;

        }

        return [local_board, sowing_cav];
            
    }

    async sow(cavity_num, display){
        
        let sowing_cav = 0;
        if(this.valid_sow(cavity_num)){
            
            [this.board, sowing_cav] = this.sow_board(cavity_num, this.board);
            
              //last seed was in this player's storage cavity so its his turn to play again
            if(sowing_cav == this.currentPlayersStorage()){
                console.log("The last seed was in this player's storage so he plays again!");
            }else{
                 this.switchCurrentPlayer();

            }

            //check if the game ended here
            if(this.checkGameEnd(this.board)){
                //display end of game shit and update tabelas de classificacao idk
                this.game_end = true;
                console.log("Game ended!");
                this.addToRankingTable();
                if(display){
                    this.displayWinner();
                }
                
            }


            if(display){
                this.buildBoard();
            }
            

            while(this.current_player.getType() == PlayerType.CPU){
                console.log("CPU's move now!");
                
                let cavity_for_CPU_play = await this.getCPUMove(this.board);
                console.log("CPU MOVE: ", cavity_for_CPU_play);
                this.sow(cavity_for_CPU_play, true);
            }
            
            
        }
           
    
    }

    async makeCPUMove(){

        while(this.current_player.getType() == PlayerType.CPU){
            console.log("CPU's move now!");
            let cavity_for_CPU_play = await this.getCPUMove(this.board);
            console.log("CPU MOVE: ", cavity_for_CPU_play);
            this.sow(cavity_for_CPU_play, true);
        }
    }

    switchCurrentPlayer(){
        if(this.current_player.getName() == this.player1.getName()){
            this.current_player = this.player2;
        }else{
            this.current_player = this.player1;
        }
    }


    addSowingListenersSow(){
        var sowingListener = function addSowingListenersToCav(){  
            //this is bound to the cavity div
            let cavity = this;
            let id = cavity.getAttribute("id");
            id = id.charAt(id.length - 1);
            let cavity_num = parseInt(id);
            console.log(cavity_num);
            if(Mancala.isOnline()){
                Mancala.onlineSow(cavity_num);
            }else{
                Mancala.sow(cavity_num,true);
            }
            
        }
        //add the click event listener to a cavity if it's the player's turn to click
        let cavities = document.getElementsByClassName("cavity");
        let cavity_id = 0;
        for(let i = 0; i < cavities.length; i++){
            cavity_id = cavities[i].getAttribute("id");
            cavity_id = cavity_id.charAt(cavity_id.length - 1);
            cavity_id = parseInt(cavity_id);
        
            if(this.isPlayerTwoCav(cavity_id) && this.player2.getType() == PlayerType.CPU){
                //DONT LET US CLICK THE CPUS CAVITIES
                
                continue;
            }
            let listener = sowingListener.bind(cavities[i]);
            cavities[i].addEventListener("click",listener);
        }
        
    }


    updateSeeds(){
        
        for(let i = 0; i < this.board.length; i++){
            let currCavity = document.getElementById('cavity' + i);
            currCavity.innerHTML="";
            let frag = document.createDocumentFragment();
            //add all the initial seeds to one docFrag then append it to all cavities
            for(let b = 0; b < this.board[i]; b++){
                 let newSeed = document.createElement("div");
                 newSeed.setAttribute("class","seed");
                 frag.appendChild(newSeed);
            }
        
            currCavity.appendChild(frag);
            
        }
    }


    showCurrentPlayer(){
        let curr_player_span = document.getElementById("current_player");
        curr_player_span.innerHTML = this.current_player.getName();
    }

    buildGameArea(){
        let board = document.getElementById("board");
        board.style.display = "block";
        //inject into #tabuleiro the number of cavities specified
        let first_row = document.getElementById("row1");
        first_row.innerHTML ="";
        let second_row = document.getElementById("row2");
        second_row.innerHTML ="";
        let frag = document.createDocumentFragment();
        let frag2 = document.createDocumentFragment();
        let current_cav = 1;
        
        let player1_box = document.getElementsByClassName("player_1_seed_box")[0];
        let player2_box = document.getElementsByClassName("player_2_seed_box")[0];
        player1_box.setAttribute("id", "cavity" + this.player1_storage);
        player2_box.setAttribute("id", "cavity" + this.player2_storage);

        //append the seeds to the first row
        for(; current_cav < this.player2_storage;){
            let newCavity = createCavityWithId(current_cav);
            frag.appendChild(newCavity);
            current_cav++;
        }
        first_row.appendChild(frag);
        current_cav = this.player2_storage + 1;
        for(; current_cav < this.board.length;){
            let newCavity = createCavityWithId(current_cav);
            frag2.appendChild(newCavity);
            current_cav++;
        }
        second_row.appendChild(frag2);
        
    }

    buildBoard() {
        this.buildGameArea();
        this.displayPlayersNames();
        this.updateSeeds();
        if(!this.game_end){
            this.showCurrentPlayer();
            this.addSowingListenersSow();
        }
        
    }

    
}


let Mancala = new MancalaGame(2, 2, new MancalaPlayer(PlayerType.Human,"PLAYER 1") , new MancalaPlayer(PlayerType.Human, "PLAYER 2"));  //Mancala game object


let sub_cav_button = document.getElementById("sub_button1");
let add_cav_button = document.getElementById("add_button1");
let sub_seed_button = document.getElementById("sub_button2");
let add_seed_button = document.getElementById("add_button2");
let sub_depth_button = document.getElementById("sub_button3");
let add_depth_button = document.getElementById("add_button3");
let vs_cpu = document.getElementById("options_vs_cpu");
let vs_human = document.getElementById("options_vs_player");
let cpu_start = document.getElementById("options_let_cpu_start");
let human_start = document.getElementById("options_go_first");
let game_start_button = document.getElementById("start_game_button");
let give_up_button = document.getElementById("give_up_game_button");
let login_button = document.getElementById("login_button");
let multiplayer_button = document.getElementById("options_vs_player_multiplayer");
let register_button = document.getElementById("register_button");
let server_rankings_button = document.getElementById("mostrar_classifications_button_server");
let logout_button = document.getElementById("logout_button");
let local_rankings = document.getElementById("mostrar_classifications_button_local");
let backend = 'http://twserver.alunos.dcc.fc.up.pt:8008';

//http://localhost:9043'
//http://twserver.alunos.dcc.fc.up.pt:8008
//http://twserver.alunos.dcc.fc.up.pt:9043


vs_cpu.addEventListener("click", function(){
    vs_cpu.style.backgroundColor = "green";
    multiplayer_button.style.backgroundColor = "grey";
    vs_human.style.backgroundColor = "grey";
    Mancala.addCPUOpponent();
    Mancala.unsetOnline();

})

vs_human.addEventListener("click", function(){
    vs_cpu.style.backgroundColor = "grey";
    multiplayer_button.style.backgroundColor = "grey";
    vs_human.style.backgroundColor = "green";
    Mancala.removeCPUOpponent();
    Mancala.unsetOnline();
})

cpu_start.addEventListener("click", function(){
    Mancala.setCPUStart(true);
    cpu_start.style.backgroundColor = "green";
    human_start.style.backgroundColor = "grey";
})

human_start.addEventListener("click", function(){
    Mancala.setCPUStart(false);
    cpu_start.style.backgroundColor = "grey";
    human_start.style.backgroundColor = "green";
})


add_cav_button.addEventListener("click", function(){
    Mancala.setNumOfCavities( Math.min(20,Mancala.getNumOfCavities() + 2));
    document.getElementById("option_number1").innerHTML = Mancala.getNumOfCavities();
    sub_cav_button.disabled = false;
    if(Mancala.getNumOfCavities() == 20){
        add_cav_button.disabled = true;
    }
})

sub_cav_button.addEventListener("click", function(){
    
    Mancala.setNumOfCavities(Math.max(Mancala.getNumOfCavities() - 2, 2));
    document.getElementById("option_number1").innerHTML = Mancala.getNumOfCavities();
    if(Mancala.getNumOfCavities() == 2){
        sub_cav_button.disabled = true;
    }
    add_cav_button.disabled = false;
})


add_seed_button.addEventListener("click", function(){
    Mancala.setNumOfSeeds(Math.min(20,Mancala.getNumOfSeeds()+ 1));
    document.getElementById("option_number2").innerHTML = Mancala.getNumOfSeeds();
    sub_seed_button.disabled = false;
    if(Mancala.getNumOfSeeds() == 20){
        add_seed_button.disabled = true;
    }
})

sub_seed_button.addEventListener("click", function(){
    
    Mancala.setNumOfSeeds(Math.max(Mancala.getNumOfSeeds()- 1, 1));
    document.getElementById("option_number2").innerHTML = Mancala.getNumOfSeeds();
    if(Mancala.getNumOfSeeds() == 1){
        sub_seed_button.disabled = true;
    }
    add_seed_button.disabled = false;
})


add_depth_button.addEventListener("click", function(){
    Mancala.setDepth( Math.min(8,Mancala.getDepth() + 1));
    document.getElementById("option_number3").innerHTML = Mancala.getDepth();
    sub_depth_button.disabled = false;
    if(Mancala.getDepth() == 8){
        add_depth_button.disabled = true;
    }
})

sub_depth_button.addEventListener("click", function(){
    
    Mancala.setDepth(Math.max(Mancala.getDepth() - 1, 1));
    document.getElementById("option_number3").innerHTML = Mancala.getDepth();
    if(Mancala.getDepth() == 1){
        sub_depth_button.disabled = true;
    }
    add_depth_button.disabled = false;
})


let instructions_button = document.getElementById("mostrar_instructions_button");

instructions_button.addEventListener("click", function(){ 
    let instructions = document.getElementById("instructions");
    if (instructions.style.opacity == "")
    {
        instructions.classList.add("elementToFadeIn");
        setTimeout(function(){instructions.classList.remove("elementToFadeIn"); instructions.style.opacity = "1";}, 4000);
    }
    else if (instructions.style.opacity == "1")
    {
        instructions.classList.add("elementToFadeOut");
        instructions.style.opacity = ""
        setTimeout(function(){instructions.classList.remove("elementToFadeOut");}, 4000);
    }
})



function createCavityWithId(id){
    let newCavity = document.createElement("div");
    newCavity.setAttribute("class","cavity");
    newCavity.setAttribute("id","cavity"+ id);
    
    return newCavity;
}

game_start_button.addEventListener("click", function(){
    //disable the buttons above
    game_start_button.disabled = true;
    add_seed_button.disabled = true;
    add_cav_button.disabled = true;
    sub_cav_button.disabled = true;
    sub_seed_button.disabled = true;
    document.getElementById("winner_display").innerHTML = "";
    if(Mancala.isOnline()){
        
        let queue_display = document.getElementById("queue_display");
        queue_display.style.display = "block";
        if(!logged_in){
            //user is not logged in
            queue_display.innerHTML = "Please log in first before trying to play multiplayer!";
            game_start_button.disabled = false;
            add_seed_button.disabled = false;
            add_cav_button.disabled = false;
            sub_cav_button.disabled = false;
            sub_seed_button.disabled = false;
            return;
        }
        
    
        let xhttp_join = new XMLHttpRequest();
    
        xhttp_join.open("POST",  backend + '/join', true);
        xhttp_join.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhttp_join.onreadystatechange = function() {
            if (this.readyState == 4){
                console.log(xhttp_join.responseText);
                const data = JSON.parse(xhttp_join.responseText);
                console.log(data);
                if( this.status == 200) {
                    //join request has been successful
                    queue_display.innerHTML = "WAITING FOR A MATCH ON: " + data.game;
                    Mancala.setGameHash(data.game);
                    Mancala.resetGameState();
                    Mancala.createBoard();        
                    Mancala.serverHandling(username,data.game);
                }
                else{
                    //join request has been unsuccessful
                    queue_display.innerHTML = "Couldn't join a match: " + data.error;
                }
            }
        };
            
            
        let group = 43;
        let nick_join = username;
        let password_join =  password;
        let size =  Mancala.getNumOfCavities();
        let initial =  Mancala.getNumOfSeeds();
        let request_body = {group: group, nick: nick_join, 
            password: password_join, 
            size: size, initial: initial};
    
        console.log("join request body: ", request_body);
        xhttp_join.send(JSON.stringify(request_body));
    }
    else{
    
        Mancala.resetGameState();
        Mancala.createBoard();
        Mancala.buildBoard();
        if(Mancala.isCPUStart()){
            Mancala.switchCurrentPlayer();
            Mancala.displayPlayersNames();
            Mancala.makeCPUMove();
        }else{
            Mancala.displayPlayersNames();
        }
        
    }

})

give_up_button.addEventListener("click", function(){
    give_up_button.innerHTML = "GIVE UP";
    let board = document.getElementById("board");
    let winner_display = document.getElementById("winner_display");
    winner_display.innerHTML = "";
    board.style.display = "none";
    //disable the buttons above
    game_start_button.disabled = false;
    add_seed_button.disabled = false;
    add_cav_button.disabled = false;
    sub_cav_button.disabled = false;
    sub_seed_button.disabled = false;

    if(Mancala.isOnline()){
        winner_display.innerHTML = "You gave up!";
        Mancala.giveUpOnline();
    }

})

let username = '';
let password = '';
let logged_in = false;

logout_button.addEventListener("click", function(){
    username = '';
    password = '';
    let queue_display = document.getElementById("queue_display");
    queue_display.innerHTML = '';
    let password_field = document.getElementById("password_field");
    let nickname_field = document.getElementById("username_field");
    nickname_field.value = '';
    password_field.value = '';
    let board = document.getElementById("board");

    Mancala.closeUpdate();
    board.style.display = "none";

    let login_container = document.getElementById("container");
    let logged_in_container = document.getElementById("logged_in_info");
    logged_in_container.style.display = "none";
    login_container.style.display = "block";
    logged_in = false;
    
    game_start_button.disabled = false;
    add_seed_button.disabled = false;
    add_cav_button.disabled = false;
    sub_cav_button.disabled = false;
    sub_seed_button.disabled = false;
})

login_button.addEventListener("click", function(){
    let password_field = document.getElementById("password_field");
    let nickname_field = document.getElementById("username_field");
    username = nickname_field.value;
    password = password_field.value;

    let request_body = {nick: username, 
        password: password};
    //make a register request and check its answer
    let xhttp_register = new XMLHttpRequest();
     
    xhttp_register.open("POST", backend + '/register', true);
    xhttp_register.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp_register.onreadystatechange = function() {
        console.log(xhttp_register.responseText);
    
        if (this.readyState == 4){
            const data = JSON.parse(xhttp_register.responseText);
            console.log(data);
             if(this.status == 200) {
                // logIn is successful  
                document.getElementById("demo").innerHTML = "Logged in with great success!";
                 //assuming the log in was successful
                let login_container = document.getElementById("container");
                let logged_in_container = document.getElementById("logged_in_info");
                let logged_in_name = document.getElementById("logged_in_name");
                logged_in_name.innerHTML = username;
                logged_in_container.style.display = "block";
                logged_in = true;

                login_container.style.display = "none";

                //check if this player has an ongoing game and if so, display the board automatically when he logs in
                checkIfPlayerHasGameOnGoing();


            }else{ //logIn unsuccess

                document.getElementById("demo").innerHTML = "Log In failed: " + data.error;
            }
        
        }
        
    
    };

    xhttp_register.send(JSON.stringify(request_body));

   
})

function checkIfPlayerHasGameOnGoing(){
     //make a request to the server to check if this player has an ongoing game
     let xhttp_has_game = new XMLHttpRequest();
     
     xhttp_has_game.open("POST", backend + '/has-game', true);
     xhttp_has_game.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
     xhttp_has_game.onreadystatechange = function() {
         console.log(xhttp_has_game.responseText);
     
         if (this.readyState == 4){
             const data = JSON.parse(xhttp_has_game.responseText);
             console.log(data);
              if(this.status == 200) {
                if(data.game != undefined){
                    //player has ongoing game
                    multiplayer_button.click();
                    game_start_button.disabled = true;
                    Mancala.setGameHash(data.game);
                    Mancala.setNumOfCavities(data.size);
                    Mancala.resetGameState();
                    Mancala.createBoard();        
                    Mancala.serverHandling(username,data.game);

                }else{
                    //player doesn't have an ongoing game
                    console.log("He does not have an ongoing game!");
                }
 
 
             }else{
                 console.log("Something wrong with checkIfPlayerHasGame request!")
             }
         
         }
         
     };

     let request_body = {nick: username};
     xhttp_has_game.send(JSON.stringify(request_body));
}

multiplayer_button.addEventListener("click", function(){
    vs_cpu.style.backgroundColor = "grey";
    multiplayer_button.style.backgroundColor = "green";
    vs_human.style.backgroundColor = "grey";
    Mancala.removeCPUOpponent();
    Mancala.setOnline();

})



register_button.addEventListener("click", function(){
    let password_field = document.getElementById("password_field");
    let nickname_field = document.getElementById("username_field");
    username = nickname_field.value;
    password = password_field.value;
    console.log(username, password);
    let request_body = {nick: username, 
        password: password};

    console.log("register request body: ", request_body);
    //register
    let xhttp_register = new XMLHttpRequest();

    xhttp_register.open("POST", backend + '/register', true);
    xhttp_register.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhttp_register.onreadystatechange = function() {
        console.log(xhttp_register.responseText);
        if (this.readyState == 4){
            const data = JSON.parse(xhttp_register.responseText);
            console.log(data);
             if(this.status == 200) {
                // register is successful  
                document.getElementById("demo").innerHTML = "Registered " + username + " with password " + password + " correctly!";
            }else{ //register unsuccess

                document.getElementById("demo").innerHTML = "Register failed: " + data.error;
            }
        
        }
        
    
    };

    xhttp_register.send(JSON.stringify(request_body));
})

let rankings_display = false;
let rankings_local_display = false;

mostrar_classifications_button_local.addEventListener("click", function(){

    let classifications = document.getElementById("classifications_local");
    classifications.innerHTML = "";

    rankings_local_display = !rankings_local_display;
    if(!rankings_local_display){
        classifications.style.display = "none";
        return;
    }else{
        classifications.style.display = "block";
    }

    let rankingsString = window.localStorage.getItem("rankings");
    let rankingsList = [];
    if(rankingsString != null){
        rankingsList = JSON.parse(rankingsString).rankings;

    }

    let new_div = document.createElement("div");
    new_div.setAttribute("id", "classification_term");
    let son_div1 = document.createElement("div");
    son_div1.setAttribute("id", "son_classification_term")
    son_div1.innerHTML = " PLACE ";
    let son_div2 = document.createElement("div");
    son_div2.setAttribute("id", "son_classification_term")
    son_div2.innerHTML = " NICKNAME ";
    let son_div3 = document.createElement("div");
    son_div3.setAttribute("id", "son_classification_term")
    son_div3.innerHTML = " VICTORIES ";
    let son_div4 = document.createElement("div");
    son_div4.setAttribute("id", "son_classification_term")
    son_div4.innerHTML = " GAMES ";

    new_div.appendChild(son_div1)
    new_div.appendChild(son_div2)
    new_div.appendChild(son_div3)
    new_div.appendChild(son_div4)
    classifications.appendChild(new_div);
    for(let i = 0; i < rankingsList.length; i++){
        let individual_ranking = rankingsList[i];
        let new_div = document.createElement("div");
        new_div.setAttribute("id", "classification_term");
        let son_div1 = document.createElement("div");
        son_div1.setAttribute("id", "son_classification_term")
        son_div1.innerHTML = (i + 1).toString() + ". ";
        let son_div2 = document.createElement("div");
        son_div2.setAttribute("id", "son_classification_term")
        son_div2.innerHTML = individual_ranking.name;
        let son_div3 = document.createElement("div");
        son_div3.setAttribute("id", "son_classification_term")
        son_div3.innerHTML = individual_ranking.victories;
        let son_div4 = document.createElement("div");
        son_div4.setAttribute("id", "son_classification_term")
        son_div4.innerHTML = individual_ranking.games;
        
        new_div.appendChild(son_div1)
        new_div.appendChild(son_div2)
        new_div.appendChild(son_div3)
        new_div.appendChild(son_div4)
        classifications.appendChild(new_div);
    }

})

server_rankings_button.addEventListener("click", function(){
    let classifications = document.getElementById("classifications_server");
    classifications.innerHTML = "";

    rankings_display = !rankings_display;
    if(!rankings_display){
        classifications.style.display = "none";
        return;
    }else{
        classifications.style.display = "block";
    }

    //rankings
    let xhttp_ranking = new XMLHttpRequest();

    xhttp_ranking.open("POST", backend + '/ranking', true);
    xhttp_ranking.onreadystatechange = function() {
        console.log(xhttp_ranking.responseText);
        if (this.readyState == 4 && this.status == 200) {
        // Typical action to be performed when the document is ready:
        
        const data = JSON.parse(xhttp_ranking.responseText);
        console.log(data);
        let new_div = document.createElement("div");
        new_div.setAttribute("id", "classification_term");
        let son_div1 = document.createElement("div");
        son_div1.setAttribute("id", "son_classification_term")
        son_div1.innerHTML = " PLACE ";
        let son_div2 = document.createElement("div");
        son_div2.setAttribute("id", "son_classification_term")
        son_div2.innerHTML = " NICKNAME ";
        let son_div3 = document.createElement("div");
        son_div3.setAttribute("id", "son_classification_term")
        son_div3.innerHTML = " VICTORIES ";
        let son_div4 = document.createElement("div");
        son_div4.setAttribute("id", "son_classification_term")
        son_div4.innerHTML = " GAMES ";
    
        new_div.appendChild(son_div1)
        new_div.appendChild(son_div2)
        new_div.appendChild(son_div3)
        new_div.appendChild(son_div4)
        classifications.appendChild(new_div);
            for(let i = 0; i < data.ranking.length; i++){
                let individual_ranking = data.ranking[i];
                let new_div = document.createElement("div");
                new_div.setAttribute("id", "classification_term");
                let son_div1 = document.createElement("div");
                son_div1.setAttribute("id", "son_classification_term")
                son_div1.innerHTML = (i + 1).toString() + ". ";
                let son_div2 = document.createElement("div");
                son_div2.setAttribute("id", "son_classification_term")
                son_div2.innerHTML = individual_ranking.nick
                let son_div3 = document.createElement("div");
                son_div3.setAttribute("id", "son_classification_term")
                son_div3.innerHTML = individual_ranking.victories;
                let son_div4 = document.createElement("div");
                son_div4.setAttribute("id", "son_classification_term")
                son_div4.innerHTML = individual_ranking.games;
                
                new_div.appendChild(son_div1)
                new_div.appendChild(son_div2)
                new_div.appendChild(son_div3)
                new_div.appendChild(son_div4)
                classifications.appendChild(new_div);
            }
        }
        
    };

    xhttp_ranking.send(JSON.stringify({}));
})


