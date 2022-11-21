import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = 1929;

app.get('/', (req: Request, res: Response) => {
    res.send('hello');
});

app.listen(port, () => {

});