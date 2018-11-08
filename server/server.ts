import * as express from 'express';
import { registerRoutes } from './routes';

const app = express();

registerRoutes(app);

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
