document.addEventListener('DOMContentLoaded', () => {
    const sourceText = document.getElementById('source-text');
    const resultText = document.getElementById('result-text');
    const fromEncoding = document.getElementById('from-encoding');
    const toEncoding = document.getElementById('to-encoding');
    const convertBtn = document.getElementById('convert-btn');
    const clearBtn = document.getElementById('clear-btn');
    const swapBtn = document.getElementById('swap-btn');

    convertBtn.addEventListener('click', convertText);
    clearBtn.addEventListener('click', clearAll);
    swapBtn.addEventListener('click', swapEncodings);
    sourceText.addEventListener('input', () => {
        if (sourceText.value.trim() === '') {
            resultText.value = '';
        }
    });

    function convertText() {
        const text = sourceText.value.trim();
        if (!text) {
            resultText.value = '';
            return;
        }

        const fromEnc = fromEncoding.value;
        const toEnc = toEncoding.value;

        if (fromEnc === toEnc) {
            resultText.value = text;
            return;
        }
        
        try {
            let decodedString;
            
            // 自动检测编码 (一个简化的版本)
            if (fromEnc === 'auto') {
                if (/^[\x00-\x7F]*$/.test(text)) {
                    decodedString = text; // ASCII
                } else {
                    try {
                        decodedString = new TextDecoder('gbk').decode(new TextEncoder().encode(text));
                    } catch (e) {
                        decodedString = text; // 默认按UTF-8处理
                    }
                }
            } else {
                decodedString = new TextDecoder(fromEnc).decode(new TextEncoder().encode(text));
            }

            const encodedBytes = new TextEncoder().encode(decodedString);
            const convertedString = new TextDecoder(toEnc).decode(encodedBytes);

            resultText.value = convertedString;
        } catch (error) {
            console.error("转换失败:", error);
            resultText.value = "转换失败！请检查输入内容或编码格式是否正确。";
        }
    }

    function clearAll() {
        sourceText.value = '';
        resultText.value = '';
    }

    function swapEncodings() {
        const temp = fromEncoding.value;
        fromEncoding.value = toEncoding.value;
        toEncoding.value = temp;
    }
});