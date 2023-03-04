const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.em3ukih.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
 useNewUrlParser: true,
 useUnifiedTopology: true,
 serverApi: ServerApiVersion.v1,
});

// Verify JWT Token
function verifyJWT(req, res, next) {
 const authHeader = req.headers.authorization;
 if (!authHeader) {
  return res.status(401).send({ Unauthorized: "access" });
 }
 const token = authHeader.split(" ")[1];
 jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
  if (err) {
   return res.status(403).send({ Unauthorized: "Forbidden access" });
  }
  req.decoded = decoded;
  next();
 });
}

async function run() {
 try {
  await client.connect();
  const feedbackCollection = client.db("feedback").collection("reviews");
  const userCollection = client.db("feedback").collection("user");


  app.get("/", (req, res) => {
    res.send("Running Anonymous Server!!!");
   });
   
   app.listen(port, () => {
    console.log("Listing to port", port);
   });


  // user review
  app.get("/reviews", async (req, res) => {
   // console.log(feedbackCollection);
   const query = {};
   const cursor = feedbackCollection.find(query);
   // console.log(cursor);
   const result = await cursor.toArray();
   console.log(result);
   res.send(result);
  });

  // add reviews
  app.post("/reviews", async (req, res) => {
   const newReviews = req.body;
   const result = await feedbackCollection.insertOne(newReviews);
   res.send({ success: true, result });
  });

  // get all user
  app.get("/user", verifyJWT, async (req, res) => {
   const result = await userCollection.find().toArray();
   res.send(result);
  });

  // get single user
  app.get("/user", verifyJWT, async (req, res) => {
   const email = req.query.email;
   const query = { email: email };
   const result = await userCollection.findOne(query);
   res.send(result);
  });

  // user update
  app.put("/user/:email", async (req, res) => {
   const email = req.params.email;
   const user = req.body;
   const filter = { email: email };
   const options = { upsert: true };
   const updateDoc = {
    $set: user,
   };
   const result = await userCollection.updateOne(filter, updateDoc, options);
   const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
   });
   res.send({ result, token });
  });

  // Make admin
  app.get("/admin/:email", async (req, res) => {
   const email = req.params.email;
   const user = await userCollection.findOne({ email: email });
   const isAdmin = user.role === "admin";
   res.send({ admin: isAdmin });
  });

  app.put("/user/admin/:email", verifyJWT, async (req, res) => {
   const email = req.params.email;
   const requester = req.decoded.email;
   const requesterAccount = await userCollection.findOne({ email: requester });
   if (requesterAccount.role === "admin") {
    const filter = { email: email };
    const updateDoc = {
     $set: { role: "admin" },
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
   } else {
    res.status(403).send({ message: "forbidden" });
   }
  });

  // user update
  app.put("/userUpdate", async (req, res) => {
   const email = req.query.email;
   const updateUser = req.body;
   const filter = { email: email };
   const options = { upsert: true };
   const updateDoc = {
    $set: updateUser,
   };
   const result = await userCollection.updateOne(filter, updateDoc, options);
   res.send({ success: true, result });
  });


  // user delete
  app.delete("/user/:id", async (req, res) => {
   const id = req.params.id;
   const query = { _id: ObjectId(id) };
   const deleteUser = await userCollection.deleteOne(query);
   res.send(deleteUser);
  });
 } finally {
 }
}
run().catch(console.dir);


