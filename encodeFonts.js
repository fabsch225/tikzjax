const fs = require('fs');
const path = require('path');
const directoryPath = path.join(__dirname, 'fonts');
let fontNames = fs.readdirSync(directoryPath);

const template = `@font-face { font-family: FONTNAME; src: url(data:font/woff2;charset=utf-8;base64,FONTINBASE64) format('woff2'); }
`;

let css = "";

for (const fontName of fontNames) {
    const fontBuffer  = fs.readFileSync(path.join(directoryPath, fontName));
    const fontInBase64 = fontBuffer.toString('base64');

    css = css + template.replace("FONTNAME", fontName.slice(0, -6)).replace("FONTINBASE64", fontInBase64);
}

fs.writeFileSync(path.join(directoryPath, '..', 'dist', 'fonts.css'), css, {encoding:'utf-8'});
