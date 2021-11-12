let sub_button = document.getElementById("sub_button1");
document.getElementById("add_button1").addEventListener("click", function(){
    document.getElementById("option_number1").innerHTML++;
    sub_button.disabled = false;
})

document.getElementById("sub_button1").addEventListener("click", function(){
    
    document.getElementById("option_number1").innerHTML = Math.max(document.getElementById("option_number1").innerHTML- 1, 0);
    
    if(document.getElementById("option_number1").innerHTML == "0"){
        sub_button.disabled = true;
    }
})