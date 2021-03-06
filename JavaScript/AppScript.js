let answers = document.getElementById("answers");
const URL  = "https://codecyprus.org/th/api/";
const appName = "team7";
const sortType = "sorted";
const limit = "5";
let treasureHuntID;
let score;


function getChallenges(){
    fetch(URL + "list")
        .then(response => response.json())
        .then(jsonObject => {
            if (jsonObject.status === "OK") {
                let challengesList = document.getElementById("challenges");
                //empty the list
                challengesList.innerHTML = "";
                let treasureHunts = jsonObject.treasureHunts;
                for (let i = 0; i < treasureHunts.length; i++) {
                    let listItem = document.createElement("ul");
                    listItem.className="listitem";
                    let description = document.createElement("li");
                    description.className="description";

                    let Prize = document.createElement("li");
                    Prize.className="prize"

                    let time = document.createElement("li");
                    time.className="time";

                    let startTime = new Date(treasureHunts[i].startsOn*1000);


                    let endTime = new Date(treasureHunts[i].endsOn*1000);

                    var prizeResult;
                    if(treasureHunts[i].hasPrize){prizeResult = "Yes"}else{prizeResult = "No"}
                    listItem.innerHTML = "<a href='../App/Start.html?treasure-hunt-id="+ treasureHunts[i].uuid + "'>" + treasureHunts[i].name + "</a>";
                    description.innerText =  "Description: " + treasureHunts[i].description;
                    Prize.innerText = "Prize: " + prizeResult;
                    time.innerText =  "Starts on: " + startTime + ", Ends on: " + endTime;
                    listItem.appendChild(description);
                    listItem.appendChild(Prize);
                    listItem.appendChild(time);
                    challengesList.appendChild(listItem);
                }
            }else {
                document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
                console.log("cannot get challenges");
            }
        });
}
function start(){
    let playerName = document.getElementById("nickName").value;
    setCookie("playerName",playerName,1);
    treasureHuntID = location.search;
    setCookie("treasureHuntID", treasureHuntID,1);
    let StartURL = URL + "start" + getCookie("treasureHuntID") + "&player=" + getCookie("playerName") + "&app=" + appName;
    console.log(document.cookie);
    console.log(StartURL);

    fetch(StartURL)
        .then(response => response.json())
        .then(jsonObject => {
            if (jsonObject.status === "OK"){
                let sessionID = jsonObject.session;
                setCookie("sessionID", sessionID, 1);

                //go to questions with two data session id and the number of questions
                window.location.assign("Question.html");
            }
            else {
                console.log("cannot obtain session id")
                document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
            }
        })
}
function getQuestions(){
    console.log(document.cookie);

    fetch(URL + "question?session=" + getCookie("sessionID"))
        .then(response => response.json())
        .then(jsonObject => {

            // if status is fine
            if (jsonObject.status === "OK"){

                //if the question is not completed
                if (jsonObject.completed === false && jsonObject.currentQuestionIndex < jsonObject.numOfQuestions){

                    let questionText = document.getElementById("question");
                    questionText.innerHTML = jsonObject.questionText;

                    let questionNumberLabel = document.getElementById("questionNumber");
                    questionNumberLabel.innerText = "Question Number: " + String(jsonObject.currentQuestionIndex+1);

                    let skipButton = document.getElementById("skipButton");
                    skipButton.disabled = jsonObject.canBeSkipped === false;

                    if (jsonObject.requiresLocation === true){ setLocation(); }

                    getAnswers(jsonObject);
                    getScore();

                }else {
                    location.assign("Leaderboard.html");
                    console.log("no more Questions");
                }

            }else {
                console.log("cannot get questions")
                document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
            }
        })
}
function skip(){
    answers.innerHTML = "";
    fetch(URL + "skip?session=" + getCookie("sessionID"))
        .then(response=> response.json())
        .then(jsonObject => {
            if (jsonObject.status === "OK"){
                getScore()
                document.getElementById("feedback").innerText = jsonObject.message + " you lost " + jsonObject.scoreAdjustment + " points.";
                getQuestions();
            }else{
                console.log("Cannot skip. This questions is defined as one that cannot be skipped.")
                document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
            }
        })
}
function checkAnswer(userAnswer){
    userAnswer = String(userAnswer);
    console.log("checking answer : " + userAnswer);

    fetch(URL + "answer?session=" + getCookie("sessionID") + "&answer=" + userAnswer)
        .then(response => response.json())
        .then(jsonObject => {

            // if status is fine
            if (jsonObject.status === "OK"){

                if (jsonObject.correct === true){

                    document.getElementById("feedback").innerText = jsonObject.message + " you earned " + jsonObject.scoreAdjustment + " points.";
                    getScore();
                    document.getElementById("scoreLabel").innerText = "Score: " + score;
                    getQuestions();

                }else if (jsonObject.correct === false){

                    document.getElementById("feedback").innerText = jsonObject.message + ", you lost " + jsonObject.scoreAdjustment + " points.";
                    getScore();
                    getQuestions();

                }else {
                    console.log("treasure hunt ended");
                    document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
                }
            }

        })

}
function getAnswers(jsonObject){

    answers = document.getElementById("answers");
    switch (jsonObject.questionType){
        case "INTEGER":
            let intAnswer = document.createElement("INPUT");
            intAnswer.type = "Number";
            intAnswer.className="acceptint"
            let submitInt = document.createElement("button");
            submitInt.className="SubmitNum";
            submitInt.innerText = "Submit";
            submitInt.type = "Button";

            submitInt.onclick = function(){
                console.log("submitted : " + intAnswer.value);
                checkAnswer(intAnswer.value);
                answers.removeChild(intAnswer);
                answers.removeChild(submitInt);
            };

            answers.appendChild(intAnswer);
            answers.appendChild(submitInt);

            break;
        case "BOOLEAN":

            let trueButton = document.createElement("button");
            trueButton.innerText = "True";
            trueButton.type = "Button";
            trueButton.value = "True";
            trueButton.className=  "TrueButton";
            let falseButton = document.createElement("button");
            falseButton.innerText= "False";
            falseButton.type = "Button";
            falseButton.value = "False";
            falseButton.className="FalseButton";

            trueButton.onclick = function (){
                console.log("submitted : " + trueButton.value);
                checkAnswer(trueButton.value);
                answers.removeChild(trueButton);
                answers.removeChild(falseButton);
            };
            falseButton.onclick = function (){
                console.log("submitted : " + falseButton.value);
                checkAnswer(falseButton.value);
                answers.removeChild(trueButton);
                answers.removeChild(falseButton);
            };

            answers.appendChild(trueButton);
            answers.appendChild(falseButton);
            break;

        case "NUMERIC":
            let numAnswer = document.createElement("INPUT");
            numAnswer.type = "Number";
            let submitnum = document.createElement("button")
            submitnum.type = "Button";
            submitnum.onclick = function(){
                console.log("submitted: " + numAnswer.value);
                checkAnswer(numAnswer.value);
                answers.removeChild(numAnswer);
                answers.removeChild(submitnum);
            };

            answers.appendChild(numAnswer);
            answers.appendChild(submitnum);

            break;

        case "MCQ":
            let a_Button = document.createElement("button");
            a_Button.innerText = "A";
            a_Button.onclick = function(){
                console.log("submitted: " + "A");
                checkAnswer("A");
                answers.removeChild(a_Button);
                answers.removeChild(b_Button);
                answers.removeChild(c_Button);
                answers.removeChild(d_Button);
            };

            let b_Button = document.createElement("button");
            b_Button.innerText = "B";
            b_Button.onclick = function(){

                console.log("submitted: " + "B");
                checkAnswer("B");
                answers.removeChild(a_Button);
                answers.removeChild(b_Button);
                answers.removeChild(c_Button);
                answers.removeChild(d_Button);
            };

            let c_Button = document.createElement("button");
            c_Button.innerText = "C";
            c_Button.onclick = function(){

                console.log("submitted: " + "C");
                checkAnswer("C");
                answers.removeChild(a_Button);
                answers.removeChild(b_Button);
                answers.removeChild(c_Button);
                answers.removeChild(d_Button);
            };

            let d_Button = document.createElement("button");
            d_Button.innerText= "D";
            d_Button.onclick = function(){

                console.log("submitted: " + "D");
                checkAnswer("D");
                answers.removeChild(a_Button);
                answers.removeChild(b_Button);
                answers.removeChild(c_Button);
                answers.removeChild(d_Button);
            };

            answers.appendChild(a_Button);
            answers.appendChild(b_Button);
            answers.appendChild(c_Button);
            answers.appendChild(d_Button);
            break;

        case "TEXT":
            let txtAnswer = document.createElement("input")
            txtAnswer.type = "Text";
            txtAnswer.className="inserttxt";
            let submitTxt = document.createElement("button");
            submitTxt.className="textbutton";
            submitTxt.innerText = "Submit";
            submitTxt.onclick = function(){
                console.log("submitted: " + txtAnswer.value);
                checkAnswer(txtAnswer.value);
                answers.removeChild(txtAnswer);
                answers.removeChild(submitTxt);
            };

            answers.appendChild(txtAnswer);
            answers.appendChild(submitTxt);
            break;
    }
}
function getScore(){
    fetch(URL + "score?session=" + getCookie("sessionID"))
        .then(response => response.json())
        .then(jsonObject => {

            // if status is fine
            if (jsonObject.status === "OK"){

                score =  jsonObject.score;
                console.log("score: " + score);

                if (jsonObject.completed === true || jsonObject.finished === true) {
                    document.getElementById("congratstxt").innerText = "Congratulations " + jsonObject.player + ", your final score is " + score;
                }else {
                    document.getElementById("scoreLabel").innerText = "Score: " + score;
                }
            }
        })
}
function getLeaderboard(){

    getScore();
    console.log(sortType);
    console.log(limit);

    fetch(URL + "leaderboard?session=" + getCookie("sessionID") + "&" + sortType + "&limit=" + limit)
        .then(response => response.json())
        .then(jsonObject => {
            if (jsonObject.status === "OK"){

                document.getElementById("treasurehuntId").innerText = jsonObject.treasureHuntName + " leaderboards";

                let leaderboardList = document.getElementById("leaderBoard");
                //empty the list
                leaderboardList.innerHTML = "";
                let leaderboard = jsonObject.leaderboard;
                for (let i = 0; i < leaderboard.length; i++) {
                    //todo - could be changed to table
                    listItem = document.createElement("li");
                    let time = new Date(leaderboard[i].completionTime*1000);
                    let hours = time.getHours();
                    let minutes = time.getMinutes();
                    let seconds = time.getSeconds();
                    listItem.innerText = "Player: " + leaderboard[i].player + ", Score: " + leaderboard[i].score + ", Completed on: " + hours + ":" + minutes + ":" + seconds;
                    leaderboardList.appendChild(listItem);
                }
            }else{
                console.log("cannot get leaderboards");
                document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
            }
        })
}
function getLocation(position) {

    let latitude = position.coords.latitude;
    let longtitude = position.coords.longitude;
    console.log("latitude: " + latitude );
    console.log("longtitude: " + longtitude );

    fetch(URL + "location?session=" + getCookie("sessionID") + "&latitude=" + latitude + "&longitude=" + longtitude )
        .then(response => response.json())
        .then(jsonObject => {
            if (jsonObject.status === "OK"){
                console.log(jsonObject.message);
            }else{
                alert(jsonObject.errorMessages);
            }
        })
}
function setLocation() {
    if (navigator.geolocation) {
        //Geolocation is supported by browser.
        navigator.geolocation.getCurrentPosition(getLocation);
    }
    else {
        //Geolocation is NOT supported by browser
        alert("Geolocation is not supported by your browser.");
    }
}
function scan(){
    var opts = {
        // Whether to scan continuously for QR codes. If false, use scanner.scan() to
        // manually scan. If true, the scanner emits the "scan" event when a QR code is
        // scanned. Default true.
        continuous: true,
        // The HTML element to use for the camera's video preview. Must be a <video>
        // element. When the camera is active, this element will have the "active" CSS
        // class, otherwise, it will have the "inactive" class. By default, an invisible
        // element will be created to host the video.
        video: document.getElementById('preview'),
        // Whether to horizontally mirror the video preview. This is helpful when trying to
        // scan a QR code with a user-facing camera. Default true.
        mirror: true,
        // Whether to include the scanned image data as part of the scan result. See the
        // "scan" event for image format details. Default false.
        captureImage: false,
        // Only applies to continuous mode. Whether to actively scan when the tab is not
        // active.
        // When false, this reduces CPU usage when the tab is not active. Default true.
        backgroundScan: true,
        // Only applies to continuous mode. The period, in milliseconds, before the same QR
        // code will be recognized in succession. Default 5000 (5 seconds).
        refractoryPeriod: 5000,
        // Only applies to continuous mode. The period, in rendered frames, between scans. A
        // lower scan period increases CPU usage but makes scan response faster.
        // Default 1 (i.e. analyze every frame).
        scanPeriod: 1
    };
    var scanner = new Instascan.Scanner(opts);
    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        } else {
            console.error('No cameras found.');
            alert("No cameras found."); }
    }).catch(function (e) { console.error(e);
    });
    scanner.addListener('scan', function (content) {
        console.log(content);
        document.getElementById("content").innerHTML = content;
        scanner.stop();
    });
    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.onclick = function (){
        scanner.stop();
        document.getElementById("camera").removeChild(cancelButton);
    };
    document.getElementById("camera").appendChild(cancelButton);
}
function setCookie(cookieName, cookieValue, expireDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expireDays * 24 * 60 * 60 * 1000)); let expires = "expires=" + date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/"; }
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


