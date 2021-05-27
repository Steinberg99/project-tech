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
  try {
    //Retrieve the user data.
    let user = await database
      .collection('users')
      .findOne({ name: 'Stein Bergervoet' });

    //Retrieve the doggos array based on the last query the user submitted.
    let query = {};
    if (Object.keys(user.last_query).length !== 0) {
      query = createQuery(
        user.last_query.age,
        user.last_query.doge_vibes,
        user.last_query.locations
      );
    }
    doggos = await database.collection('doggos').find(query, {}).toArray();
    doggos = await removeLikedOrDislikedDoggos();

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
  } catch (error) {
    console.log(error);
  }
});

//Render the search page.
app.get('/search', async (req, res) => {
  try {
    locations = await database.collection('locations').find({}, {}).toArray();
    res.render('search', { locations: locations });
  } catch (error) {
    console.log(error);
  }
});

//Render the homepage after the search form has been submitted.
app.post('/search-result', async (req, res) => {
  try {
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
  } catch (error) {
    console.log(error);
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
  try {
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
    return filteredDoggos;
  } catch (error) {
    console.log(error);
  }
}

//Render the profile page.
app.get('/profile/:profileId', async (req, res) => {
  try {
    //Retrieve the doggo profile.
    let doggoProfile = await getDoggoProfile(
      parseInt(req.params.profileId, 10)
    );
    let location = await getLocation(doggoProfile.location_id);
    res.render('profile', {
      doge: doggoProfile,
      location: location
    });
  } catch (error) {
    console.log(error);
  }
});

async function getDoggoProfile(id) {
  try {
    return (profile = await database.collection('doggos').findOne({ id: id }));
  } catch (error) {
    console.log(error);
  }
}

async function getLocation(id) {
  try {
    return (location = await database
      .collection('locations')
      .findOne({ id: id }));
  } catch (error) {
    console.log(error);
  }
}

//Render the liked doggos page.
app.get('/liked', async (req, res) => {
  try {
    let likedDoggos = await getLikedDoggos();
    res.render('liked', { likedDoges: likedDoggos });
  } catch (error) {
    console.log(error);
  }
});

async function getLikedDoggos() {
  try {
    let user = await database
      .collection('users')
      .findOne({ name: 'Stein Bergervoet' });

    let likedDoggos = await database
      .collection('doggos')
      .find({ id: { $in: user.liked_doggos } }, {})
      .toArray();

    return likedDoggos;
  } catch (error) {
    console.log(error);
  }
}

//Render the home page after the user had liked or disliked a doggo.
app.post('/like', async (req, res) => {
  try {
    //Storte the current doggo id in the liked or disliked arrays in the database.
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

    //Render the next doggo on the homepage.
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
  } catch (error) {
    console.log(error);
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
