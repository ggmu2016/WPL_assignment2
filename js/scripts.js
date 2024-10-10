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