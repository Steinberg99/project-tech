const express = require('express');
const app = express();
const port = 4200;

app.get('/', (req, res) => { 
    res.send('Howdy World!');
});

app.listen(port, () => { 
    console.log(`Example app listening at https://localhost:${port}`);
});