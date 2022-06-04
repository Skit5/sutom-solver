console.log('##################################\nMO-MO-MOCKTUS! TALALALA LA LAAAAA!\n##################################\n\n');

console.log("Chargement du lexique, veuillez patienter...");
const fs = require('fs');
const srcFile = 'data/lexique.txt'

let mots = tailles = lettres = [];

fs.readFile(srcFile, (err,data) => {
    if(err) throw err;

    mots = data.toString().split(' ');
    //console.log("Lexique chargé. Chargement des index, veuillez patienter...");
    mots.forEach((mot,k) => {
        tailles[mot.length] = (tailles[mot.length] || []).concat(mot);
        lettres[mot[0]] = (lettres[mot[0]] || []).concat(mot);
    });

    run();
});

class GrilleDeMocktus {
    constructor(selection) {
        // règles
        this.limiteEssais = 6; // nombre maximum de tentatives

        // génération de grille
        if(typeof selection === 'string')
            this.word2guess = selection;
        else if(typeof selection === 'number')
            this.word2guess = tailles[selection][Math.floor(Math.random() * tailles[selection].length)];
        else
            this.word2guess = mots[Math.floor(Math.random() * mots.length)];
    }

    play(){
        const _this = this;
        for(let essai = 0; essai < this.lineLimit; essai++){
            let validInput = false;
            let userInput;
            while(!validInput){
                rl.question(">", function(tentative) {
                    if(typeof tentative == 'undefined'){
                        rl.question("Veux-tu quitter? [y/N]", function(resp) {
                            if(resp == 'y')
                                validInput = true;
                        });
                    }else {
                        validInput = _this.isValid(tentative);
                        if(validInput)
                            userInput = tentative;
                    }
                    rl.close();
                });
            }
            if(this.verify(userInput))
                break;
        }
    }

    //loadDic(){}

    /*generate(size){
        //if(typeof size === 'number')
    }*/

    isValid(word2test){
        // test de taille
        if(word2test.length < this.word2guess.length){
            console.log("Ce mot est trop court.\nIl devrait faire ${this.word2guess.length} lettres.");
            return false;
        }else if(word2test.length > this.word2guess.length){
            console.log("Ce mot est trop long.\nIl devrait faire ${this.word2guess.length} lettres.");
            return false;
        }
        // test de première lettre
        if(word2test[0] !== this.word2guess[0]){
            console.log("Votre mot doit commencer par la lettre %s.",this.word2guess[0]);
            return false;
        }
        // test de présence dans le lexique
        if(!(word2test in tailles[this.word2guess.length])){
            console.log("Votre mot n'est pas présent dans le lexique");
            return false;
        }
        // Sinon...
        return true;
    }

    verify(userInput){
        if((typeof userInput === 'undefined') || (userInput == ''))
            return false;

        let buffMot = this.word2guess;
        let buffOut = new Array(this.word2guess.length);
        let testValue = true;
        // symbol definition
        const symbolRouge = 'X', symbolJaune = '°';

        userInput.forEach((lettre,cle) => {
            if(lettre === this.word2guess[cle]){
                buffMot[cle] = '';
                buffOut[cle] = symbolRouge
            }
        });
        userInput.forEach((lettre,cle) => {
            if(buffOut[cle] !== symbolRouge){
                testValue = false;

                const matchedLetterIndex = buffMot.findIndex(lettre)
                if(matchedLetterIndex >= 0){
                    buffMot[matchedLetterIndex] = '';
                    buffOut[matchedLetterIndex] = symbolJaune
                }
                if(lettre in buffMot){}
                buffMot[cle] = '';
                buffOut[cle] = symbolRouge
            }
        });
        console.log(buffOut);
        return testValue;
    }
}

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/*rl.question("What is your name ? ", function(name) {
    rl.question("Where do you live ? ", function(country) {
        console.log(`${name}, is a citizen of ${country}`);
        rl.close();
    });
});
rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});*/

function run(){
    // Accueil de l'utilisateur
    console.log("Bonjour, je suis votre hôte, Thierry Bot-Arrow,\n Bienvenue dans cette partie de GrilleDeMocktus!");

    // Demande à l'utilisateur de configurer sa grille
    let grilleDeMocktus;
    rl.question("Quelle grille voulez-vous? Entrez un de ces paramètres: [string=mot;nombre=taille;rien=random]", function(selection) {
        grilleDeMocktus = new GrilleDeMocktus(selection);
        console.log(`Votre sélection ${selection} vient de générer une nouvelle grille de Mocktus.\n Je vous souhaite une bonne partie, on commence tout de suite.`);
        rl.close();
    });

    // Lance la partie de GrilleDeMocktus
    grilleDeMocktus.play();

    // Ajoute le score aux points
    // Propose une nouvelle partie
}
