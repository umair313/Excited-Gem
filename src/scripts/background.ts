let _oneTabPageOpened: String = null; //Null or Id of OneTab Main Page
let onetabURL: String  = chrome.extension.getURL("onetab.html");
let allTabs: Array<Object>;//All tabs including Ignored Group
let refinedTabs: Array<Object>;//Not including the Ignored Group
let ignoredUrlPatterns: Array<string> = [
"chrome://*",
"chrome-extension://*",
"http(s)?://localhost*"
];

let ignoredDataKeys: Array<String> = ['url','favIconUrl','title'];
let _development: Boolean = true;

/**
 * Messaging Beacon between content and Background js
 * @param  {[type]} request [description]
 * @param  {[type]} sender) {               tabsList [description]
 * @return {[type]}         [description]
 */
chrome.runtime.onMessage.addListener((request: any, sender: Function) => {
	let url: String = chrome.extension.getURL("/onetab.html");
    if(sender.url == url)
    {
    	chrome.tabs.remove(parseInt(request.closeTab),()=>{
    		chrome.tabs.query({},
		    	(tabs: Object[])=>{
		    		allTabs = tabs;
		    		refinedTabs = santizeTabs(tabs,ignoredUrlPatterns);
		    });
        });
    }
});

/**
 * Logging only for development environment
 * @param  {[type]} input  [description]
 * @param  {[type]} input2 [description]
 */
function log(input: any,input2: any):void{
	if (_development) console.log(input,input2);
}

/**
 * [saveData description]
 * @param  {String/Object/Array} data    [description]
 * @param  {String} message [description]
 */
function saveData (data: any, message = "Data saved"):void {
	chrome.storage.sync.set(data, ()=> {
    	chrome.notifications.create('reminder', {
	        type: 'basic',
	        iconUrl: '../images/extension-icon48.png',
	        title: 'Data saved',
	        message: message
	     }, (notificationId: String)=> {});
    });
}


/**
 * Opens OneTab Main Page
 */
function openOneTabPage ():void {
	if(_oneTabPageOpened == null){
    	chrome.tabs.create({url: onetabURL, pinned: true},
    		(tab: Object)=> {
	        	_oneTabPageOpened = tab.id;
	        	chrome.tabs.onUpdated.addListener((tabId: Number , info: Object)=> {
	        		if (info.status == "complete") sendTabsToContent();
	    		});//onCreated
        	});//Create Tab
	}
	else {
		chrome.tabs.update(_oneTabPageOpened, {selected: true},sendTabsToContent);//If OneTab Page is opened ,brings focus to it.
	}
}
/**
 * Sets badge label to Tabs count
 * @param {Integer} tabId     [description]
 * @param {Object} info [description]
 */
function setTabCountInBadge(tabId: String , info: Object):void{
	chrome.tabs.query({
	    currentWindow: true
	}, (tabs: Object[])=>{
		chrome.browserAction.setBadgeText({
		text : String(tabs.length)
		});
	});
}

/**
 * [getAllTabs description]
 * @param  {Number} windowId   [Default to current window id -2]
 * @param  {String} returnType all | refined
 * @return {[type]}            [description]
 */
function getAllTabs(windowId?: Number = chrome.windows.WINDOW_ID_CURRENT,returnType?: String = "all"):Object[]{
	console.log("windowID",chrome.windows.WINDOW_ID_CURRENT);
    chrome.tabs.query(
    {
    	// windowId: windowId
    },
    	(tabs: Object[])=> {
    		allTabs = tabs;
    		refinedTabs = santizeTabs(tabs,ignoredUrlPatterns);
    });
    console.log("getAllTabs Return:", allTabs,refinedTabs);
   	if(returnType == "all") {return allTabs;} else {return refinedTabs;}
}
/**
 * Remove tab objects from tab array based on ignore group
 * @param  {Array of Objects} tabs               [description]
 * @param  {Array} ignoredUrlPatterns [description]
 * @return {Array of Object}   Returns neat array after removing ignored urls
 */
function santizeTabs(tabs: Object[] , ignoredUrlPatterns: String[]):Object[]{
	refinedTabs = tabs.filter((tab)=>{
		let patLength =	ignoredUrlPatterns.length;
		let url = tab.url;
		let pattern = new RegExp(ignoredUrlPatterns.join("|"), "i");
		let matched = url.match(pattern) == null;
		// log(url,pattern,matched);
		return(matched);
	});
	return refinedTabs;
}
function reSendTabsToContent () {
	getAllTabs();
	// sendToContent();
	sendTabsToContent();
}
function sendTabsToContent (data = allTabs):void {
	getAllTabs();
	sendToContent("tabsList",data);
}
/**
 * [listAllTabs description]
 * @return {[type]} [description]
 */
function sendToContent (datavariable: String, data:Object[]):void {
	let obj: Object = {};
	obj[datavariable] = data;
	chrome.runtime.sendMessage(obj);
}

/**
 * Running setTabCountInBage when the Chrome Extension is installed ,a tab is created, removed , attached or detached.
 */
function onUpdate (functions: Function) {
	chrome.runtime.onInstalled.addListener(functions)
	chrome.tabs.onCreated.addListener(functions);
	chrome.tabs.onRemoved.addListener(functions);
	chrome.tabs.onDetached.addListener(functions);
	chrome.tabs.onAttached.addListener(functions);
}
onUpdate(setTabCountInBadge);
onUpdate(getAllTabs);
chrome.runtime.onInstalled.addListener(()=>{
	getAllTabs();
	sendTabsToContent();
})
/**
 * On clicking extension button
 */
chrome.browserAction.onClicked.addListener((tab: Object)=> {
    openOneTabPage();
});
chrome.idle.setDetectionInterval(30);
chrome.idle.onStateChanged.addListener((newState: String)=>{
	if(newState == 'idle'){
		console.log("idle");
	}
});
function tabToList (tabId: Number):void {
	chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, (tabs: Object[])=> {
    // and use that tab to fill in out title and url
    let tab = tabs[0];
    sendToContent("tabsList",tab);
});
}
/**
 * Creating Context Menus
 */
chrome.contextMenus.create({
    "title": "Refresh Main Page",
    "onclick" : reSendTabsToContent ,
  });
chrome.contextMenus.create({
    "title": "Send Current tab to list",
    "onclick" : tabToList ,
  });
// chrome.contextMenus.create({
//     "title": "Refresh Main Page including Ignored",
//     "onclick" : sendToContent(true),
//   });
chrome.contextMenus.create({
    "title": "Show Excited Gem Page",
    "onclick" : openOneTabPage,
  });
