// getting all required elements
const searchInput = document.querySelector("#search-input");
const input = searchInput.querySelector("#search-bar");
const resultBox = searchInput.querySelector("#result-box");
const currentTags = document.querySelector("#current-tags");
const saveButton = document.querySelector("#save-button");
const Storage = chrome.storage.local;


chrome.tabs.query({'active' : true, 'currentWindow' : true}, (e) => {
    let url = e[0].url;
    if (!url) {
        window.close();
    }
    const regex = [
        /^https:\/\/atcoder\.jp\/contests\/.+?\/tasks\/.+$/, 
        /^$/
    ];
    if (!regex.some(a => a.test(url))){
        // 確保是 ATC 的題目
        window.close();
    }
    Storage.get(["problems"]).then((result) => {
        /*
        result = {
            "problems": {
                "ABC123": ["awa", "ccc"],
                "ABC124": ["aawa", "ccc"],
            }
        }
        */
        if (!result.problems)
            result.problems = {};
        if (result.problems.hasOwnProperty(url))
            showTags(result.problems[url]);
        input.addEventListener('keyup', (event) => inputKeyup(event, result.problems));
        saveButton.addEventListener('click', (event) => save(event, url, result.problems));
    });
});



// 如果使用者按下任何按鍵就要觸發這個函式
function inputKeyup(event, problems) {
    let tags = [...new Set(Object.values(problems).flat())].sort(); // 把所有 problem 的 tag 直接取出
    let userValue = event.target.value; // 使用者輸入的文字
    if (userValue) {
        // 如果使用者按下 Enter，直接匹配第一個搜尋結果
        if (event.code == "Enter") {
            resultBox.querySelector("li").dispatchEvent(new Event('click'));
            return;
        }
        // 用 LCS 判斷 tag 的優先度
        let suggestions = tags.map((data) => [lcs(data.toLocaleLowerCase(), userValue.toLocaleLowerCase()), data])
                              .sort()
                              .reverse()
                              .slice(0, 7)
                              .map((data) => data[1]);

        searchInput.classList.add("active"); //show autocomplete box
        showSuggestions(suggestions, userValue);
    } else {
        searchInput.classList.remove("active"); //hide autocomplete box
    }
}

// 處理搜尋清單
function lcs(text1, text2) {
    const result = new Array(text1.length + 1).fill(null).map(() => new Array(text2.length + 1).fill(null))

    function test(end1, end2) {
        if (end1 === -1 || end2 === -1) {
            return 0
        }
        if (result[end1][end2] !== null) {
            return result[end1][end2]
        }
        if (text1[end1] === text2[end2]) {
            result[end1][end2] = 1 + test(end1 - 1, end2 - 1)
            return result[end1][end2]
        } else {
            result[end1][end2] = Math.max(
                test(end1 - 1, end2),
                test(end1, end2 - 1)
            )
            return result[end1][end2]
        }
    }
    return test(text1.length - 1, text2.length - 1)
}

function select(event) {
    input.value = "";
    searchInput.classList.remove("active");
    addTag(event.target.dataset.value);
}

function showSuggestions(suggestions, userValue) {
    resultBox.innerHTML = "";
    suggestions.forEach(tag => {
        let suggestion = document.createElement('li');
        suggestion.innerHTML = tag;
        suggestion.dataset.value = tag;
        suggestion.addEventListener('click', select);
        resultBox.appendChild(suggestion);
    });
    if (!suggestions.includes(userValue)) {
        let newTag = document.createElement('li');
        newTag.innerHTML = `Add "${userValue}"`;
        newTag.dataset.value = userValue;
        newTag.addEventListener('click', select);
        resultBox.appendChild(newTag);
    }
}

// 處理 Tag 系統
function showTags(tags) {
    tags.forEach(addTag);
}

function addTag(tag) {
    let tags = [...currentTags.querySelectorAll('.tag')].map((elem) => elem.innerHTML);
    if (tags.includes(tag)) return;
    
    let tagHTML = document.createElement('span');
    tagHTML.innerHTML = tag;
    tagHTML.classList.add('tag');
    tagHTML.addEventListener('click', (event) => {
        currentTags.removeChild(event.target);
    });
    currentTags.appendChild(tagHTML);
}

function save(event, url, problems) {
    let tags = [...currentTags.querySelectorAll('.tag')].map((elem) => elem.innerHTML);
    problems[url] = tags;
    Storage.set({ "problems" : problems }).then(() => {
        console.log(`The tags of ${url} is now ${tags}`);
        window.close();
    });
}