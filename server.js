const { parse } = require('dotenv');
const { query } = require('express');
const express = require('express');
const dotenv = require('dotenv').config();
const { MongoClient } = require('mongodb');
const app = express();
let database = null;
let port = process.env.PORT;

let doggos = null;
let locations = null;
let currentDoggo = null;

app.set('view engine', 'pug');

app.use(express.urlencoded({ extended: true }));

//Render the homepage.
app.get('/', async (req, res) => {
  //Retrieve the user data.
  let user = await database
    .collection('users')
    .findOne({ name: 'Stein Bergervoet' });

  //Retrieve the doggos array based on the last query the user submitted.
  let query = {};
  if (Object.keys(user.last_query).length !== 0) {
    console.log(user.last_query);
    query = createQuery(
      user.last_query.age,
      user.last_query.doge_vibes,
      user.last_query.locations
    );
  }
  doggos = await database.collection('doggos').find(query, {}).toArray();
  doggos = await removeLikedOrDislikedDoggos();

  currentDoggo = doggos[0];
  let location = await getLocation(currentDoggo.location_id);
  res.render('home', {
    doggo: currentDoggo,
    location: location
  });
});

//Render the search page.
app.get('/search', async (req, res) => {
  locations = await database.collection('locations').find({}, {}).toArray();
  res.render('search', { locations: locations });
});

//Render the homepage after the search form has been submitted.
app.post('/search-result', async (req, res) => {
  //Retrieve the doggos array based on the created query.
  let query = createQuery(
    req.body.age,
    req.body.doge_vibes,
    req.body.locations
  );
  doggos = await database.collection('doggos').find(query, {}).toArray();
  doggos = await removeLikedOrDislikedDoggos();

  //Store the query parameters for later use.
  await database
    .collection('users')
    .updateOne(
      { name: 'Stein Bergervoet' },
      { $set: { last_query: req.body } }
    );

  //Render the homepage based on the content of the doggos array.
  if (doggos[0]) {
    currentDoggo = doggos[0];
    let location = await getLocation(currentDoggo.location_id);
    res.render('home', {
      doggo: currentDoggo,
      location: location
    });
  } else {
    res.render('home', {
      doggo: undefined,
      location: undefined
    });
  }
});

function createQuery(age, dogeVibes, selectedLocations) {
  let selectedLocationIds = selectedLocations.map(location =>
    parseInt(location, 10)
  );
  return {
    age: { $gt: 0, $lt: parseInt(age, 10) },
    doge_vibe: { $in: dogeVibes },
    location_id: { $in: selectedLocationIds }
  };
}

async function removeLikedOrDislikedDoggos() {
  let user = await database
    .collection('users')
    .findOne({ name: 'Stein Bergervoet' });

  let filteredDoggos = [];
  for (let i = 0; i < doggos.length; i++) {
    if (
      !user.liked_doggos.includes(doggos[i].id) &&
      !user.disliked_doggos.includes(doggos[i].id)
    ) {
      filteredDoggos.push(doggos[i]);
    }
  }
  console.log(filteredDoggos);
  return filteredDoggos;
}

//Render the profile page.
app.get('/profile/:profileId', async (req, res) => {
  let doggoProfile = await getDoggoProfile(parseInt(req.params.profileId), 10);
  let location = await getLocation(doggoProfile.location_id);
  res.render('profile', {
    doge: doggoProfile,
    location: location
  });
});

async function getDoggoProfile(id) {
  return (profile = await database.collection('doggos').findOne({ id: id }));
}

async function getLocation(id) {
  return (location = await database
    .collection('locations')
    .findOne({ id: id }));
}

//Render the liked doggos page.
app.get('/liked', async (req, res) => {
  let likedDoggos = await getLikedDoggos();
  res.render('liked', { likedDoges: likedDoggos });
});

async function getLikedDoggos() {
  let user = await database
    .collection('users')
    .findOne({ name: 'Stein Bergervoet' });

  let likedDoggos = await database
    .collection('doggos')
    .find({ id: { $in: user.liked_doggos } }, {})
    .toArray();

  return likedDoggos;
}

//Render the home page after the user had liked or disliked a doggo.
app.post('/like', async (req, res) => {
  if (req.body.cute || req.body.cool || req.body.pretty) {
    database
      .collection('users')
      .updateOne(
        { name: 'Stein Bergervoet' },
        { $push: { liked_doggos: currentDoggo.id } }
      );
  } else {
    database
      .collection('users')
      .updateOne(
        { name: 'Stein Bergervoet' },
        { $push: { disliked_doggos: currentDoggo.id } }
      );
  }

  currentDoggo = getNextDoggo();
  if (currentDoggo != undefined) {
    let location = await getLocation(currentDoggo.location_id);
    res.render('home', {
      doggo: currentDoggo,
      location: location
    });
  } else {
    res.render('home', {
      doggo: undefined,
      location: undefined
    });
  }
});

function getNextDoggo() {
  for (let i = 0; i < doggos.length - 1; i++) {
    if (currentDoggo == doggos[i]) return doggos[i + 1];
  }
  return undefined;
}

app.use(express.static('static'));

//Render the 404 error page when a invalid url has been provided.
app.use((req, res) => {
  res.status(404).send('Error 404');
});

//Correct the value of the port when the app is running locally.
if (port == null || port == '') {
  port = 4200;
}

async function connectDB() {
  const client = new MongoClient(process.env.DB_URI, {
    retryWrites: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
  try {
    await client.connect();
    database = client.db(process.env.DB_NAME);
  } catch (error) {
    console.log(error);
  }
}

app.listen(port, () => {
  console.log(`Listening at https://localhost:${port}`);
  connectDB().then(() => {
    console.log('Connected to MongoDB');
  });
});
