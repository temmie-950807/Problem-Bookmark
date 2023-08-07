// popup.html 的 JS 檔案
const searchArea = document.querySelector("#search-area");
const searchInput = searchArea.querySelector("#search-input");
const suggestionsList = searchArea.querySelector("#suggestions-list");
const currentTags = document.querySelector("#current-tags");
const saveButton = document.querySelector("#save-button");
const chromeStorage = chrome.storage.local;

chrome.tabs.query({ "active": true, "currentWindow": true }, (tabs) => {
    let url = tabs[0].url; // 目前分頁的網址
    const regex = [
        /^https:\/\/atcoder\.jp\/contests\/.+?\/tasks\/.+$/,
        /^$/
    ];

    // 如果網址不存在或不符合，將小視窗內容改成錯誤訊息
    if ((!url) || (!regex.some((a) => a.test(url)))) {
        document.body.innerHTML = '<h1 class="errorPage">This page is not a problem page.</h1>';
        // window.close();
        return;
    }

    chromeStorage.get(["problems"]).then((result) => {
        /*
        result = {
            "problems": {
                "url1": ["tag1", "tag2"],
                "url2": ["tag1", "tag3"]
            }
        }
        */
        // 如果沒有任何紀錄，就新增它
        if (!result.problems)
            result.problems = {};

        // 如果目前的網址有記錄過，就顯示紀錄中的所有 tag
        if (result.problems.hasOwnProperty(url))
            result.problems[url].forEach(addTag);

        searchInput.addEventListener("keyup", (event) => inputKeyup(event, result.problems));
        saveButton.addEventListener("click", (event) => save(event, url, result.problems));
    }).catch((error) => {
        console.error("Error while fetching from storage:", error);
    });
});

// 如果使用者在搜尋框按下任何按鍵，就觸發這個函式
function inputKeyup(event, problems) {
    let userInput = event.target.value; // 使用者輸入的文字

    // 如果沒有輸入，就清空搜尋建議
    if (userInput === "") {
        clearSuggestions();
        return;
    }

    // 如果使用者按下 Enter，就直接選擇第一個搜尋建議
    if (event.code === "Enter") {
        suggestionsList.querySelector("li").dispatchEvent(new Event("click"));
        return;
    }

    // 顯示搜尋建議
    showSuggestions(problems, userInput);
}

// 回傳最長共同子序列的長度
function longestCommonSubseq(text1, text2) {
    const result = new Array(text1.length + 1).fill(null).map(() => new Array(text2.length + 1).fill(null));

    function test(end1, end2) {
        if (end1 === -1 || end2 === -1)
            return 0;
        if (result[end1][end2] !== null)
            return result[end1][end2];

        if (text1[end1] === text2[end2]) {
            result[end1][end2] = 1 + test(end1 - 1, end2 - 1);
            return result[end1][end2];
        } else {
            result[end1][end2] = Math.max(
                test(end1 - 1, end2),
                test(end1, end2 - 1)
            );
            return result[end1][end2];
        }
    }

    return test(text1.length - 1, text2.length - 1);
}

// 如果使用者選擇任何建議，就觸發這個函式
function select(event) {
    // 新增對應的 tag
    addTag(event.target.dataset.value);

    // 清空搜尋框與搜尋建議
    searchInput.value = "";
    clearSuggestions();
}

// 清空搜尋建議
function clearSuggestions() {
    searchArea.classList.remove("show-suggestions");
    suggestionsList.innerHTML = "";
}

// 顯示搜尋建議
function showSuggestions(problems, userInput) {
    // 清空可能存在的建議(?)
    suggestionsList.innerHTML = "";

    // 用 LCS 判斷搜尋建議
    let tags = [...new Set(Object.values(problems).flat())]; // 所有紀錄裡的 tag
    let suggestions = tags.map((tag) => [longestCommonSubseq(tag.toLocaleLowerCase(), userInput.toLocaleLowerCase()), tag])
                          .sort((a, b) => b[0] - a[0])
                          .slice(0, 7)
                          .map((data) => data[1]);

    // 加入搜尋建議
    suggestions.forEach((tag) => {
        let suggestion = document.createElement("li");
        suggestion.innerHTML = tag;
        suggestion.dataset.value = tag;
        suggestion.addEventListener("click", select);
        suggestionsList.appendChild(suggestion);
    });

    // 如果使用者輸入不在搜尋建議中，就新增這個輸入
    if (!suggestions.includes(userInput)) {
        let newTag = document.createElement("li");
        newTag.innerHTML = `Add "${userInput}"`;
        newTag.dataset.value = userInput;
        newTag.addEventListener("click", select);
        suggestionsList.appendChild(newTag);
    }

    searchArea.classList.add("show-suggestions"); 
}

function createElementByHTML(htmlString) {
    const ele = document.createElement("div");
    ele.innerHTML = htmlString;
    return ele.firstChild;
}

// 新增 tag
function addTag(tag) {
    let tags = [...currentTags.querySelectorAll(".tag")].map((elem) => elem.innerHTML); // 現有的 tag

    // 如果已經有了，就不再新增
    if (tags.includes(tag)) return;
    
    let tagHTML = document.createElement("span");
    tagHTML.innerHTML = tag;
    tagHTML.classList.add("tag");
    tagHTML.addEventListener("click", (event) => {
        currentTags.removeChild(event.target);
    });
    currentTags.appendChild(tagHTML);
}

// 如果使用者按下儲存按鈕，就觸發這個函式
function save(event, url, problems) {
    let tags = [...currentTags.querySelectorAll(".tag")].map((elem) => elem.innerHTML); // 要記錄的 tag
    problems[url] = tags;

    // 儲存紀錄並關閉小視窗
    chromeStorage.set({ "problems" : problems }).then(() => {
        console.log(`The tags of ${url} is now ${tags}`);
        window.close();
    });
}
