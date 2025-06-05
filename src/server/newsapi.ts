import { techGenres } from "./contants";
import db from "./db";
import dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';

dotenv.config();

async function addArticle() {
    // Parameters: None
    // Return: None
    // Fetches a news article from News API, and adds it to database

    // TODO: fetch articles based off of user preference, this will be added at a later point.
    const genre = techGenres.AI;
    const apiKey = process.env.NEWS_API_KEY;
    const user_country = 'us'
    const base_url = encodeURI(`https://newsapi.org/v2/top-headlines?country=${user_country}$category=technology&q=${genre}&apiKey=${apiKey}`);
    
    try {
        const response = await fetch(base_url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        var data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }

    // TODO: Need to add pagination to get through all results.
    // this requires restructuring and adding the try catch code in the while loop.
    const json = JSON.parse(data);
    const totalResults = json.totalResults;
    var totalProcesssed = 0;
    while (totalProcesssed < totalResults) {

    }
    await db.none(
        'INSERT INTO articles (id, source, author, title, description, url, url_to_image, published_at, content)',
        [
            // json[],
            
        ]
    )

};