window.addEventListener("DOMContentLoaded", () => {

    const logo = document.querySelector(".logo");
    const screenSaver = document.getElementById("screenSaver");
    const screenDate = document.getElementById("screenDate");
    const visitorCard = document.getElementById("visitorCard");

    if (!logo || !screenSaver) {
        console.log("로고 또는 화면보호기 요소를 못 찾음");
        return;
    }

    let pressTimer = null;
    let visitorPressTimer = null;

    function renderVisitors(){

        const card = document.getElementById("visitorCard");
        const list = document.getElementById("visitorList");

        if(!card || !list){
            return;
        }

        const visitors =
            JSON.parse(localStorage.getItem("kwinVisitors") || "[]");

        if(visitors.length === 0){
            card.style.display = "none";
            list.innerHTML = "";
            return;
        }

        card.style.display = "block";

        visitors.sort((a,b) =>
            a.time.localeCompare(b.time)
        );

        localStorage.setItem(
            "kwinVisitors",
            JSON.stringify(visitors)
        );

        list.innerHTML = "";

        visitors.forEach((v, index) => {

            list.innerHTML += `
                <div class="visitor-item" data-index="${index}">
                    <div class="visitor-time">${v.time}</div>
                    <div class="visitor-name">${v.company}</div>
                </div>
            `;

        });

        document.querySelectorAll(".visitor-item").forEach(item => {

            let deleteTimer = null;

            function startDelete(e){
                e.stopPropagation();

                clearTimeout(deleteTimer);

                deleteTimer = setTimeout(() => {

                    const idx = Number(item.dataset.index);

                    const visitors =
                        JSON.parse(localStorage.getItem("kwinVisitors") || "[]");

                    if(confirm("이 방문 일정을 삭제하시겠습니까?")){

                        visitors.splice(idx, 1);

                        localStorage.setItem(
                            "kwinVisitors",
                            JSON.stringify(visitors)
                        );

                        renderVisitors();
                    }

                }, 2000);
            }

            function cancelDelete(e){
                if(e){
                    e.stopPropagation();
                }

                clearTimeout(deleteTimer);
            }

            item.addEventListener("mousedown", startDelete);
            item.addEventListener("mouseup", cancelDelete);
            item.addEventListener("mouseleave", cancelDelete);

            item.addEventListener("touchstart", (e) => {
                e.preventDefault();
                startDelete(e);
            });

            item.addEventListener("touchend", cancelDelete);
        });
    }

    function addVisitor(){

        const time = prompt("방문 시간 입력 (예: 10:00)");

        if(!time){
            return;
        }

        const company = prompt("업체명");

        if(!company){
            return;
        }

        const visitors =
            JSON.parse(localStorage.getItem("kwinVisitors") || "[]");

        visitors.push({
            time: time.trim(),
            company: company.trim()
        });

        localStorage.setItem(
            "kwinVisitors",
            JSON.stringify(visitors)
        );

        renderVisitors();
    }

    function startVisitorPress(e){

        e.stopPropagation();

        clearTimeout(visitorPressTimer);

        visitorPressTimer = setTimeout(() => {
            addVisitor();
        }, 1000);
    }

    function cancelVisitorPress(e){

        if(e){
            e.stopPropagation();
        }

        clearTimeout(visitorPressTimer);
    }

    if(screenDate){

        screenDate.addEventListener("mousedown", startVisitorPress);
        screenDate.addEventListener("mouseup", cancelVisitorPress);
        screenDate.addEventListener("mouseleave", cancelVisitorPress);

        screenDate.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        screenDate.addEventListener("touchstart", (e) => {
            e.preventDefault();
            startVisitorPress(e);
        });

        screenDate.addEventListener("touchend", cancelVisitorPress);
    }

    if(visitorCard){
        visitorCard.addEventListener("click", (e) => {
            e.stopPropagation();
        });
    }

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

        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const day = days[now.getDay()];

        let hour = now.getHours();
        const minute = String(now.getMinutes()).padStart(2, "0");

        const ampm = hour >= 12 ? "오후" : "오전";

        hour = hour % 12;
        hour = hour ? hour : 12;

        document.getElementById("screenDate").innerHTML =
        `
            <span class="year">${year}년</span>
            <span class="full-date">${month}월 ${date}일 (${day})</span>
        `;

        document.getElementById("screenTime").innerHTML =
            `${ampm} ${String(hour).padStart(2, "0")}:${minute}`;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);

    const screenSlogan = document.getElementById("screenSlogan");

    if (screenSlogan) {

        const savedSlogan = localStorage.getItem("kwinScreenSlogan");

        if (savedSlogan) {
            screenSlogan.innerHTML = savedSlogan.replace(/\n/g, "<br>");
        }

        let sloganPressTimer = null;

        function editSlogan() {

            const currentText = screenSlogan.innerText.trim();

            const newText = prompt("화면 문구를 수정하세요", currentText);

            if (newText !== null && newText.trim() !== "") {
                localStorage.setItem("kwinScreenSlogan", newText.trim());
                screenSlogan.innerHTML = newText.trim().replace(/\n/g, "<br>");
            }
        }

        function startSloganPress(e) {
            e.stopPropagation();

            clearTimeout(sloganPressTimer);

            sloganPressTimer = setTimeout(() => {
                editSlogan();
            }, 1000);
        }

        function cancelSloganPress(e) {
            e.stopPropagation();
            clearTimeout(sloganPressTimer);
        }

        screenSlogan.addEventListener("mousedown", startSloganPress);
        screenSlogan.addEventListener("mouseup", cancelSloganPress);
        screenSlogan.addEventListener("mouseleave", cancelSloganPress);

        screenSlogan.addEventListener("touchstart", (e) => {
            e.preventDefault();
            startSloganPress(e);
        });

        screenSlogan.addEventListener("touchend", cancelSloganPress);
    }

    renderVisitors();
});