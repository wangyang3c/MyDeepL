var textareaInput = null;
var textareaOutput = null;
var textInput = null
var textOutput = null

window.onload = init;


function init() {
    textareaInput = document.getElementById('textarea-input');
    textareaOutput = document.getElementById('textarea-output');
    textareaInput.oninput = translate;
}


function translate() {
    textInput = textareaInput.value;
    // textInput = dbc2sbc(textInput);
    textInput = textInput.replace(/\s+/g, ' ');
    textareaOutput.value = textInput
}





// function dbc2sbc(str) {
//     let result = '';
//     for (let i = 0; i < str.length; i++) {
//         let charCode = str.charCodeAt(i);

//         // 全角数字、字母转为半角
//         if ((charCode >= 65296 && charCode <= 65305) || //0~9
//             (charCode >= 65313 && charCode <= 65338) || //A~Z
//             (charCode >= 65345 && charCode <= 65370)) { //a~z
//             result += String.fromCharCode(charCode - 65248)
//         } 
        
//         // 全角空格转为半角
//         else if (charCode == 12288) { //space
//             result += String.fromCharCode(32);
//         } 
        
//         // 本来就半角的不变
//         else {
//             result += str[i];
//         }
//     }
//     return result;
// }