console.log('##################################\nMO-MO-MOCKTUS! TALALALA LA LAAAAA!\n##################################\n\n');

console.log("Chargement du lexique, veuillez patienter...");
const fs = require('fs');
const srcFile = 'data/dict.txt'

let mots = [];

fs.readFile(srcFile, async (err, data) => {
    if (err) throw err;

    mots = data.toString().split(' ');
    console.log("Lexique chargé. Démarrage...");

    await run();
});

class GrilleDeMocktus {

    constructor(selection) {
        this.limiteEssais = 6; // nombre maximum de tentatives

        // construction de la grille
        //}else if(typeof selection === 'number' && selection){
        if(selection && Number.isInteger(Number(selection))){
            selection = Number(selection);
            while (!mots.find(m => (m.length === selection))) {
                let proposition = rl.question("Il n'y a pas de mot de cette taille dans notre dictionnaire, veuillez en proposer un autre:\n");
                if (Number.isInteger(Number(proposition))) {
                    selection = Number(proposition);
                }
            }
            const indices = this.getIndices(selection);
            this.word2guess = mots[indices.startIndex + Math.floor(Math.random() * (indices.stopIndex - indices.startIndex))];
            //console.log(this.word2guess);
            console.log("Un mot de %s lettres a été choisi.", selection);
        }else if(typeof selection === 'string' && selection) {
            while (mots.find(m => m === selection)) {
                let proposition = rl.question("Ce mot n'est pas dans notre dictionnaire, veuillez en proposer un autre:\n");
                if (typeof proposition === 'string' && proposition) {
                    selection = proposition;
                }
            }
            this.word2guess = GrilleDeMocktus.normalizeInput(selection);
            console.log("Votre mot est validé.");
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

        for (let essai = 0; essai < this.limiteEssais;) {
            let validInput = false;
            let userInput;
            while (!validInput) {
                let tentative = rl.question("");
                if ((typeof tentative == 'undefined') || !tentative) {
                    if(rl.keyInYN("Voulez-vous quitter la partie?"))
                        validInput = true;
                }else{
                    tentative = GrilleDeMocktus.normalizeInput(tentative);
                    validInput = _this.isValid(tentative);
                    if (validInput) {
                        userInput = tentative;
                        essai += 1;
                    }
                }
            }

            if (this.verify(userInput)){
                console.log("\nFélicitations! Vous venez de trouver le bon mot!");
                break;
            }else if(essai === this.limiteEssais-1){
                console.log("\nVous n'êtes pas parvenu à trouver le mot %s.\nPlus de chance la prochaine fois!",this.word2guess);
            }
        }

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
        if((typeof userInput === 'undefined') || !userInput)
            return false;

        let buffMot = this.word2guess.split('');
        let word2guessSplit = this.word2guess.split('');
        let buffOut = new Array(this.word2guess.length);
        let testValue = true;
        // symbol definition
        const symbolRouge = 'X', symbolJaune = '~', symbolVide ='-';
        buffOut.fill(symbolVide);

        userInput.split('').forEach((lettre,cle) => {
            if(lettre === word2guessSplit[cle]){
                buffMot[cle] = '';
                buffOut[cle] = symbolRouge
            }
        });
        userInput.split('').forEach((lettre,cle) => {
            if(buffOut[cle] !== symbolRouge){
                testValue = false;

                const matchedLetterIndex = buffMot.findIndex(l => l === lettre);
                if(matchedLetterIndex >= 0){
                    buffMot[matchedLetterIndex] = '';
                    buffOut[cle] = symbolJaune
                }
            }
        });
        console.log(buffOut.join(''));
        return testValue;
    }
}
const rl = require('readline-sync')

async function run() {
    // Accueil de l'utilisateur
    console.log("Bonjour, je suis votre hôte, Thierry Bot-Arrow !\nBienvenue dans cette partie de Mocktus!");

    // Demande à l'utilisateur de configurer sa grille
    let grilleDeMocktus;
    let exitToken = false;
    let selection = rl.question("Quelle grille voulez-vous? Entrez un de ces paramètres: [string=mot;nombre=taille;rien=random]\n");
    grilleDeMocktus = new GrilleDeMocktus(selection);
    console.log('Votre sélection vient de générer une nouvelle grille de Mocktus.', selection);

    // Lance la partie de GrilleDeMocktus
    grilleDeMocktus.play();

    // Ajoute le score aux points
    // Propose une nouvelle partie
}
