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
    // textInput = textInput.replace(/\s+/g, ' ');  // remove Metacharacter (所有空字符，如空格。回车，换行。。。)

    const xhr = new XMLHttpRequest();
    xhr.responseType = "json";
    xhr.open('POST', "https://api-free.deepl.com/v2/translate?auth_key=213b57df-6b40-cee2-2f9c-2c8dbaa2c34a:fx");
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    xhr.send(`auth_key=213b57df-6b40-cee2-2f9c-2c8dbaa2c34a:fx&text=${textInput}&target_lang=DE&split_sentences=nonewlines`);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status <= 300) {
                text = xhr.response.translations[0].text;
                sourceLanguage = xhr.response.translations[0].detected_source_language;
                textareaOutput.value = text
            }
        }
    }

    
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