const express = require('express');
const app = express();
const port = 4200;

pageHeaders = ['DogeMeet home', 'DogeMeet profile', 'DogeMeet search'];

dogeExample = {
    name: 'Kenji',
    age: 6, 
    breed: 'Shiba Inu',
    image_link: '/public/images/doge_example_kenji.png',
    doge_vibe: ['relaxed', 'cute', 'fluffy'],
    description: 'Heyo, dit is mijn Shiba Inu Kenji. Hij houd erg van andere honden en buiten spelen!',
    description_long: 'Heyo, dit is mijn Shiba Inu Kenji. Hij houd erg van andere honden en buiten spelen! Kenji is heel goed met kinderen en zijn favoriete eten is chips, maar dat krijgt hij niet te vaak hoor!'
}

locationsExample = [{
    name: 'Het Amsterdamse Bos',
    location_distance: '400m'
},
{
    name: 'Een ander bos',
    location_distance: '1.2km'
},
{
    name: 'Nog een bos',
    location_distance: '1.5km'
},
{ 
    name: 'Een super cool strand',
    location_distance: '2.4km'
},
{ 
    name: 'Park Pannenkoek',
    location_distance: '4km'
}];

app.set('view engine', 'pug');

app.get('/', (req, res) => { 
    res.render('home', { doge: dogeExample, location: locationsExample[0] });
});

app.get('/profile', (req, res) => { 
    res.render('profile', { doge: dogeExample, location: locationsExample[0] });
});

app.get('/search', (req, res) => { 
    res.render('search', { locations: locationsExample});
});

app.use(express.static('static'));

app.use((req, res) => { 
    res.status(404).send('Error 404')
});

app.listen(port, () => { 
    console.log(`Listening at https://localhost:${port}`);
});