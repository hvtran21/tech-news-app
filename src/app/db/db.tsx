import * as SQLite from 'expo-sqlite';
import { techGenres } from '../components/article';

const db = SQLite.openDatabaseAsync('articles.db');
const BASE_URL = 'http://localhost:8000'

interface article {
    id: string;
    source: string;
    author: string;
    title: string;
    description: string;
    url: URL;
    urlToImage: URL;
    publishedAt: string;
    content?: string;
}


async function retrieveArticles(genres: string) {
    try {
        var response = await fetch(`${BASE_URL}/api/articles`, {
            // TODO: Add authorization somewhere. Maybe here, maybe not.
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                genre: {genres}, // e.g., 'Artificial Intelligence,Dev Ops,Web Dev'
            }),
        });
        if (!response.ok) {
            throw new Error(`Error ocurred, response status: ${response.status}`);
        }
        var data = await response.json() as article[];

        // TODO: create batch inserts of data into local DB
        // const articles = data.map(article => {
            
        // })

    } catch (error) {
        console.error(`Error ocurred: ${error}`);
    }
}

export default retrieveArticles;