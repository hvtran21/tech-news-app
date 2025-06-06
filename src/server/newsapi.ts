import { techGenres } from "./contants";
import db from "./db";
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';

dotenv.config();

interface Article {
    // this interface allows us to map each parameter in the articles array
    // to this interface, allowing TS to see the types we intend on assigning.
    id: string;
    source: { name: string };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: Date;
    content?: string;
}

async function fetchArticles() {
    // Parameters: None
    // Return: None
    // Fetches a news article from News API, and adds it to database

    // TODO: fetch articles based off of user preference, this will be added at a later point.
    const genre = techGenres.AI;
    const apiKey = process.env.NEWS_API_KEY;
    const user_country = 'us'
    var pageSize = 20;
    var base_url = `https://newsapi.org/v2/top-headlines?q=${genre}&apiKey=${apiKey}&pageSize=${pageSize}`;

    var totalProcesssed = 0;
    var totalResults = Infinity;
    var page = 1;
    while (totalProcesssed < totalResults) {
        // fetch data from News API
        try {
            var url = base_url;
            if (totalResults > pageSize) {
                console.log(`Fetching page=${page}`);
                // if there are more results, need to fetch all of them.
                url = `${base_url}&page=${page}`;
                page += 1;
            }
            const encoded_url = encodeURI(url);
            console.log('fetching article..')
            const response = await fetch(encoded_url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            // save data in memory
            var data = await response.json();
        } catch (error) {
            console.error(error);
        }
        totalResults = data.totalResults;
        if (totalResults <= 0) {
            console.log('Results are less than 0. Returning..');
            return;
        }

        // set up data to be inserted into db
        const articles: Article[] = data.articles;
        totalProcesssed += articles.length;
        console.log(`totalResults: ${totalResults}`);
        const lst = articles.map(article => ({
            id: uuidv4(),
            source: article.source.name,
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            url_to_image: article.urlToImage,
            published_at: new Date(article.publishedAt),
            content: article.content
        }))

        // add fetched articles to the database
        db.tx(t => {
            const queries = lst.map(article => {
                return t.none(
                    'INSERT INTO articles(id, source, author, title, description, url, url_to_image, published_at, content) \
                        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)', [uuidv4(), article.source, article.author, article.title, article.description, article.url, article.url_to_image, article.published_at, article.content]
                );
            });
            return t.batch(queries);
        })
        .then(data => {
            console.log('Total articles inserted:', data.length);
        })
        .catch(error => {
            console.error('Error ocurred when inserting data:', error);
        });
    };
};

export default fetchArticles;