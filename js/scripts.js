let colorPicker;
const defaultColor = "#ffffff";

window.addEventListener("load", startup, false);

function startup(){
    colorPicker = document.querySelector("#colorPicker");
    colorPicker.value = defaultColor;
    colorPicker.addEventListener("change", updateBg, false); // could also be type:input for immediate change
    colorPicker.select();
}

function updateBg (event){
    const body = document.querySelector("body");
    if (body){
        body.style.backgroundColor = event.target.value;
    }

    const bgtext = document.querySelector("#bgtext");
    bgtext.textContent = event.target.value;
}

function updateSlider(){
    var slider = document.getElementById("slideRange");
    var sliderOutput = document.getElementById("fontSize");
    var bodyContent = document.getElementById("bodyContent");

    sliderOutput.textContent = slider.value;

    slider.oninput = function() {
        sliderOutput.innerHTML = slider.value;
        bodyContent.style.fontSize = slider.value + "px";
    }
}


function updateTime(){
    const now = new Date();
    const currentDateTime = now.toLocaleString();
    document.querySelector('#datetime').textContent = currentDateTime;
}

setInterval(updateTime, 1000);