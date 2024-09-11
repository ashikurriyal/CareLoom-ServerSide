const express = require('express');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5300;

app.use(express.json())
app.use(cors({
    origin: [
        'http://localhost:5173',
    ]
}));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dwb4q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //Collections

    const usersCollection = client.db('CareLoomDB').collection('users')
    


    //users
    // app.get('/users', async (req, res) => {
    //     const result = await usersCollection.find().toArray()
    //     res.send(result)
    // })

    app.post('/user', async (req,res) => {
        const assignment = req.body;
        // console.log(assignment)
        const result = await usersCollection.insertOne(assignment)
        res.send(result)
    })

    //admin role
    app.patch('/users/:id', async (req, res) => {
        const id = req.params.id
        const filter = { _id: new ObjectId(id) }
        const updatedDoc = {
            $set: {
                role: 'admin'
            }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc)
        res.send(result)
    })




  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req,res) => {
    res.send('Care Loom Server is Ongoing')
})
app.listen(port, () => {
    console.log(`Server is running on port${port}`);
})
