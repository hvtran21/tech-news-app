import express, { Express, Request, Response } from 'express';

const app: Express  = express();
const port = 8000;

app.get('/', (req: Request, res: Response) => {
    res.send("HELLO!");
});

app.listen(port, () => {
    console.log(`now listening on port ${port}`);
});
