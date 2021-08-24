const {clipboard,ipcRenderer} = require("electron");


let outputObserver = null;

// 自动模拟在input输入 ， 不然直接改textarea.value可能会不触发翻译
const inputValue = (dom, st) => {
    dom.value = st;
    let evt = new InputEvent('input', {
        inputType: 'insertText',
        data: st,
        dataTransfer: null,
        isComposing: false
    });
    dom.dispatchEvent(evt);
}

ipcRenderer.on('translateClipboard', (event, message)=>{
    // ***************************************************
    // *                auto copy                    
    // ***************************************************
    let outputTextArea = document.getElementById('target-dummydiv');
    if(!outputObserver) {
        outputObserver = new MutationObserver((mutationsList, observer) => {
            console.log(outputTextArea.innerHTML)
            clipboard.writeText(outputTextArea.innerHTML);
        });    
    }
    switch(message.autoCopy) {
        case true: 
            console.log('autoCopy true');
            outputObserver.observe(outputTextArea, {childList: true});
            break;
        case false: 
            console.log('autoCopy false');
            outputObserver.disconnect();
            break;
    }


    // ***************************************************
    // *                auto delete newlines                    
    // ***************************************************
    let inputTextArea = document.querySelector('.lmt__source_textarea');
    inputTextArea.focus();
    switch(message.autoDeleteNewlines) {
        case true: 
            console.log('autoDeleteNewlines true');
            inputValue(inputTextArea, clipboard.readText().replace(/\s+/g, ' '));
            break;
        case false:
            console.log('autoDeleteNewlines false');
            inputValue(inputTextArea, clipboard.readText());
            break;
    }
});

