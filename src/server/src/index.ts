import express from 'express';
import { articleTableDefinition } from '../models';
import fetchArticles from '../newsapi';
import techGenres from '../constants';
import db from '../db'
import { Article } from '../newsapi';
import { TestContext } from 'node:test';

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
        await fetchArticles(val)
    }
};

function getEnumKey(val: string) {
    return  Object.keys(techGenres).find((k) => {
        return techGenres[k as keyof typeof techGenres]
    })
}

const serverStart = () => {
    const server  = express();
    server.use(express.json());
    const port = process.env.PORT;

    server.get('/fetch', (req, res) => {
        retrieveData();
    });

    server.post('/api/articles', (req, res) => {
        // parse POST request
        var genres = req.body.genre?.genreSelection as string;
        if (genres === '') {
            genres = `${techGenres.AI},${techGenres.APPLE},${techGenres.MICROSOFT},${techGenres.AMAZON}`
        }
        const genreArray = genres.split(',');
        var results: any[] = [];
        console.log(`Recieved query: ${genreArray}`);
        // send JSON response back
        try {
            // fetch data from db
            db.tx(t => {
                const queries = genreArray.map(genre => {
                    const enum_check = getEnumKey(genre);
                    if (!enum_check) {
                        throw new Error(`Error: Genre not in ENUM, got: $`)
                    }
                    return t.any('SELECT * FROM articles WHERE genre = $1', genre)
                })
                return t.batch(queries);
            })
            .then(data => {
                results = data;
                const articles = results.flat();
                console.log('Sending data...')
                res.json({ articles });
            })
            .catch(error => {
                console.error(`Error ocurred retrieving user preference articles: ${error}`);
                
            })
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
