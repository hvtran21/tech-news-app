import express from 'express';
import { articleTableDefinition } from '../models';
import fetchArticles from '../newsapi';
import techGenres, { categories } from '../constants';
import db from '../db';
import { error } from 'console';

async function initDatabase() {
    try {
        await db.none(articleTableDefinition);
        console.log('Database initialized...');
    } catch (error) {
        console.error('Error ocurred when initializing Database: ', error);
        return;
    }
}

async function retrieveData() {
    for (const val of Object.values(techGenres)) {
        await fetchArticles(val);
    }

    for (const val of Object.values(categories)) {
        await fetchArticles(undefined, val);
    }
}

function getEnumKey(val: string) {
    return Object.keys(techGenres).find((k) => {
        return techGenres[k as keyof typeof techGenres] === val;
    });
}

const serverStart = () => {
    const server = express();
    server.use(express.json());
    const port = process.env.PORT;

    server.get('/fetch', (req, res) => {
        retrieveData();
    });

    server.post('/api/articles', (req, res) => {
        // parse POST request
        var genres = req.body.genre?.genre as string;
        var category = req.body.category?.cat as string;
        var results: any[] = [];

        // send JSON response back
        try {
            // fetch articles by genre
            if (genres !== '') {
                const genreArray = genres.split(',');
                console.log(`Recieved query: ${genreArray}`);
                db.tx((t) => {
                    const queries = genreArray.map((genre) => {
                        const enum_check = getEnumKey(genre);
                        if (!enum_check) {
                            throw new Error(`Error: Genre not in ENUM, got: $`);
                        }
                        return t.any('SELECT * FROM articles WHERE genre = $1', genre);
                    });
                    return t.batch(queries);
                })
                    .then((data) => {
                        results = data;
                        const articles = results.flat();
                        console.log('Sending data...');
                        res.json({ articles });
                    })
                    .catch((error) => {
                        console.error(
                            `Error ocurred retrieving user preference articles: ${error}`,
                        );
                    });
            } else if (category !== '') {
                console.log(`Recieved query for category: ${category}`);
                db.any('SELECT * FROM ARTICLES WHERE category = $1', category).then((data) => {
                    results = data;
                    const articles = results.flat();
                    console.log('Sending data...');
                    res.json({ articles });
                });
            }
        } catch (error) {
            console.error(`Error occurred: ${error}`);
        }
    });

    server.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
};

initDatabase();
serverStart();
