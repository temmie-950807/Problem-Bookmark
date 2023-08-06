chrome.contextMenus.create({  
    "title": "增加 Tag",  
    "type": "normal",  
    "contexts": ['all'],
    "id": "create",
    "onclick": updateTags()
});

chrome.contextMenus.create({  
    "title": "查詢題單",
    "type": "normal",  
    "contexts": ['all'],
    "id": "query",
    "onclick": openQueryTab()
});

function updateTags(){
    const URL = "chrome-extension://llhmjlbjohiiahpggagjkfpkhbopfggi/query/query.html"
    chrome.tabs.create({url: URL}) 
}

function openQueryTab(){
    const URL = "chrome-extension://llhmjlbjohiiahpggagjkfpkhbopfggi/query/query.html"
    chrome.tabs.create({url: URL})
}