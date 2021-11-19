
let num_of_cavities = 0;
let num_of_seeds_per_cav = 0;

let sub_cav_button = document.getElementById("sub_button1");
let add_cav_button = document.getElementById("add_button1");
let sub_seed_button = document.getElementById("sub_button2");
let add_seed_button = document.getElementById("add_button2");

add_cav_button.addEventListener("click", function(){
    num_of_cavities = Math.min(20,num_of_cavities+ 1);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    sub_cav_button.disabled = false;
    if(num_of_cavities == 20){
        add_cav_button.disabled = true;
    }
})

sub_cav_button.addEventListener("click", function(){
    
    num_of_cavities = Math.max(num_of_cavities- 1, 0);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    if(num_of_cavities == 0){
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
    
    num_of_seeds_per_cav = Math.max(num_of_seeds_per_cav- 1, 0);
    document.getElementById("option_number2").innerHTML = num_of_seeds_per_cav;
    if(num_of_seeds_per_cav == 0){
        sub_seed_button.disabled = true;
    }
    add_seed_button.disabled = false;
})

document.getElementById("start_game_button").addEventListener("click", function(){
    //inject into #tabuleiro the number of cavities specified
    let first_row = document.getElementById("row1");
    first_row.innerHTML ="";
    let second_row = document.getElementById("row2");
    second_row.innerHTML ="";
    var frag = document.createDocumentFragment();
    var frag2 = document.createDocumentFragment();
    let current_cav = 0;
    for(; current_cav < num_of_cavities/2;){
        let newCavity = document.createElement("div");
        newCavity.setAttribute("class","cavity");
        newCavity.setAttribute("id","cavity"+ current_cav);
        frag.appendChild(newCavity);
        current_cav++;
    }
    first_row.appendChild(frag);
    for(; current_cav < num_of_cavities;){
        let newCavity = document.createElement("div");
        newCavity.setAttribute("class","cavity");
        newCavity.setAttribute("id","cavity"+ current_cav);
        frag2.appendChild(newCavity);
        current_cav++;
    }
    second_row.appendChild(frag2);
})
