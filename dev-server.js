const fs = require('fs');
const express = require('express');
const path = require('path');
const server = express();
const bodyParser = require('body-parser');

server.use(bodyParser.json());

server.get('/js/sprite-type-bundle.js', (req, res) => {
    let spriteTypes = "";
    fs.readdirSync("./public/sprite-types").forEach(file => {
        const data = fs.readFileSync('./public/sprite-types/' + file, 'utf8');
        spriteTypes += data;
    });

    res.send(spriteTypes);
});

server.post('/album/:album/scenes/:scene', (req, res) => {
    
    fs.writeFile(
        `./public/albums/${req.params.album}/scenes/${req.params.scene}.json`,
        JSON.stringify(req.body, null, '  '),
        'utf8',
        function (err) {
            if (err) {
                console.error(err);
                res.sendStatus(503);
            }
            console.log(req.params.scene + ' saved');
            res.sendStatus(200);
        });
});

server.use('/', express.static(path.join(__dirname, 'public')));
server.listen(8080, () => {
    console.log("dev server started");
});