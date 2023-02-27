const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.error(`UCAUGHT EXCEPTION: ${err.message}`);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => console.log('DB connected...'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`App running on port ${port}...`));

process.on('unhandledRejection', (err) => console.log(`UNHANDLED REJECTION: ${err.message} `));
process.on('SIGTERM', () => server.close(() => console.log('Process terminated!')));
