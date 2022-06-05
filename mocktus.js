console.log('##################################\nMO-MO-MOCKTUS! TALALALA LA LAAAAA!\n##################################\n\n');

console.log("Chargement du lexique, veuillez patienter...");
const fs = require('fs');
const srcFile = 'data/dict.txt'

//let mots = tailles = lettres = [];
let mots = [];

fs.readFile(srcFile, async (err, data) => {
    if (err) throw err;

    mots = data.toString().split(' ');
    console.log("Lexique chargé. Démarrage...");
    /*mots.forEach((mot,k) => {
        tailles[mot.length] = (tailles[mot.length] || []).concat(mot);
        lettres[mot[0]] = (lettres[mot[0]] || []).concat(mot);
    });*/

    await run();
});

class GrilleDeMocktus {

    constructor(selection) {
        this.limiteEssais = 6; // nombre maximum de tentatives
        // génération de grille
        if(typeof selection === 'string' && selection) {
            while (mots.find(m => m === selection)) {
                rl.question("Ce mot n'est pas dans notre dictionnaire, veuillez en proposer un autre", function (proposition) {
                    if (typeof proposition === 'string' && proposition) {
                        selection = proposition;
                    }
                    rl.close();
                });
            }
            this.word2guess = GrilleDeMocktus.normalizeInput(selection);
            console.log("Votre mot est validé.");
        }else if(typeof selection === 'number' && selection){
            //const [min, max] =  this.getLengthIndices(selection);
            //const this.getStartLengthIndex(selection);
            while (mots.filter(m => (m.length === selection)).length === 0) {
                rl.question("Ce mot n'est pas dans notre dictionnaire, veuillez en proposer un autre", function (proposition) {
                    if (typeof proposition === 'number') {
                        selection = proposition;
                    }
                    rl.close();
                });
            }
            const indices = this.getIndices(selection);
            this.word2guess = mots[indices.startIndex + Math.floor(Math.random() * (indices.stopIndex - indices.startIndex))];
            console.log("Un mot de %s lettres a été choisi.", selection);
        }else {
            this.word2guess = mots[Math.floor(Math.random() * mots.length)];
            console.log("Un mot a été choisi au hasard pour vous.");
        }

        // Sélectionne la sous-séquence de mots ordonnés qui a le même nombre de lettres et la même lettre de départ
        const indices = this.getIndices(this.word2guess.length, this.word2guess[0]);
        this.startIndex = indices.startIndex;
        this.stopIndex = indices.stopIndex;
    }

    static normalizeInput(userInput){
    return userInput.trim()
            .normalize("NFD").replace(/\p{Diacritic}/gu, "") //accents removal: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
            .replace(/[\u0152|\u0153]/g, "oe")
            .toUpperCase();
    }

    async play() {
        console.log('Je vous souhaite une bonne partie, on commence tout de suite.\n');
        // Initialisation
        const _this = this;
        const ligneInitiale = this.word2guess[0] + '-'.repeat(this.word2guess.length - 1);
        console.log(ligneInitiale)

        for (let essai = 0; essai < this.limiteEssais; essai++) {
            let validInput = false;
            let userInput;
            //console.log('no valid input yet')
            while (!validInput) {
                let response = new Promise(function (myResolve, myReject) {
                    rl.question("", function (tentative) {
                        if ((typeof tentative == 'undefined') || !tentative) {
                            rl.question("Veux-tu quitter? [y/N]", function (resp) {
                                if (resp === ('y' || 'Y'))
                                    validInput = true;
                            });
                        } else {
                            tentative = GrilleDeMocktus.normalizeInput(tentative);
                            validInput = _this.isValid(tentative);
                            if (validInput)
                                userInput = tentative;
                        }
                    });
                });

                console.log('wait')
                await response.then((value) => {
                    console.log('done %s', value)
                });

                console.log('and done')
            }

            console.log('and out')
            if (this.verify(userInput)){
                console.log("\n Félicitations! Vous venez de trouver le bon mot!");
                break;
            }

            console.log('and pass')
        }

        console.log('and finished')
    }

