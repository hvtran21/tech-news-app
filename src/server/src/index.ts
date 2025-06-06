import express, { Express, Request, Response } from 'express';
import { articleTableDefinition } from '../models';
import fetchArticles from '../newsapi';
import db from '../db'

async function initDatabase() {
    try {
        await db.none(articleTableDefinition);
        console.log('Database initialized...');
    } catch (error) {
        console.error('Error ocurred when initializing Database: ', error);
        return;
    }
};


const serverStart = () => {
    const server  = express();
    const port = 8000;
    
    server.get('/', (req, res) => {
        res.send('Hello');
    });

    server.get('/newsapi', (req, res) => {
        res.send('calling newsapi');
        fetchArticles();
    })

    server.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
};

initDatabase();
serverStart();
