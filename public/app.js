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
    display.style.fontSize = "90px";

    setTimeout(() => {

        display.innerHTML = "대기중";
        display.style.fontSize = "120px";

    }, 3000);

});

socket.on("updateCalls", (calls) => {

    // 호출 오면 화면보호기 자동 종료
    if(calls.length > 0 && screenSaver){
        screenSaver.classList.remove("active");
    }

    if(calls.length === 0){

        display.innerHTML = "대기중";
        display.classList.remove("active");
        display.style.fontSize = "120px";

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

        display.style.fontSize = "120px";

    }
    else if(calls.length === 2){

        display.style.fontSize = "90px";

    }
    else{

        display.style.fontSize = "65px";

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

    display.style.fontSize = "100px";

    setTimeout(() => {

        display.innerHTML = "대기중";

        display.style.fontSize = "120px";

    }, 3000);

});