    getIndices(taille,lettre){ //taille est obligatoire, sinon il n'y a pas de boundaries, lettre est une option
        let startIndex = -1, stopIndex = -1,
            inLengthRange = false, inLetterRange = false;

        for(let i=0; i<mots.length; i++) {
            const mot = mots[i];
            if((mot.length === taille) && (!inLengthRange)){
                inLengthRange = true;
                if(!lettre) // s'il n'y a pas de test de lettre, c'est le startIndex
                    startIndex = i;
            }
            if(lettre && inLengthRange){
                if((lettre === mot[0]) && !inLetterRange){ // test de première lettre
                    inLetterRange = true;
                    startIndex = i;
                }
                if((lettre !== mot[0]) && inLetterRange){ // test de sortie lettre
                    stopIndex = i;
                    break;
                }
            }
            if((mot.length !== taille) && (inLengthRange)){ // test de sortie taille
                stopIndex = i;
                break;
            }

            // Effet de bord
            if((i === mots.length-1) && (startIndex >= 0))
                stopIndex = i;

        }

        return {
          'startIndex': startIndex,
          'stopIndex': stopIndex
        };
    }

    isValid(word2test){
        // test de taille
        if(word2test.length < this.word2guess.length){
            console.log("Ce mot est trop court.\nIl devrait faire %s lettres.",this.word2guess.length);
            return false;
        }else if(word2test.length > this.word2guess.length){
            console.log("Ce mot est trop long.\nIl devrait faire %s lettres.", this.word2guess.length);
            return false;
        }
        // test de première lettre
        if(word2test[0] !== this.word2guess[0]){
            console.log("Votre mot doit commencer par la lettre %s.",this.word2guess[0]);
            return false;
        }
        // test de présence dans le lexique
        if(!mots.slice(this.startIndex,this.stopIndex).find(mot => mot === word2test)){
            console.log("Votre mot n'est pas présent dans le lexique");
            return false;
        }
        // Sinon...
        return true;
    }

    verify(userInput){
        console.log("Userinput is %s",userInput);
        if((typeof userInput === 'undefined') || !userInput)
            return false;

        let buffMot = this.word2guess;
        let buffOut = new Array(this.word2guess.length);
        let testValue = true;
        // symbol definition
        const symbolRouge = 'X', symbolJaune = '~';

        userInput.forEach((lettre,cle) => {
            if(lettre === this.word2guess[cle]){
                buffMot[cle] = '';
                buffOut[cle] = symbolRouge
            }
        });
        userInput.forEach((lettre,cle) => {
            if(buffOut[cle] !== symbolRouge){
                testValue = false;

                const matchedLetterIndex = buffMot.findIndex(l => l === lettre)
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

    isInDict(selection) {
        return false;
    }
}

const readline = require("readline");
const Console = require("console");
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

async function run() {
    // Accueil de l'utilisateur
    console.log("Bonjour, je suis votre hôte, Thierry Bot-Arrow !\nBienvenue dans cette partie de Mocktus!");

    // Demande à l'utilisateur de configurer sa grille
    let grilleDeMocktus;
    let exitToken = false;
    //let response = await new Promise(resolve => {
    let response = new Promise(function(myResolve, myReject) {
        rl.question("Quelle grille voulez-vous? Entrez un de ces paramètres: [string=mot;nombre=taille;rien=random]", function (selection) {
            grilleDeMocktus = new GrilleDeMocktus(selection);
            console.log('Votre sélection %s vient de générer une nouvelle grille de Mocktus.',selection);
            myResolve(selection);
        })
    });
    response.then((value) => {grilleDeMocktus.play()});
    /*rl.question("Quelle grille voulez-vous? Entrez un de ces paramètres: [string=mot;nombre=taille;rien=random]", await function (selection) {
        grilleDeMocktus = new GrilleDeMocktus(selection);
        console.log('Votre sélection ${selection} vient de générer une nouvelle grille de Mocktus.');
        grilleDeMocktus.play();
    })*/
    //});
    /*while (!exitToken) {
        response().then((value)=>{
            grilleDeMocktus.play();
        });
    }*/
    //rl.close();


    // Lance la partie de GrilleDeMocktus
    //grilleDeMocktus.play();

    // Ajoute le score aux points
    // Propose une nouvelle partie
}
