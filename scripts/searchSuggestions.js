// 回傳最長共同子序列的長度
function longestCommonSubsequence(text1, text2) {
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

// 控制搜尋行為
export default class searchSuggestions {
    constructor({allData, inputElement, listElement, suggestionsLimit=3, selectCallback}) {
        this.allData = allData;
        this.html = {
            searchInput: inputElement, // 搜尋框
            suggestionsList: listElement // 搜尋建議列表
        };
        this.suggestionsLimit = suggestionsLimit; // 搜尋建議數量上限
        this.selectCallback = selectCallback; // 如果使用者選擇任何建議，就觸發這個函式

        this.html.searchInput.addEventListener("keyup", this.inputKeyup.bind(this));
    }

    // 如果使用者在搜尋框按下任何按鍵，就觸發這個函式
    inputKeyup(event) {
        const userInput = event.target.value.trim(); // 使用者輸入的文字

        // 如果沒有輸入，就清空搜尋建議，否則顯示搜尋建議
        if (userInput === "")
            this.clearSuggestions();
        else
            this.showSuggestions(userInput);
    }

    // 如果使用者選擇任何建議，就觸發這個函式
    select(event) {
        this.selectCallback(event.target.value);

        // 清空搜尋框與搜尋建議
        this.html.searchInput.value = "";
        this.clearSuggestions();

        // 焦點回到搜尋框
        this.html.searchInput.focus();
    }

    // 清空搜尋建議
    clearSuggestions() {
        this.html.suggestionsList.innerHTML = "";
    }

    // 顯示搜尋建議
    showSuggestions(userInput) {
        // 清空可能存在的搜尋建議(?)
        this.clearSuggestions();
    
        // 用編輯距離列出搜尋建議
        const suggestions = this.allData
                                .map((data) => [longestCommonSubsequence(data.toLocaleLowerCase(), userInput.toLocaleLowerCase()), data])
                                .sort((a, b) => b[0] - a[0])
                                .slice(0, this.suggestionsLimit)
                                .map((data) => data[1]);
    
        // 加入搜尋建議
        suggestions.forEach((data) => this.addSuggestion(data, data));
    
        // 如果使用者輸入不在搜尋建議中，就新增這個輸入
        if (!suggestions.includes(userInput))
            this.addSuggestion(userInput, `Add "${userInput}"`);
    }

    // 增加一項搜尋建議
    addSuggestion(value, text) {
        const suggestion = document.createElement("button");
        suggestion.innerHTML = text;
        suggestion.value = value;
        suggestion.classList.add("suggestion");
        suggestion.addEventListener("click", this.select.bind(this));
        this.html.suggestionsList.appendChild(suggestion);
    }
}
