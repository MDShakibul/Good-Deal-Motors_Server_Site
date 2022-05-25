const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port =process.env.Port || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhql6d1.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        await client.connect();
        const productsCollection = client.db('good_deal_motors').collection('products');
        const orderCollection = client.db('good_deal_motors').collection('orders');
        const reviewCollection = client.db('good_deal_motors').collection('reviews');
        //get all product
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
          });

        //get product by id
        app.get('/product/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productsCollection.findOne(query);
            res.send(product);
          })


           //save product
        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            const result = await orderCollection.insertOne(newProduct);
            res.send(result);
        })

        //my orders
        app.get('/order', async(req, res) =>{
            const email = req.query.user;
            console.log(email)
            const query = {email: email};
            console.log(query)
            const order = await orderCollection.find(query).toArray();
            res.send(order);
          })

          //save review
          app.post('/review', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result);
        })

        //Review
        app.get('/review', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
          });

    }
    finally{

    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Your port ${port}`)
})