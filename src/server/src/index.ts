import express from 'express';
import { articleTableDefinition } from '../models';
import fetchArticles from '../newsapi';
import techGenres from '../constants';
import db from '../db'

// TODO: add a way so data is continuously retrieved. Similar to a scheduler

async function initDatabase() {
    try {
        await db.none(articleTableDefinition);
        console.log('Database initialized...');
    } catch (error) {
        console.error('Error ocurred when initializing Database: ', error);
        return;
    }
};

async function retrieveData() {
    for (const val of Object.values(techGenres)) {
        fetchArticles(val);
    }
};

const serverStart = () => {
    const server  = express();
    server.use(express.json());
    const port = process.env.PORT;

    server.get('/fetch', (req, res) => {
        retrieveData();
    });

    server.get('/api/articles', (req, res) => {
        // parse POST request
        const genre = req.body.genre;

        // send JSON response back
        try {
            // fetch data from db
            db.any('SELECT * FROM articles WEHRE genre = $1', [genre])
                // data fetched, send response back as JSON
                .then(data => {
                    res.json(data);
                })
                .catch(error => {
                    console.error(`Error ocurred when retrieving article data: ${error}`);
                });

        } catch (error) {
            console.error(`Error occurred: ${error}`);
        };      
    })

    server.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
};

initDatabase();
serverStart();
