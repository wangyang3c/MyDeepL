const {clipboard,ipcRenderer} = require('electron');

const inputValue = (dom, st) => {
    var evt = new InputEvent('input', {
        inputType: 'insertText',
        data: st,
        dataTransfer: null,
        isComposing: false
    });
    dom.value = st;
    dom.dispatchEvent(evt);
}

ipcRenderer.on('translateClipboard', (event, message)=>{
    inputTextArea = document.querySelector('.lmt__source_textarea');
    inputTextArea.focus();
    // inputValue(document.querySelector('.lmt__source_textarea'), clipboard.readText().replace(/\s+/g, ' '));
    inputTextArea.value = clipboard.readText().replace(/\s+/g, ' ');

});