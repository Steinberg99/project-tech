const express = require('express');
const app = express();
const port = 4200;

app.get('/', (req, res) => { 
    res.send('DogeMeet!');
});

app.get('/profile/:profileId', (req, res) => { 
    res.send(`Profile page of ${req.params.profileId}`);
});

app.get('/search', (req, res) => { 
    res.send('Search page')
});

app.use(express.static('static'));

app.use((req, res) => { 
    res.status(404).send('Error 404')
});

app.listen(port, () => { 
    console.log(`Listening at https://localhost:${port}`);
});