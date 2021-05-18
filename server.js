const express = require('express');
const dotenv = require('dotenv').config();
const { MongoClient } = require('mongodb');
const app = express();
let port = process.env.PORT;

const client = new MongoClient(process.env.DB_URI, {
  retryWrites: true,
  useUnifiedTopology: true,
  useNewUrlParser: true
});

//The current example doggos. These will eventualy be moved to the database.
const doggos = [
  {
    id: 1,
    name: 'Kenji',
    age: 6,
    breed: 'Shiba Inu',
    image_link: '/public/images/doge_example_kenji.png',
    profile_image_link: '/public/images/doge_example_kenji_profile.png',
    doge_vibe: ['relaxed', 'cute', 'fluffy'],
    description:
      'Heyo, dit is mijn Shiba Inu Kenji. Hij houd erg van andere honden en buiten spelen!'
  },
  {
    id: 2,
    name: 'Scooby',
    age: 10,
    breed: 'Mix',
    image_link: '/public/images/doge_example_scooby.png',
    profile_image_link: '/public/images/doge_example_scooby_profile.png',
    doge_vibe: ['relaxed', 'cute'],
    description:
      'Hallo! Dit is mijn hond Scooby. Hij is een beetje ondeugend maar wel heel lief.'
  },
  {
    id: 3,
    name: 'Fred',
    age: 3,
    breed: 'Pug',
    image_link: '/public/images/doge_example_fred.png',
    profile_image_link: '/public/images/doge_example_fred_profile.png',
    doge_vibe: ['cute', 'chubby'],
    description:
      'Fred is een beetje dik maar wel heel cute. Kijk z’n tong uitsteken dan!'
  }
];

//The currect example locations. These would also eventualy be moved to the database.
const locations = [
  {
    name: 'Het Amsterdamse Bos',
    distance: '400m',
    type: 'forest'
  },
  {
    name: 'Super cool meer',
    distance: '700m',
    type: 'lake'
  },
  {
    name: 'Een mooie straat',
    distance: '900m',
    type: 'city_walk'
  },
  {
    name: 'Een ander bos',
    distance: '1.2km',
    type: 'forest'
  },
  {
    name: 'Wow, nog een bos',
    distance: '1.5km',
    type: 'forest'
  },
  {
    name: 'Deens park',
    distance: '1.7km',
    type: 'park'
  },
  {
    name: 'Een super cool strand',
    distance: '2.4km',
    type: 'beach'
  },
  {
    name: 'Park Pannenkoek',
    distance: '4km',
    type: 'park'
  },
  {
    name: 'Een strand',
    distance: '4.6km',
    type: 'beach'
  },
  {
    name: 'Bazinga meer',
    distance: '6.3km',
    type: 'lake'
  }
];

//Stores the liked and disliked doggos. This would eventualy be moved to the database.
let likedDoggos = [];
let dislikedDoggos = [];
//Stores the current doggo displayed on the screen.
let currentDoggo;

//Test function for connecting with the database.
async function connectDB() {
  try {
    await client.connect();
    await listDatabases(client);
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
}

connectDB().catch(console.error);

//Test function that lists all the connceted databases.
async function listDatabases(client) {
  const databasesList = await client.db().admin().listDatabases();
  databasesList.databases.forEach(db => {
    console.log(db.name);
  });
}

//Function that returns a doge profile based on a gived profileId.
function getDogeProfile(id) {
  console.log(`Doge profile id: ${id}`);
  return doggos[id - 1];
}

//Function that finds the next doggo that has not yet been liked or disliked.
function nextNotLikedOrDislikedDoge() {
  for (let i = 0; i < doggos.length; i++) {
    if (
      !likedDoggos.includes(doggos[i]) &&
      !dislikedDoggos.includes(doggos[i])
    ) {
      return doggos[i];
    }
  }
  return null;
}

app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: true }));

//Reders the homepage.
app.get('/', (req, res) => {
  currentDoggo = nextNotLikedOrDislikedDoge();
  res.render('home', {
    doge: currentDoggo,
    location: locations[0]
  });
});

//Reders the profile page based on the profileId in the url.
app.get('/profile/:profileId', (req, res) => {
  res.render('profile', {
    doge: getDogeProfile(req.params.profileId),
    location: locations[0]
  });
});

//Reder the search page.
app.get('/search', (req, res) => {
  //Reset the liked and disliked arrays. Otherwise you cannot repeat the feature without restarting the server.
  likedDoggos = [];
  dislikedDoggos = [];
  res.render('search', { locations: locations });
});

//Render the liked doggos page.
app.get('/liked', (req, res) => {
  console.log(likedDoggos);
  res.render('liked', { likedDoges: likedDoggos });
});

//Render the home page after searching for some doggos. This would eventualy be based on the search criteria.
app.post('/search-result', (req, res) => {
  currentDoggo = nextNotLikedOrDislikedDoge();
  res.render('home', {
    doge: currentDoggo,
    location: locations[0]
  });
});

//Add the current doggo to the like or dislike array based on the user input. Render the next doggo that has not been liked or disliked.
app.post('/like', (req, res) => {
  if (req.body.cute || req.body.cool || req.body.pretty) {
    likedDoggos.push(currentDoggo);
  } else {
    dislikedDoggos.push(currentDoggo);
  }
  currentDoggo = nextNotLikedOrDislikedDoge();
  res.render('home', {
    doge: currentDoggo,
    location: locations[0]
  });
});

app.use(express.static('static'));

//Render the 404 error page when a invalid url has been provided.
app.use((req, res) => {
  res.status(404).send('Error 404');
});

if (port == null || port == '') {
  port = 4200;
}

app.listen(port, () => {
  console.log(`Listening at https://localhost:${port}`);
});
