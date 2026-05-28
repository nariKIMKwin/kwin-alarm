const socket = io();

const display = document.getElementById("display");
const bellSound = document.getElementById("bellSound");
const screenSaver = document.getElementById("screenSaver");

const names = [
    "김은하 실장",
    "이유빈 과장",
    "김나리 과장",
    "박규용 과장"
];

function resizeApp(){

    const app = document.getElementById("appScale");

    if(!app){
        return;
    }

    // 모바일
    if(window.innerWidth <= 768){

        app.style.width = "100%";
        app.style.height = "auto";

        app.style.position = "relative";

        app.style.transform = "none";

        app.style.left = "0";
        app.style.top = "0";

        return;
    }

    // PC / TV
    const baseWidth = 1920;
    const baseHeight = 1080;

    const scaleX = window.innerWidth / baseWidth;
    const scaleY = window.innerHeight / baseHeight;

    const scale = Math.min(scaleX, scaleY);

    app.style.width = baseWidth + "px";
    app.style.height = baseHeight + "px";

    app.style.position = "absolute";

    app.style.transform = `scale(${scale})`;

    app.style.left =
        ((window.innerWidth - (baseWidth * scale)) / 2) + "px";

    app.style.top =
        ((window.innerHeight - (baseHeight * scale)) / 2) + "px";
}

window.addEventListener("resize", resizeApp);
window.addEventListener("load", resizeApp);

function callBell(name){
    socket.emit("callBell", name);
}

function setStatus(name, status){
    socket.emit("setStatus", {
        name: name,
        status: status
    });
}

function confirmCall(){
    socket.emit("confirmCall");
}

function cancelCall(){
    socket.emit("cancelCall");
}

function isMobile(){
    return window.innerWidth <= 768;
}
function setDisplayFont(pcSize, mobileVw, maxPx){

    if(isMobile()){

        const vwSize = window.innerWidth * (mobileVw / 100);
        const finalSize = Math.min(vwSize, maxPx);

        display.style.setProperty("font-size", finalSize + "px", "important");

    }
    else{

        display.style.setProperty("font-size", pcSize, "important");

    }

}
function addLongPressEvent(name){

    const outBtn = document.getElementById(name + "_out");

    if(!outBtn){
        return;
    }

    let timer = null;
    let isLongPress = false;

    outBtn.addEventListener("mousedown", () => {

        isLongPress = false;

        timer = setTimeout(() => {

            isLongPress = true;

            setStatus(name, "leave");

        }, 2000);

    });

    outBtn.addEventListener("mouseup", () => {

        clearTimeout(timer);

        if(!isLongPress){

            setStatus(name, "out");

        }

    });

    outBtn.addEventListener("mouseleave", () => {

        clearTimeout(timer);

    });

    outBtn.addEventListener("touchstart", (e) => {

        e.preventDefault();

        isLongPress = false;

        timer = setTimeout(() => {

            isLongPress = true;

            setStatus(name, "leave");

        }, 3000);

    });

    outBtn.addEventListener("touchend", () => {

        clearTimeout(timer);

        if(!isLongPress){

            setStatus(name, "out");

        }

    });

}

names.forEach(name => {

    addLongPressEvent(name);

});

socket.on("updateStatus", (statusData) => {

    Object.keys(statusData).forEach(name => {

        const inBtn = document.getElementById(name + "_in");
        const outBtn = document.getElementById(name + "_out");

        if(!inBtn || !outBtn){
            return;
        }

        inBtn.classList.remove("active-status");
        outBtn.classList.remove("active-status");

        if(statusData[name] === "in"){

            inBtn.innerHTML = "🟢 재실";
            outBtn.innerHTML = "⚪ 부재중";

            inBtn.classList.add("active-status");

        }
        else if(statusData[name] === "out"){

            inBtn.innerHTML = "⚪ 재실";
            outBtn.innerHTML = "🟢 부재중";

            outBtn.classList.add("active-status");

        }
        else if(statusData[name] === "leave"){

            inBtn.innerHTML = "⚪ 재실";
            outBtn.innerHTML = "🟢 연차";

            outBtn.classList.add("active-status");

        }

    });

});

socket.on("absentCall", (data) => {

    if(screenSaver){

        screenSaver.classList.remove("active");

    }

    if(data.status === "leave"){

        display.innerHTML =
            "🏠🕺 " + data.area + "<br>연차입니다";

    }
    else{

        display.innerHTML =
            "🚪🚶 " + data.area + "<br>부재중입니다";

    }

    display.classList.remove("active");

    setDisplayFont("90px", 8.5, 52);

    setTimeout(() => {

        display.innerHTML = "대기중";

        setDisplayFont("120px", 15, 72);

    }, 3000);

});

socket.on("updateCalls", (calls) => {

    if(calls.length > 0 && screenSaver){

        screenSaver.classList.remove("active");

    }

    if(calls.length === 0){

        display.innerHTML = "대기중";

        display.classList.remove("active");

        setDisplayFont("120px", 15, 72);

        return;
    }

    let html = "";

    calls.forEach(call => {

        if(call.status === "confirm"){

            html +=
                "✅ " + call.area + " 호출-확인<br>";

        }
        else{

            html +=
                "🔔 " + call.area + " 🔔<br>";

        }

    });

    display.innerHTML = html;

    if(calls.length === 1){

        setDisplayFont("120px", 8.5, 72);

    }
    else if(calls.length === 2){

        setDisplayFont("90px", 8.5, 52);

    }
    else{

        setDisplayFont("65px", 8.5, 40);

    }

    const hasCalling =
        calls.some(call => call.status !== "confirm");

    if(hasCalling){

        display.classList.add("active");

        if(bellSound){

            bellSound.currentTime = 0;

            bellSound.play().catch(() => {});

        }

    }
    else{

        display.classList.remove("active");

    }

});

socket.on("cancelCall", () => {

    if(screenSaver){

        screenSaver.classList.remove("active");

    }

    display.innerHTML = "호출 취소";

    display.classList.remove("active");

    setDisplayFont("100px", 13, 60);

    setTimeout(() => {

        display.innerHTML = "대기중";

        setDisplayFont("120px", 15, 72);

    }, 3000);

});

resizeApp();