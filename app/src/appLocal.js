import app from './app.js';

// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
