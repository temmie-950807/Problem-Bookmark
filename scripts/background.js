chrome.contextMenus.create({  
    "title": "增加 Tag",  
    "type": "normal",  
    "contexts": ['all'],
    "id": "judge-bookmark-create",
    "onclick": openQueryTab()
});

chrome.contextMenus.create({  
    "title": "查詢題單",
    "type": "normal",  
    "contexts": ['all'],
    "id": "judge-bookmark-query",
    "onclick": openQueryTab()
});

function openQueryTab(){
  const url = chrome.runtime.getURL("query/query.html");
  chrome.tabs.create({url: url});
  console.log(url);
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