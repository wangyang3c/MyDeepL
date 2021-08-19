const {clipboard,ipcRenderer} = require("electron");


var autoDeleteNewlines = true;
var autoCopy = false;
var outputObserver = null;

// const inputValue = (dom, st) => {
//     var evt = new InputEvent('input', {
//         inputType: 'insertText',
//         data: st,
//         dataTransfer: null,
//         isComposing: false
//     });
//     dom.value = st;
//     dom.dispatchEvent(evt);
// }

ipcRenderer.on('translateClipboard', (event, message)=>{
    let inputTextArea = document.querySelector('.lmt__source_textarea');
    inputTextArea.focus();
    // inputValue(document.querySelector('.lmt__source_textarea'), clipboard.readText().replace(/\s+/g, ' '));
    switch(autoDeleteNewlines) {
        case true: 
            inputTextArea.value = clipboard.readText().replace(/\s+/g, ' ');
            break;
        case false:
            inputTextArea.value = clipboard.readText();
            break;
    }
    console.log(document.getElementById('target-dummydiv').innerHTML);

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

