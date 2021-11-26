let num_of_cavities = 2;
let num_of_seeds_per_cav = 2;

let sub_cav_button = document.getElementById("sub_button1");
let add_cav_button = document.getElementById("add_button1");
let sub_seed_button = document.getElementById("sub_button2");
let add_seed_button = document.getElementById("add_button2");
let vs_cpu = document.getElementById("options_vs_cpu");
let vs_human = document.getElementById("options_vs_player");
let cpu_start = document.getElementById("options_let_cpu_start");
let human_start = document.getElementById("options_go_first");

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
    num_of_cavities = Math.min(20,num_of_cavities+ 1);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    sub_cav_button.disabled = false;
    if(num_of_cavities == 20){
        add_cav_button.disabled = true;
    }
})

sub_cav_button.addEventListener("click", function(){
    
    num_of_cavities = Math.max(num_of_cavities - 1, 2);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    if(num_of_cavities == 2){
        sub_cav_button.disabled = true;
    }
    add_cav_button.disabled = false;
})

add_seed_button.addEventListener("click", function(){
    num_of_seeds_per_cav = Math.min(20,num_of_seeds_per_cav+ 1);
    document.getElementById("option_number2").innerHTML = num_of_seeds_per_cav;
    sub_seed_button.disabled = false;
    if(num_of_seeds_per_cav == 20){
        add_seed_button.disabled = true;
    }
})

sub_seed_button.addEventListener("click", function(){
    
    num_of_seeds_per_cav = Math.max(num_of_seeds_per_cav- 1, 1);
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



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function createCavityWithId(id){
    let newCavity = document.createElement("div");
        newCavity.setAttribute("class","cavity");
        newCavity.setAttribute("id","cavity"+ id);

        //add sowing function
        newCavity.addEventListener("click", function(){
            console.log("SOW");
            
            let NumCavitySeeds = newCavity.getElementsByClassName('seed').length;
            for (let i = 1; i < NumCavitySeeds + 1;i++){
                
                let sowToCav = document.getElementById('cavity' + ((id + i) % num_of_cavities).toString() );
                sowToCav.appendChild(newCavity.childNodes[0]);
                
            }
         });
    return newCavity;
}

document.getElementById("start_game_button").addEventListener("click", function(){
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
    addSeedsToCavsInitial();
})

function addSeedsToCavsInitial(){
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