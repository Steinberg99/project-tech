const express = require('express');
const app = express();
const port = 4200;

const dogeExample = {
  id: 1,
  name: 'Kenji',
  age: 6,
  breed: 'Shiba Inu',
  image_link: '/public/images/doge_example_kenji.png',
  profile_image_link: '/public/images/doge_example_kenji_profile.png',
  doge_vibe: ['relaxed', 'cute', 'fluffy'],
  description:
    'Heyo, dit is mijn Shiba Inu Kenji. Hij houd erg van andere honden en buiten spelen!',
  description_long:
    'Heyo, dit is mijn Shiba Inu Kenji. Hij houd erg van andere honden en buiten spelen! Kenji is heel goed met kinderen en zijn favoriete eten is chips, maar dat krijgt hij niet te vaak hoor!'
};

const likedDoges = [dogeExample, dogeExample, dogeExample];

const locationsExample = [
  {
    name: 'Het Amsterdamse Bos',
    location_distance: '400m',
    location_type: 'forest'
  },
  {
    name: 'Super cool meer',
    location_distance: '700m',
    location_type: 'lake'
  },
  {
    name: 'Een mooie straat',
    location_distance: '900m',
    location_type: 'city_walk'
  },
  {
    name: 'Een ander bos',
    location_distance: '1.2km',
    location_type: 'forest'
  },
  {
    name: 'Wow, nog een bos',
    location_distance: '1.5km',
    location_type: 'forest'
  },
  {
    name: 'Deens park',
    location_distance: '1.7km',
    location_type: 'park'
  },
  {
    name: 'Een super cool strand',
    location_distance: '2.4km',
    location_type: 'beach'
  },
  {
    name: 'Park Pannenkoek',
    location_distance: '4km',
    location_type: 'park'
  },
  {
    name: 'Een strand',
    location_distance: '4.6km',
    location_type: 'beach'
  },
  {
    name: 'Bazinga meer',
    location_distance: '6.3km',
    location_type: 'lake'
  }
];

function getDogeProfile(id) {
  console.log(`Doge profile id: ${id}`);
  return dogeExample;
}

app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home', { doge: dogeExample, location: locationsExample[0] });
});

app.get('/profile/:profileId', (req, res) => {
  res.render('profile', {
    doge: getDogeProfile(req.params.profileId),
    location: locationsExample[0]
  });
});

app.get('/search', (req, res) => {
  res.render('search', { locations: locationsExample });
});

app.get('/liked', (req, res) => {
  res.render('liked', { likedDoges: likedDoges });
});

app.post('/search-result', (req, res) => {
  console.log(req.body);
  //Fetch doges.
  res.render('home', { doge: dogeExample, location: locationsExample[0] });
});

app.post('/like', (req, res) => {
  if (req.body.cute) {
    likedDoges.push(dogeExample);
  } else if (req.body.cool) {
    likedDoges.push(dogeExample);
  } else if (req.body.pretty) {
    likedDoges.push(dogeExample);
  } else {
    console.log('skip');
  }
  res.redirect('/liked');
});

app.use(express.static('static'));

app.use((req, res) => {
  res.status(404).send('Error 404');
});

app.listen(port, () => {
  console.log(`Listening at https://localhost:${port}`);
});
