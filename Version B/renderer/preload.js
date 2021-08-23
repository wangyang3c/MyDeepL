const {clipboard,ipcRenderer} = require("electron");

var autoDeleteNewlines = true;
var autoCopy = false;
var outputObserver = null;

// 自动模拟在input输入 ， 不然直接改textarea.value可能会不触发翻译
const inputValue = (dom, st) => {
    dom.value = st;
    var evt = new InputEvent('input', {
        inputType: 'insertText',
        data: st,
        dataTransfer: null,
        isComposing: false
    });
    dom.dispatchEvent(evt);
}

ipcRenderer.on('translateClipboard', (event, message)=>{
    let inputTextArea = document.querySelector('.lmt__source_textarea');
    inputTextArea.focus();
    switch(autoDeleteNewlines) {
        case true: 
            inputValue(inputTextArea, clipboard.readText().replace(/\s+/g, ' '));
            break;
        case false:
            inputValue(inputTextArea, clipboard.readText());
            break;
    }
});

ipcRenderer.on('setAutoDeleteNewlines', (event, message)=>{
    autoDeleteNewlines = message;
})

ipcRenderer.on('setAutoCopy', (event, message)=>{
    autoCopy = message;
    let outputTextArea = document.getElementById('target-dummydiv');
    if(!outputObserver) {
        outputObserver = new MutationObserver((mutationsList, observer) => {
            console.log(outputTextArea.innerHTML)
            clipboard.writeText(outputTextArea.innerHTML);
        });    
    }

    switch(autoCopy) {
        case true: 
            console.log('autoCopy true');
            outputObserver.observe(outputTextArea, {childList: true});
            break;

        case false: 
            console.log('autoCopy false');
            outputObserver.disconnect();
            break;
    }
})

