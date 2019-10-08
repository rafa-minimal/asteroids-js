const express = require('express');

const app = express();
app.use(express.static('dist'));
const port = process.env.PORT || 8080;
const server = app.listen(port, 'localhost', () => {
    console.log(`Server listening on port ${port}`);
});