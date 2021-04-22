const express = require('express');
const app = express();
const port = 4200;

pageHeaders = ['DogeMeet home', 'DogeMeet profile', 'DogeMeet search'];

app.set('view engine', 'pug');

app.get('/', (req, res) => { 
    res.render('home', { pageHeader: pageHeaders[0], user: { name: 'Henk' }});
});

app.get('/profile', (req, res) => { 
    res.render('profile', { pageHeader: pageHeaders[1]});
});

app.get('/search', (req, res) => { 
    res.render('search', { pageHeader: pageHeaders[2]});
});

app.use(express.static('static'));

app.use((req, res) => { 
    res.status(404).send('Error 404')
});

app.listen(port, () => { 
    console.log(`Listening at https://localhost:${port}`);
});