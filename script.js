
let num_of_cavities = 0;
let sub_button = document.getElementById("sub_button1");
let add_button = document.getElementById("add_button1");
add_button.addEventListener("click", function(){
    num_of_cavities = Math.min(20,num_of_cavities+ 1);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    sub_button.disabled = false;
    if(num_of_cavities == 20){
        add_button.disabled = true;
    }
})

sub_button.addEventListener("click", function(){
    
    num_of_cavities = Math.max(document.getElementById("option_number1").innerHTML- 1, 0);
    document.getElementById("option_number1").innerHTML = num_of_cavities;
    if(num_of_cavities == 0){
        sub_button.disabled = true;
    }
    add_button.disabled = false;
})

document.getElementById("start_game_button").addEventListener("click", function(){
    //inject into #tabuleiro the number of cavities specified
    let first_row = document.getElementById("row1");
    first_row.innerHTML ="";
    let second_row = document.getElementById("row2");
    second_row.innerHTML ="";
    var frag = document.createDocumentFragment();
    var frag2 = document.createDocumentFragment();
    for(var i = 0; i < num_of_cavities/2; i++){
        let newCavity = document.createElement("div");
        newCavity.setAttribute("class","cavity");
        newCavity.setAttribute("id","cavity"+ i);
        frag.appendChild(newCavity);
    }
    first_row.appendChild(frag);
    for(var i = num_of_cavities/2; i < num_of_cavities; i++){
        let newCavity = document.createElement("div");
        newCavity.setAttribute("class","cavity");
        newCavity.setAttribute("id","cavity"+ i);
        frag2.appendChild(newCavity);
    }
    second_row.appendChild(frag2);
})
