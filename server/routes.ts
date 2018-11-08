import * as fs from 'fs';
import * as path from 'path';
import { Express } from 'express';

export const registerRoutes = (app: Express) => {
    app.get('/api/teuerungsrechnerdaten', (_, res) => {
        fs.readFile(path.join(__dirname, 'teuerungsrechner_daten.json'), 'utf8', (_, data) => {
            res.status(200)
                .contentType('json')
                .send(data);
        });
    });
};
