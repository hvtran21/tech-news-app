import express, { Express, Request, Response } from 'express';
import db from '../db'
import { articleTableDefinition } from '../models';

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
        res.send("HELLO!");
    });
    
    server.listen(port, () => {
        console.log(`Listening on port ${port}...`);
    });
};

initDatabase();
serverStart();
