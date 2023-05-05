function saveChatLogs(filename, text) {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

document.getElementById("saveChatLogs").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "saveChatLogs" },
      (response) => {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";

        // Create a new instance of TurndownService
        const turndownService = new TurndownService();
        let markdownText = "";

        // User defined rules
        turndownService.addRule("question", {
          filter: (node) => {
            return (
              node.tagName === "DIV" && node.classList.contains("question")
            );
          },
          replacement: (content) => {
            return `## Q\n\n${content}`;
          },
        });

        turndownService.addRule("answer", {
          filter: (node) => {
            return node.tagName === "DIV" && node.classList.contains("answer");
          },
          replacement: (content) => {
            return `## A\n\n${content}`;
          },
        });

        turndownService.addRule("codeblock", {
          filter: (node) => {
            return (
              node.tagName === "DIV" &&
              node.classList.contains("bg-black") &&
              node.classList.contains("rounded-md") &&
              node.classList.contains("mb-4")
            );
          },
          replacement: (content, node, options) => {
            const languageSpan = node.querySelector("span");
            const language = languageSpan
              ? languageSpan.textContent.trim().toLowerCase()
              : "";
            const codeElement = node.querySelector("code");
            const code = codeElement
              ? codeElement.textContent.trim().replace(/`{3}/g, "")
              : "";

            return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n`;
          },
        });

        response.itemHTMLs.forEach((html) => {
          const contentDiv = document.createElement("div");
          contentDiv.innerHTML = html;

          const markdown = turndownService.turndown(contentDiv.innerHTML);
          markdownText += markdown + "\n\n";
          const markdownDiv = document.createElement("pre");
          markdownDiv.innerText = markdown;

          resultsDiv.appendChild(markdownDiv);
        });

        saveChatLogs("exported_chat_logs.md", markdownText);
      }
    );
  });
});
