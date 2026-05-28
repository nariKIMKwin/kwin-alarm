window.addEventListener("DOMContentLoaded", () => {

    const logo = document.querySelector(".logo");
    const screenSaver = document.getElementById("screenSaver");

    if (!logo || !screenSaver) {
        console.log("로고 또는 화면보호기 요소를 못 찾음");
        return;
    }

    let pressTimer = null;

    function startPress() {
        clearTimeout(pressTimer);

        pressTimer = setTimeout(() => {
            screenSaver.classList.add("active");
        }, 1000);
    }

    function cancelPress() {
        clearTimeout(pressTimer);
    }

    logo.addEventListener("mousedown", startPress);
    logo.addEventListener("mouseup", cancelPress);
    logo.addEventListener("mouseleave", cancelPress);

    logo.addEventListener("touchstart", (e) => {
        e.preventDefault();
        startPress();
    });

    logo.addEventListener("touchend", cancelPress);

    screenSaver.addEventListener("click", () => {
        screenSaver.classList.remove("active");
    });

    function updateDateTime(){

        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const date = String(now.getDate()).padStart(2, "0");

        let hour = now.getHours();
        const minute = String(now.getMinutes()).padStart(2, "0");
const days = ["일", "월", "화", "수", "목", "금", "토"];
const day = days[now.getDay()];

        const ampm = hour >= 12 ? "오후" : "오전";

        hour = hour % 12;
        hour = hour ? hour : 12;

        document.getElementById("screenDate").innerHTML =
        `
        <span class="year">${year}년</span>
       <span class="full-date">${month}월 ${date}일 (${day})</span>
        `;
const colon = ":";
        document.getElementById("screenTime").innerHTML =
        `${ampm} ${String(hour).padStart(2, "0")}${colon}${minute}`;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

});