let Mancala;  //Mancala game object

class PlayerType {
    // Create new instances of the same class as static attributes
    static Human = new PlayerType("Human")
    static CPU = new PlayerType("CPU")
  
    constructor(name) {
      this.name = name
    }


}

class MancalaPlayer{
    constructor(playerType){
        this.score = 0;
        this.playerType = playerType;

    }



}

class MancalaGame{
    constructor(num_of_cavities, num_of_seeds_per_cav, player1, player2, current_player){
        this.num_of_cavities = num_of_cavities;
        this.num_of_seeds_per_cav = num_of_seeds_per_cav;
        this.player1 = player1;
        this.player2 = player2;
        this.current_player = current_player;
        this.board = [];
        this.sowingListeners = [];
        for(let i = 0; i < num_of_cavities; i++){
            this.board.push(num_of_seeds_per_cav);
        }
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


    buildBoard() {
        buildGameArea(this.num_of_cavities, this.num_of_seeds_per_cav);
    }

    addSowingListenersSow(){
        //add the click event listener to a cavity if it's the player's turn to click
        let cavities = document.getElementsByClassName("cavity");

        for(let i = 0; i < cavities.length; i++){
            let listener = sowingListener.bind(cavities[i])
            this.sowingListeners.push(listener);
            cavities[i].addEventListener("click",listener);
        }
        
    }

    removeSowingListenersSow(){
        //remove the click eventListener
        let cavities = document.getElementsByClassName("cavity");
        for(let i = cavities.length - 1; i >= 0; i--){
            cavities[i].removeEventListener("click",this.sowingListeners.pop());
            
        }
    
    }

    play(){
        
    }
}



let sub_cav_button = document.getElementById("sub_button1");
let add_cav_button = document.getElementById("add_button1");
let sub_seed_button = document.getElementById("sub_button2");
let add_seed_button = document.getElementById("add_button2");
let vs_cpu = document.getElementById("options_vs_cpu");
let vs_human = document.getElementById("options_vs_player");
let cpu_start = document.getElementById("options_let_cpu_start");
let human_start = document.getElementById("options_go_first");

var sowingListener = function addSowingListenersToCav(){  
    //this is bound to the cavity div
    let cavity = this;
    let id = cavity.getAttribute("id");
    id = id.charAt(id.length - 1);
    let NumCavitySeeds = cavity.getElementsByClassName('seed').length;

    for (let i = 1; i < NumCavitySeeds + 1;i++){
        let sowToCav = document.getElementById('cavity' + ((id + i) % Mancala.getNumOfCavities()).toString() );
    

        sowToCav.appendChild(cavity.childNodes[0]);

    }
}

vs_cpu.addEventListener("click", function(){
    vs_cpu.style.backgroundColor = "green";
    vs_human.style.backgroundColor = "grey";
})

vs_human.addEventListener("click", function(){
    vs_cpu.style.backgroundColor = "grey";
    vs_human.style.backgroundColor = "green";
})

cpu_start.addEventListener("click", function(){
    cpu_start.style.backgroundColor = "green";
    human_start.style.backgroundColor = "grey";
})

human_start.addEventListener("click", function(){
    cpu_start.style.backgroundColor = "grey";
    human_start.style.backgroundColor = "green";
})

add_cav_button.addEventListener("click", function(){
    let num_of_cavities = Math.min(20,Mancala.getNumOfCavities() + 1);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    sub_cav_button.disabled = false;
    if(num_of_cavities == 20){
        add_cav_button.disabled = true;
    }
})

sub_cav_button.addEventListener("click", function(){
    
    let num_of_cavities = Math.max(Mancala.getNumOfCavities() - 1, 2);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    if(num_of_cavities == 2){
        sub_cav_button.disabled = true;
    }
    add_cav_button.disabled = false;
})

add_seed_button.addEventListener("click", function(){
    let num_of_seeds_per_cav = Math.min(20,Mancala.getNumOfSeeds()+ 1);
    document.getElementById("option_number2").innerHTML = num_of_seeds_per_cav;
    sub_seed_button.disabled = false;
    if(num_of_seeds_per_cav == 20){
        add_seed_button.disabled = true;
    }
})

sub_seed_button.addEventListener("click", function(){
    
    let num_of_seeds_per_cav = Math.max(Mancala.getNumOfSeeds()- 1, 1);
    document.getElementById("option_number2").innerHTML = num_of_seeds_per_cav;
    if(num_of_seeds_per_cav == 1){
        sub_seed_button.disabled = true;
    }
    add_seed_button.disabled = false;
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

document.getElementById("start_game_button").addEventListener("click", function(){
    let num_of_cavities = document.getElementById("option_number1").innerHTML;
    let num_of_seeds_per_cav = document.getElementById("option_number2").innerHTML;
    Mancala = new MancalaGame(num_of_cavities,num_of_seeds_per_cav);
    Mancala.buildBoard();
    Mancala.addSowingListenersSow();
})

function buildGameArea(num_of_cavities, num_of_seeds_per_cav){
    let board = document.getElementById("board");
    board.style.display = "block";
    //inject into #tabuleiro the number of cavities specified
    let first_row = document.getElementById("row1");
    first_row.innerHTML ="";
    let second_row = document.getElementById("row2");
    second_row.innerHTML ="";
    let frag = document.createDocumentFragment();
    let frag2 = document.createDocumentFragment();
    let current_cav = 0;
    for(; current_cav < num_of_cavities/2;){
        let newCavity = createCavityWithId(current_cav);
        frag.appendChild(newCavity);
        current_cav++;
    }
    first_row.appendChild(frag);
    for(; current_cav < num_of_cavities;){
        let newCavity = createCavityWithId(current_cav);
        frag2.appendChild(newCavity);
        current_cav++;
    }
    second_row.appendChild(frag2);
    addSeedsToCavsInitial(num_of_seeds_per_cav);
}

function addSeedsToCavsInitial(num_of_seeds_per_cav){
    let cavities = document.getElementsByClassName('cavity');
    for(let i = 0; i < cavities.length; i++){
        let frag = document.createDocumentFragment();
        //add all the initial seeds to one docFrag then append it to all cavities
        for(let i = 0; i < num_of_seeds_per_cav; i++){
             let newCavity = document.createElement("div");
             newCavity.setAttribute("class","seed");
             frag.appendChild(newCavity);
        }
       cavities[i].appendChild(frag);
        
    }
}


