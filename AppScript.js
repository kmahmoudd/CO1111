

    let appName = "team7";
    let URL  = "https://codecyprus.org/th/api/";
    let treasureHuntID;
    let sessionID;
    const params = new URLSearchParams(location.search);
    let score = 0;
    let answers = document.getElementById("answers");
    let sortType = "sorted";
    let limit = "5";

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
                        let listItem = document.createElement("li");
                        listItem.innerHTML = "<a href='Start.html?treasure-hunt-id=" + treasureHunts[i].uuid + "'>" + treasureHunts[i].name + "</a>";
                        challengesList.appendChild(listItem);
                    }
                }else {
                    //todo show right error
                    console.log("cannot get challenges");
                }
            });
    }
    function start(){
        let playerName = document.getElementById("nickName").value;
        treasureHuntID = location.search;
        let StartURL = URL + "start" + treasureHuntID + "&player=" + playerName + "&app=" + appName;
        console.log(StartURL);
        fetch(StartURL)
            .then(response => response.json())
            .then(jsonObject => {
                let sessionStatus = jsonObject.status;
                if (sessionStatus === "OK"){
                    sessionID = jsonObject.session;

                    //go to questions with two data session id and the number of questions
                    window.location.assign("Question.html?session=" + sessionID);
                }
                else {
                    console.log("cannot obtain session id")
                    //todo - show appropriate error message to the user
                    document.getElementById("errorMessage").innerText = jsonObject.errorMessages;

                }
            })
    }
    function getQuestions(){
        sessionID = params.get("session");

        fetch(URL + "question?session=" + sessionID)
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
                        if (jsonObject.canBeSkipped === false){
                            skipButton.disabled = true;
                            document.getElementById("feedback").innerText = "This question can NOT be skipped";
                        }else {
                            skipButton.disabled = false;
                        }

                        getAnswers(jsonObject);

                    }else {
                        location.assign("Leaderboard.html?session=" + sessionID);
                        console.log("no more Qeustions");
                    }

                }else {
                    console.log("cannot get qeustions")
                    document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
                }
            })
    }
    function skip(){
        sessionID = params.get("session");

        answers.innerHTML = "";
        fetch(URL + "skip?session=" + sessionID)
            .then(response=> response.json())
            .then(jsonObject => {
                if (jsonObject.status === "OK"){
                    getScore();
                    document.getElementById("feedback").innerText = jsonObject.message;
                    getQuestions();
                }else{
                    console.log("Cannot skip. This questions is defined as one that cannot be skipped.")
                    document.getElementById("errorMessage").innerText = jsonObject.errorMessages;
                }
            })
    }
    function checkAnswer(userAnswer){
        sessionID = params.get("session");

        userAnswer = String(userAnswer);
        console.log("checking answer : " + userAnswer);


        fetch(URL + "answer?session=" + sessionID + "&answer=" + userAnswer)
            .then(response => response.json())
            .then(jsonObject => {

                // if status is fine
                if (jsonObject.status === "OK"){

                    if (jsonObject.correct === true){

                        getScore();
                        feedbackTV = document.getElementById("feedback");
                        feedbackTV.innerText = jsonObject.message;
                        getQuestions();

                    }else if (jsonObject.correct === false){

                        document.getElementById("feedback").innerText = jsonObject.message;
                        getQuestions();
                        getScore();

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

                let submitInt = document.createElement("button");
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

                let falseButton = document.createElement("button");
                falseButton.innerText= "False";
                falseButton.type = "Button";
                falseButton.value = "False";

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

                let submitTxt = document.createElement("button");
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
        sessionID = params.get("session");

        fetch(URL + "score?session=" + sessionID)
            .then(response => response.json())
            .then(jsonObject => {

                // if status is fine
                if (jsonObject.status === "OK"){
                    score =  jsonObject.score
                    document.getElementById("scoreLabel").innerText = "Score: " + score;

                }
            })
    }
    function getLeaderboard(){
        sessionID = params.get("session");

        console.log(sortType);
        console.log(limit);

        fetch(URL + "leaderboard?session=" + sessionID + "&" + sortType + "&limit=" + limit)
            .then(response => response.json())
            .then(jsonObject => {
                if (jsonObject.status === "OK"){

                    document.getElementById("treasurehuntId").innerText = jsonObject.treasureHuntName;

                    let leaderboardList = document.getElementById("leaderBoard");
                    //empty the list
                    leaderboardList.innerHTML = "";
                    let leaderboard = jsonObject.leaderboard;
                    for (let i = 0; i < leaderboard.length; i++) {
                        let listItem = document.createElement("li");
                        listItem.innerText = "Player: " + leaderboard[i].player + ", Score: " + leaderboard[i].score + ", Time: " + String(leaderboard[i].completionTime/60000000000);
                        leaderboardList.appendChild(listItem);
                    }
                }else{
                    //todo show right error
                    console.log(jsonObject.errorMessages);
                }
            })

    }


