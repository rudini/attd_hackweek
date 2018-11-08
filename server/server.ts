import * as express from 'express';
import { registerRoutes } from './routes';
import * as cors from 'cors';

const app = express();

app.use(
    cors()
);

registerRoutes(app);

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
