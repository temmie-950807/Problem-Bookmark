// getting all required elements
const Storage = chrome.storage.local;
const currentTags = document.querySelector("#current-tags");
const orBox = document.querySelector("#or-box");

function renderProblemList(problems) {
    const problemList = document.querySelector("#problem tbody");

    // 清空題目渲染區
    problemList.innerHTML = "";
    
    // 取得每一筆題目的資料，並且渲染上去
    const or = orBox.checked;
    const queryTags = [...currentTags.querySelectorAll(".tag")].map((elem) => elem.value);

    for (const url of Object.keys(problems)) {
        let {name, difficulty, tags, comment} = problems[url];
        let tagCount = 0;

        // 將難度表轉換成星星
        difficulty = parseInt(difficulty);
        let difficulty_star = "<i class=\"fas fa-star\"></i>".repeat(difficulty)+"<i class=\"far fa-star\"></i>".repeat(5-difficulty);
        
        // 將 tags 拆開成 <p>
        let tag_element = "";
        for (x of tags) {
            if (queryTags.includes(x)) {
                tagCount += 1;
            }
            tag_element += `<p class="tag">${x}</p>`;
        }

        const rowHTML = `
        <tr>
            <td><a href=${url}>${name}</a></td>
            <td>${difficulty_star}</td>
            <td>${tag_element}</td>
            <td>${comment}</td>
        </tr>`;

        if (or === true && tagCount > 0) {
            problemList.innerHTML += rowHTML;
        } else if (or === false && tagCount === queryTags.length()) {
            problemList.innerHTML += rowHTML;
        }
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
    
    // 如果沒有資料就丟空字典
    if (!result.problems)
        result.problems = {};

    renderProblemList(result.problems);
});