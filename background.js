chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === "enable") {
        chrome.pageAction.show(sender.tab.id);
    }
    else if (request.type === "up") {
        capture(sender.tab.id, request.dimensions);
    }

    sendResponse({});
    function send(request) {
        chrome.tabs.sendMessage(sender.tab.id, request, function(response) {});
    }
});

chrome.pageAction.onClicked.addListener(function onClicked(tab) {
    chrome.tabs.sendMessage(tab.id, { type: "start" }, function(response) {});
});

var canvas = null;
function capture(tabId, dimensions) {
    chrome.tabs.get(tabId, function(tab) {
        chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, function(dataUrl) {
            if (!canvas) {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            var image = new Image();
            image.onload = function() {
                canvas.width = dimensions.width;
                canvas.height = dimensions.height;
                var context = canvas.getContext("2d");
                context.drawImage(image,
                    dimensions.left, dimensions.top,
                    dimensions.width, dimensions.height,
                    0, 0,
                    dimensions.width, dimensions.height
                );
                var croppedDataUrl = canvas.toDataURL("image/png");
                chrome.tabs.create({
                    url: croppedDataUrl,
                    windowId: tab.windowId
                });
            }
            image.src = dataUrl;
        });
    });
}
