process.on('uncaughtException', function (e) {
    console.error('Unhandled exception:');
    console.error(e);
    console.error(e.stack);
    process.exit(99);
});

const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

const pool = mysql.createPool({
    connectionLimit: 10,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

server.use(bodyParser.json());

server.use(cors());

server.get('/', (req, res) => {
    res.sendStatus(200);
});

server.get('/health', (req, res) => {
    res.sendStatus(200);
});

server.get('/v1/scenes/:id', (req, res) => {

    console.log('get scene ' + req.params.id);

    pool.query("SELECT * FROM `scenes` WHERE id = ?",
        req.params.id,
        function (error, results) {
            if (error) {
                logError(error);
                res.sendStatus(500);
            }
            else if (results.length === 0) {
                res.sendStatus(404);
            }
            else {
                const scene = JSON.parse(results[0].json);
                res.json(scene);
            }
        }
    );
});

server.get('/v1/scenes', (req, res) => {

    if (req.query.author) {
        pool.query("SELECT * FROM `scenes` WHERE author = ?",
            req.query.author,
            function (error, results) {
                if (error) {
                    logError(error);
                    res.sendStatus(500);
                }
                else if (results.length === 0) {
                    res.sendStatus(404);
                }
                else {
                    res.json(results.map(result => {
                        return {
                            id: result.id,
                            title: result.title,
                            author: result.author,
                            created: result.created,
                            lastEdit: result.lastEdit
                        };
                    }));
                }
            }
        );
    }
    else {
        pool.query("SELECT * FROM `scenes`",
            function (error, results) {
                if (error) {
                    logError(error);
                    res.sendStatus(500);
                }
                else if (results.length === 0) {
                    res.sendStatus(404);
                }
                else {
                    res.json(results.map(result => {
                        return {
                            id: result.id,
                            title: result.title,
                            author: result.author,
                            created: result.created,
                            lastEdit: result.lastEdit,
                            color: result.color,
                            actionDifficulty: result.actionDifficulty,
                            puzzleDifficulty: result.puzzleDifficulty
                        };
                    }));
                }
            }
        );
    }
});

server.put('/v1/scene', (req, res) => {

    if (!req.body) {
        res.status(400).send("No request body");
        return;
    }

    if (!req.body.scene) {
        res.status(400).send("Scene is required");
        return;
    }

    if (!req.body.scene.id) {
        res.status(400).send("Scene ID is required");
        return;
    }

    if (!req.body.authorKey) {
        res.status(403).send("Author key is required");
        return;
    }

    const scene = { ...req.body.scene };

    pool.query("SELECT * FROM `users` WHERE authorKey = ?",
        req.body.authorKey,
        (error, users) => {
            if (error) {
                logError(error, req.body.requestId);
                res.sendStatus(500);
            }
            // user with author key not found
            else if (users.length === 0) {
                res.status(403).send("Invalid author key");
            }
            // user found
            else {
                // check if scene exists
                pool.query("SELECT * FROM `scenes` WHERE id = ?",
                    scene.id,
                    function (error, scenes) {
                        if (error) {
                            logError(error, req.body.requestId);
                            res.sendStatus(500);
                        }
                        // scene not found, so insert a new one
                        else if (scenes.length === 0) {

                            scene.created = new Date().toISOString();
                            scene.lastEdit = new Date().toISOString();

                            const fields = {
                                id: scene.id,
                                creatorId: users[0].userId,
                                created: scene.created,
                                lastEdit: scene.lastEdit,
                                json: JSON.stringify(scene),
                                author: scene.author,
                                title: scene.title,
                                color: scene.bgColor,
                                actionDifficulty: scene.actionDifficulty,
                                puzzleDifficulty: scene.puzzleDifficulty,
                            };

                            pool.query("INSERT INTO `scenes` SET ?",
                                fields,
                                function (error) {
                                    if (error) {
                                        logError(error, req.body.requestId);
                                        res.sendStatus(500);
                                    }
                                    else {
                                        res.status(201).json({ scene });
                                    }
                                }
                            );
                        }
                        // old scene found, lets update it
                        else {

                            // check if author is the same
                            if (scenes[0].creatorId === users[0].userId) {

                                scene.lastEdit = new Date().toISOString();

                                const fields = {
                                    lastEdit: scene.lastEdit,
                                    title: scene.title,
                                    author: scene.author,
                                    color: scene.bgColor,
                                    actionDifficulty: scene.actionDifficulty,
                                    puzzleDifficulty: scene.puzzleDifficulty,
                                    json: JSON.stringify(scene),
                                };

                                pool.query("UPDATE `scenes` SET ? WHERE id = ?",
                                    [fields, scene.id],
                                    function (error, results) {
                                        if (error) {
                                            logError(error, req.body.requestId);
                                            res.sendStatus(500);
                                        }
                                        else if (results.affectedRows === 0) {
                                            res.sendStatus(410);
                                        }
                                        else {
                                            res.json({ scene });
                                        }
                                    }
                                );
                            }
                            else {
                                res.status(403).send(`Use another id. Id ${scene.id} is already used in ${scene.title} by ${scene.author}.`);
                            }
                        }
                    }
                );
            }
        });
});

server.delete('/v1/scene/:id', (req, res) => {

    if (!req.body.authorKey) {
        res.status(403).send("Author key is required.");
        return;
    }

    pool.query("SELECT * FROM `users` WHERE authorKey = ?",
        req.body.authorKey,
        (error, users) => {
            if (error) {
                logError(error, req.body.requestId);
                res.sendStatus(500);
            }
            // user with author key not found
            else if (users.length === 0) {
                res.status(403).send("Invalid author key");
            }
            // user found
            else {

                pool.query("DELETE FROM `scenes` WHERE id = ? AND creatorId = ?",
                    [req.params.id, users[0].userId],
                    function (error) {
                        if (error) {
                            logError(error, req.body.requestId);
                            res.sendStatus(500);
                        }
                        else {
                            res.sendStatus(204);
                        }
                    }
                );
            }
        });
});

server.listen(8080, () => {
    console.log("==== Duckface API server started at port 8080 ====");
});

function log(message, requestId = "no-id") {
    console.log(`LOG ${requestId} ${new Date().toISOString()} ${message}`);
}

function logError(error, requestId = "no-id") {
    console.error(`ERR ${requestId} ${new Date().toISOString()} ${error.message ? error.message : error}`);
    console.error(error);
}