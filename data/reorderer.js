const fs = require('fs');

const srcFile = 'lexique.txt'
const tgtFile = 'dict.txt'
//const tgtFile = 'mots-filtres.txt'

fs.readFile(srcFile, (err,data) => {
    if(err) throw err;

    const mots = data.toString().split(' ').sort((a,b) => {
        if(a.length !== b.length)
            return a.length - b.length;
        else
            return a - b;
    });

    fs.writeFile(tgtFile, mots.join(' '), (err) => {
        if(err) throw err;

        console.log(fs.readFileSync(tgtFile, "utf8"));
    })
});
