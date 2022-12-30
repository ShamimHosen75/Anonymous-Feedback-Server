const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();
const jwt = require('jsonwebtoken');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB url
const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_PASS}@cluster0.dpww6y9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   console.log('Anonymous Feedback Connected!')
//   // perform actions on the collection object
//   client.close();
// });

async function run(){
  try{
    await client.connect();
    const feedbackCollection = client.db('anonymous-feedback').collection('reviews');

    app.get('/reviews', async(req, res) =>{
      const query = {};
      const cursor = feedbackCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
      
    })

    // get all reveiws
    app.get("/reveiws", async (req, res) => {
      const result = await reveiwCollection.find().toArray();
      res.send(result);
  })

  // add reveiws
  app.post("/reveiws", async (req, res) => {
      const newReveiws = req.body;
      const result = await reveiwCollection.insertOne(newReveiws);
      res.send({ success: true, result });
  })

  }finally{}
}
run().catch(console.dir);


// Verify JWT Token
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send({ "Unauthorized": "access" })
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
          return res.status(403).send({ "Unauthorized": "Forbidden access" })
      }
      req.decoded = decoded;
      next();
  });
}



app.get('/', (req, res) => {
  res.send('Running Anonymous Server!');
});

app.listen(port, () =>{
  console.log('Listing to port', port);
});