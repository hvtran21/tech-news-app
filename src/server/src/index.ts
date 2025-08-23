import express from 'express';
import { articleTableDefinition } from '../models';
import fetchArticles from '../newsapi';
import techGenres, { categories } from '../constants';
import db from '../db';

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
        await fetchArticles(val, undefined);
    }

    for (const val of Object.values(categories)) {
        await fetchArticles(undefined, val);
    }

    return 0;
}

function getEnumKey(val: string) {
    return Object.keys(techGenres).find((k) => {
        return techGenres[k as keyof typeof techGenres] === val;
    });
}

const toStandardDateFormat = (d: Date): string => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

async function removeOldArticles(days?: number): Promise<number> {
    var maxDays: number = 7;

    if (days) {
        maxDays = days;
    }

    try {
        const currentDate = new Date();
        const cutOffDate = toStandardDateFormat(
            new Date(currentDate.getTime() - maxDays * 24 * 60 * 60 * 1000),
        );

        await db
            .result('DELETE FROM articles WHERE published_at <= $1', cutOffDate)
            .then((result) => {
                console.log(`Removed ${result.rowCount} articles.`);
            })
            .catch((error) => {
                console.error(`Error removing articles: ${error}`);
                return -1;
            });
    } catch (error) {
        console.error(error);
        return -1;
    }

    return 0;
}

const serverStart = () => {
    const server = express();
    server.use(express.json());
    const port = process.env.PORT;

    // endpoint to delete articles - shouldn't really be an endpoint, but that's fine.
    server.post('/api/RemoveOldArticles', (req, res) => {
        const days = req.body?.days as number;
        const execute = async (days: number) => {
            const result = await removeOldArticles(days);

            // catch internal server error
            if (result != 0) {
                res.status(500).json({
                    ok: false,
                    message: 'Error ocurred while removing articles.',
                });
            } else {
                res.status(200).json({
                    ok: true,
                    message: 'Removing articles successful.',
                });
            }
        };
        execute(days);
    });

    server.get('/api/FetchArticles', (req, res) => {
        const execute = async () => {
            const result = await retrieveData();

            // catch internal server error
            if (result != 0) {
                res.status(500).json({
                    ok: false,
                    message: 'Fetching articles failed, internal server error.',
                });
                return;
            }

            res.status(200).json({
                ok: true,
                message: 'Fetching articles successful.',
            });
        };
        execute();
    });

    server.post('/api/GetArticles', (req, res) => {
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
