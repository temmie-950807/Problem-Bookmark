import SearchSuggestions from "../scripts/searchSuggestions.js"

// getting all required elements
const Storage = chrome.storage.local;
var storageProblem;

const difficultyButton = document.getElementById("difficulty");
const difficultyButtonIcon = document.getElementById("sorting");
var difficultyIcon = ["fas fa-sort", "fas fa-sort-down", "fas fa-sort-up"];
var sortDifficulty = 0; // 0 = 未排序，1 = 升序，2 = 降序

function compare(a, b) {
    if (sortDifficulty==1){
        return a.difficulty-b.difficulty;
    }else{
        return b.difficulty-a.difficulty;
    }
  }

function renderProblemList(problems) {
    const problemList = document.querySelector("#problem tbody");

    // 題目暫存區
    var temporaryOutput = [];
    
    // 取得每一筆題目的資料，並且渲染上去
    for (const url of Object.keys(problems)) {
        let {name, difficulty, tags, comment} = problems[url];

        // 將難度表轉換成星星
        difficulty = parseInt(difficulty);
        let difficulty_star = "<i class=\"fas fa-star\"></i>".repeat(difficulty)+"<i class=\"far fa-star\"></i>".repeat(5-difficulty);

        // 將 tags 拆開成 <p>
        let tag_element = "";
        for (let x of tags){
            tag_element += `<p class="tag">${x}</p>`;
        }

        var rowHTML = `
        <tr>
            <td><a href=${url}>${name}</a></td>
            <td>${difficulty_star}</td>
            <td>${tag_element}</td>
            <td>${comment}</td>
        </tr>`;
        
        temporaryOutput.push({rowHTML, difficulty});
    }

    if (sortDifficulty != 0){
        temporaryOutput.sort(compare);
    }

    // 先清空內容，再把新資料加進去
    problemList.innerHTML = "";
    for (var i=0 ; i<temporaryOutput.length ; i++){
        problemList.innerHTML += temporaryOutput[i].rowHTML;
    }
}

// 讀取題目資料
Storage.get(["problems"]).then((result) => {
    
    // template for query result
    const resultTemplate = {
        "problems": {
            "url": {
                name: "name",
                difficulty: "Easy",
                tags: ["tag1", "tag2"],
                note: "note"
            }
        }
    }

    console.log(result.problems);
    
    // 如果沒有資料就丟空字典
    if (!result.problems)
        result.problems = {};

    const searchSuggestions = new SearchSuggestions({
        allData: [...new Set(Object.values(result.problems).flatMap((problemData) => problemData.tags))],
        inputElement: document.querySelector("#search-input"),
        listElement: document.querySelector("#suggestions-list"),
        suggestionsLimit: 3,
        selectCallback: () => {}
    });

    storageProblem = result.problems;
    renderProblemList(storageProblem);
});

difficultyButton.onclick = function () {
    sortDifficulty = (sortDifficulty+1)%3;
    difficultyButtonIcon.setAttribute("class", difficultyIcon[sortDifficulty]);
    renderProblemList(storageProblem);
};