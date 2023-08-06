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

chrome.action.disable();

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(() => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: chrome.runtime.getManifest().host_permissions.map(h => {
        const [, sub, host] = h.match(/:\/\/(\*\.)?([^/]+)/);
        return new chrome.declarativeContent.PageStateMatcher({
          pageUrl: sub ? {hostSuffix: '.' + host} : {hostEquals: host},
        });
      }),
      actions: [new chrome.declarativeContent.ShowAction()],
    }]);
  });
});