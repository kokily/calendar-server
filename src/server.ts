import 'dotenv/config';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { DataSource } from 'typeorm';
import app from './app';
import entities from './entities';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  synchronize: true,
  logging: true,
  entities,
});

const _bootStrap = async () => {
  await dataSource.initialize();

  const configuration = {
    production: { ssl: true, port: 443, host: '' },
    development: { ssl: false, port: 4000, host: 'localhost' },
  };
  const environment = process.env.NODE_ENV || 'production';
  const config = configuration[environment];

  let server;

  if (config.ssl) {
    server = https.createServer(
      {
        key: fs.readFileSync(`${process.env.SSL_KEY}`),
        cert: fs.readFileSync(`${process.env.SSL_CERT}`),
      },
      app.callback()
    );
  } else {
    server = http.createServer(app.callback());
  }

  server.listen(config.port, () => {
    console.log(`> server is running on ${config.port} port`);
  });
};

_bootStrap();
