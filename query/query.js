import SearchSuggestions from "../scripts/searchSuggestions.js"

// getting all required elements
const Storage = chrome.storage.local;
let storageProblem = Object(); // 所有題目的資料

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

    // 如果沒有資料就丟空字典
    if (!result.problems){
        result.problems = {};
    }

    const searchSuggestions = new SearchSuggestions({
        allData: [...new Set(Object.values(result.problems).flatMap((problemData) => problemData.tags))],
        inputElement: document.querySelector("#search-input"),
        listElement: document.querySelector("#suggestions-list"),
        suggestionsLimit: 3,
        selectCallback: addFilter,
    });

    storageProblem = result.problems;
    renderProblemList(storageProblem);
});

// 將所有題目的資料，以特定排序、篩選渲染到畫面上
function renderProblemList(problems){
    const problemList = document.querySelector("#problem tbody");

    // 題目暫存區
    let temporaryOutput = [];
    
    // 取得每一筆題目的資料，並且渲染上去
    for (const url of Object.keys(problems)) {
        let {name, difficulty, tags, comment} = problems[url];

        // 維護變數代表是否要加入渲染裡面
        let add = 1;
        if (filterTags.length>0){
            if (filterType==0){ // OR
                add = 0;
                for (let x of tags){
                    if (filterTags.includes(x)){
                        add = 1;
                        break;
                    }
                }
            }else if (filterType==1){ // AND
                add = 1;
                for (let x of tags){
                    if (!filterTags.includes(x)){
                        add = 0;
                        break;
                    }
                }
            }
        }
        if (add==0){
            continue;
        }

        // 將難度表轉換成星星
        difficulty = parseInt(difficulty);
        let difficulty_star = "<i class=\"fas fa-star\"></i>".repeat(difficulty)+"<i class=\"far fa-star\"></i>".repeat(5-difficulty);

        // 將 tags 拆開成 <p>
        let tag_element = "";
        for (let x of tags){
            tag_element += `<p class="tag">${x}</p>`;
        }

        let rowHTML = `
        <tr>
            <td><a href=${url} target="_blank">${name}</a></td>
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
    for (let i=0 ; i<temporaryOutput.length ; i++){
        problemList.innerHTML += temporaryOutput[i].rowHTML;
    }
}

// 難度相關的內容
const difficultyButton = document.getElementById("difficulty");
const difficultyButtonIcon = document.getElementById("sorting");
let difficultyIcon = ["fas fa-sort", "fas fa-sort-down", "fas fa-sort-up"];
let sortDifficulty = 0; // 0 = 未排序，1 = 升序，2 = 降序

// 排序難度
difficultyButton.onclick = function (){
    sortDifficulty = (sortDifficulty+1)%3;
    difficultyButtonIcon.setAttribute("class", difficultyIcon[sortDifficulty]);
    renderProblemList(storageProblem);
}

function compare(a, b){
    if (sortDifficulty==1){
        return a.difficulty-b.difficulty;
    }else{
        return b.difficulty-a.difficulty;
    }
}

// tag 相關的內容
let filterTags = [];
let filterType = 0; // 0 = OR，1 = AND
function addFilter(tag){
    filterTags.push(tag);
    renderProblemList(storageProblem);
}

function filterAndSortProblems(problems, filterTags, filterType, sortDifficulty) {
    let result = Object.entries(problems);

    // 篩選
    if (filterType === 0) // any
        result = result.filter((problem) => filterTags.some((tag) => problem.tags.includes(tag)));
    else // all
        result = result.filter((problem) => filterTags.every((tag) => problem.tags.includes(tag)));

    // 排序
    if (sortDifficulty === 1) // 升序
        result.sort((a, b) => a.difficulty - b.difficulty);
    else if (sortDifficulty === 2) // 降序
        result.sort((a, b) => b.difficulty - a.difficulty);
    
    return result;
}