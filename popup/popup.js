// popup.html 的 JS 檔案
import SearchSuggestions from "../scripts/searchSuggestions.js"

const currentTags = document.querySelector("#current-tags");
const saveButton = document.querySelector("#save-button");
const nameInput = document.querySelector("#name-input");
const difficultyInput = document.querySelector("#difficulty-input");
const commentInput = document.querySelector("#comment-input");
const chromeStorage = chrome.storage.local;

chrome.tabs.query({ "active": true, "currentWindow": true }, (tabs) => {
    const url = tabs[0].url; // 目前分頁的網址
    const pageTitle = tabs[0].title; // 目前分頁的標題
    nameInput.value = pageTitle;

    chromeStorage.get(["problems"]).then((result) => {
        // 如果沒有任何紀錄，就新增它
        if (!result.problems) result.problems = {};

        // 如果目前的網址有記錄過，就顯示紀錄中的資料
        if (result.problems.hasOwnProperty(url))
            windowInit(result.problems[url]);

        const searchSuggestions = new SearchSuggestions({
            allData: [...new Set(Object.values(result.problems).flatMap((problemData) => problemData.tags))],
            inputElement: document.querySelector("#search-input"),
            listElement: document.querySelector("#suggestions-list"),
            suggestionsLimit: 3,
            addWhenNotFound: true,
            selectCallback: addTag
        });

        saveButton.addEventListener("click", (event) => save(event, url, pageTitle, result.problems));
    });
});

// 小視窗初始化，填入紀錄中的資料
function windowInit(problemData) {
    nameInput.value = problemData.name;
    difficultyInput.value = problemData.difficulty;
    commentInput.value = problemData.comment;
    problemData.tags.forEach(addTag);
}

// 增加一個 tag
function addTag(tag) {
    // 如果目前已經有了，就不再增加
    if ([...currentTags.querySelectorAll(".tag")].some((element) => element.value === tag)) return;
    
    const tagElement = document.createElement("button");
    tagElement.innerHTML = tag;
    tagElement.value = tag;
    tagElement.classList.add("tag");

    // tag 的加入與移除都有動畫
    const tagAnimationOptions = {
        duration: 200,
        easing: "ease-in-out",
        fill: "forwards",
    };

    // 點擊後播放動畫，動畫結束後移除元素
    tagElement.addEventListener("click", () => {
        tagElement.animate(tagAnimationKeyframes(tagElement).reverse(), tagAnimationOptions)
                  .finished.then(() => currentTags.removeChild(tagElement));
    });

    // 加入元素後播放動畫
    currentTags.appendChild(tagElement);
    tagElement.animate(tagAnimationKeyframes(tagElement), tagAnimationOptions);
}

// 取得 tag 動畫的影格
function tagAnimationKeyframes(tagElement) {
    return [
        {
            maxWidth: 0,
            paddingLeft: 0,
            paddingRight: 0,
            opacity: 0
        },
        {
            maxWidth: `${tagElement.offsetWidth}px`,
            paddingLeft: "auto",
            paddingRight: "auto",
            opacity: 1
        }
    ];
}

// 如果使用者按下儲存按鈕，就觸發這個函式
function save(event, url, pageTitle, problems) {
    problems[url] = {
        name: nameInput.value === "" ? pageTitle : nameInput.value,
        difficulty: difficultyInput.value,
        comment: commentInput.value,
        tags: [...currentTags.querySelectorAll(".tag")].map((elem) => elem.value)
    };

    // 儲存紀錄並關閉小視窗
    chromeStorage.set({ "problems" : problems }).then(() => {
        console.log(url, problems[url]);
        window.close();
    });
}
