chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveChatLogs") {
    const itemList = [
      ...document.querySelectorAll("div.flex.flex-col.items-start"),
    ];
    const itemHTMLs = itemList.map((item) => {
      const hasChildren = item.children.length > 0;
      const className = hasChildren ? "answer" : "question";
      item.classList.add(className);
      return item.outerHTML;
    });

    console.log(itemHTMLs);

    sendResponse({ itemHTMLs });
  }
});
