// @ts-nocheck
import express from 'express';
import cors from 'cors';
import { expressjwt } from 'express-jwt';
const { auth } = require('./utils/auth');
const jwks = require('jwks-rsa');
const fetch = require('node-fetch');
const request = require('request');

const jwtCheck = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-axsaao7td1bsb2ol.us.auth0.com/.well-known/jwks.json'
  }),
  issuer: "https://dev-axsaao7td1bsb2ol.us.auth0.com/",
  audience: 'https://dev-axsaao7td1bsb2ol.us.auth0.com/api/v2/',
  algorithms: ['RS256']
});
export const app = express();

app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

let movies;
let token;
async function getMovies() {
  await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}`
  )
    .then((resp) => {
      return resp.json();
    })
    .then((response) => {
      movies = response;
    });
}
const api = express.Router();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://projects.pawel-kicinski.pl',
      'http://projects.pawel-kicinski.pl/netflix-clone',
      'http://pawel-kicinski.pl'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET'],
  optionsSuccessStatus: 200,
  referrer: 'same-origin'
};

app.use(cors(corsOptions));
api.use(cors(corsOptions));

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).send({});
});

api.get('/get-token', async (req, res) => {
  await request(
    {
      method: 'POST',
      url: 'https://dev-axsaao7td1bsb2ol.us.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
      form: {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: 'https://dev-axsaao7td1bsb2ol.us.auth0.com/api/v2/',
        grant_type: 'client_credentials'
      }
    },

    async function (error, response, body) {
      if (error) {
        res.status(400);
        res.send(error);
      }
      res.send(body);

    }
  );
});

api.get('/hello', jwtCheck, async (req, res) => {
  await getMovies();
  await res.send({ movies });
});

// Version the api
app.use('/api/v1', api);
