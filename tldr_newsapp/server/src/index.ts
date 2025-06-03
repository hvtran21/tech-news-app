import express, { Express, Request, Response } from 'express';

const app  = express();
const port = 8000;

app.get('/', (req, res) => {
    res.send("HELLO!");
});

app.get('/different', (req, res) => {
    res.send("HELLO! but this is different?");
});

app.listen(port, () => {
    console.log(`now listening on port ${port}`);
});
