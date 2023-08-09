chrome.contextMenus.onClicked.addListener(info => {
  console.log(info);
  if (info.menuItemId == "query") openQueryTab();
});

function openQueryTab(){
  console.log("openQueryTab");
  const url = chrome.runtime.getURL("query/query.html");
  chrome.tabs.create({url: url});
  console.log(url);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({  
    title: "增加 Tag",  
    contexts: ['all'],
    id: "create"
  }, openQueryTab);
  chrome.contextMenus.create({
      title: "查詢題單",
      contexts: ['all'],
      id: "query",
  }, openQueryTab);
});