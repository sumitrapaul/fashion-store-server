const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldrxrdq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("productDB").collection("products");
    const cartCollection = client.db("productDB").collection("addCart");
    const reviewCollection = client.db("productDB").collection("reviews");
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      // console.log(newProduct)

      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //database thk update er jonno data load
    app.get("/products/:id", async (req, res) => {
      const brand_name = req.params.id;
      const query = { brand_name: brand_name };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/productDetails/:id", async (req, res) => {
      const productId = req.params.id;
      // console.log(productId)
      const query = { _id: new ObjectId(productId) };
      // console.log(query)
      const product = await productCollection.findOne(query);
      // console.log(product)
      res.send(product);
    });

    //database thk update er jonno
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedData = req.body;
      const product = {
        $set: updatedData,
      };

      const result = await productCollection.updateOne(
        filter,
        product,
        options
      );

      if (result.modifiedCount > 0) {
        res.send(result);
      }
    });

    app.post("/carts", async (req, res) => {
      const cartItems = req.body;

      const result = await cartCollection.insertOne(cartItems);
      // console.log(result);
      res.send(result);
    });

    app.get("/carts", async (req, res) => {
      let query = {};

      if (req.query?.email) {
        query = { email: req.query?.email };
      }

      const result = await cartCollection.find(query).toArray();
      // console.log(result);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;

      const result = await reviewCollection.insertOne(review);

      res.json(result)
    });


    // app.get("/reviews", async (req, res) => {
    //   let query = {};

    //   if (req.query?.email) {
    //     query = { email: req.query?.email };
    //   }

    //   const result = await reviewCollection.find(query).toArray();
    //   console.log(result);
    //   res.send(result);
    // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Shop is running on server");
});

app.listen(port, (req, res) => {
  console.log(`Shop server is running on port : ${port}`);
});
