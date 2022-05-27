const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhql6d1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client
      .db("good_deal_motors")
      .collection("products");
    const orderCollection = client.db("good_deal_motors").collection("orders");
    const reviewCollection = client
      .db("good_deal_motors")
      .collection("reviews");
    const userCollection = client.db("good_deal_motors").collection("users");
    const profileCollection = client
      .db("good_deal_motors")
      .collection("profile");

    //make JWT token
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // JWT token verification
    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Access" });
      }
      const token = authHeader.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, decoded) {
          if (err) {
            return res.status(403).send({ message: "Forbidden Access" });
          }
          req.decoded = decoded;
          next();
        }
      );
    }
    //all user
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });

    //get all product
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    //get product by id
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    //save product
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await orderCollection.insertOne(newProduct);
      res.send(result);
    });

    //my orders
    app.get("/order", async (req, res) => {
      const email = req.query.user;
      const query = { email: email };
      const order = await orderCollection.find(query).toArray();
      res.send(order);
    });

    //save review
    app.post("/review", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });

    //Review
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //delete product by admin
    app.delete("/manageproduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //cancel product by admin
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // all users
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    // making admin
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    // route admin and user
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    //add product
    app.post("/manage_product", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    //add my profile
    app.post("/myprofile", async (req, res) => {
      const newProduct = req.body;
      const result = await profileCollection.insertOne(newProduct);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Your port ${port}`);
});
