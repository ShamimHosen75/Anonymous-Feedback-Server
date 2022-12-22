const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.dpww6y9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  console.log('Anonymous Feedback Connected!')
  // perform actions on the collection object
  client.close();
});



app.get('/', (req, res) => {
  res.send('Running Anonymous Server!');
});

app.listen(port, () =>{
  console.log('Listing to port', port);
});