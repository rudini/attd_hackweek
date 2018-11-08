import * as express from 'express';
import * as request from 'supertest';

describe('api tests', () => {

  describe('on /api/teuerungsrechnerdaten', () => {

    const app = express();

    app.get('/api/teuerungsrechnerdaten', function (req, res) {
      res.status(200).json({ name: 'john' });
    });

    request(app)
      .get('/api/teuerungsrechnerdaten')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
});
