//

var uniqueRandom = require('unique-random');
var request = require('superagent');
var argv = require('yargs')
    .usage('Usage: node index.js')
    .help('h')
    .alias('h', 'help')
    .describe('u', 'Set the github username you want to search')
    .alias('u', 'user')
    .demand('u')
    .epilogue('Made by DKunin http://dkunin.github.io/').argv;

const searchString = `https://api.github.com/search/repositories?q=user:${argv.u} NOT grunt NOT gulp NOT atom`;

function getTotalCount() {
    return new Promise((resolve, reject) => {
        request
            .get(searchString)
            .end((err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data.body.total_count);
            });
    });
}

function getSingleRep(rndmGen) {
    return new Promise((resolve, reject) => {
        request
            .get(`${searchString}&per_page=1&sort=updated&page=${rndmGen()}`)
            .end((err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data.body.items);
            });
    });
}

function generateRandomInts(amount) {
    return uniqueRandom(1, amount);
}

function getNrandomRepos(amount) {
    return rndm => {
        return Promise.all(Array.apply(null, { length: amount }).map(Number.call, Number).map(singleCount => getSingleRep(rndm, singleCount)));
    };
}

function printResult(listOfArrays) {
    return listOfArrays.reduce((itemA, itemB) => itemA.concat(itemB), []).map(singleRepo => {
        return {
            name: singleRepo.name,
            url: singleRepo.html_url
        };
    });
}

getTotalCount()
    .then(generateRandomInts)
    .then(getNrandomRepos(10))
    .then(printResult)
    .then(console.log)
    .catch(console.log);

