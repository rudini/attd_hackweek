import * as express from 'express';
import { Express, Response, Request } from 'express';

const app: Express = express();

app.get('/', function (_: Request, res: Response) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});