const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5300;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dwb4q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //Collections

    const usersCollection = client.db("CareLoomDB").collection("users");
    const careGiverRequestCollection = client
      .db("CareLoomDB")
      .collection("careGiverRequest");
    const careRequestCollection = client
      .db("CareLoomDB")
      .collection("careRequest");

    //Users Related API's

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "Users already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    //user post for care

    //Collectuser

    app.get("/collectUser/:email", async (req, res) => {
      const email = req.params.email;
      //   console.log(email);
      const query = { email: email };
      //   console.log(query);

      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    //request for care

    app.post("/requestForCare", async (req, res) => {
      const request = req.body;
      const result = await careRequestCollection.insertOne(request);
      res.send(result);
    });

    app.get('/requestForCare', async (req, res) => {
        const email = req.query.email;
        // console.log(email)
        const query = {careGiverEmail: email}
        const result = await careRequestCollection.find(query).toArray()
        res.send(result)
    })


    //my request api
    app.get('/myCareRequest/:email', async (req,res) => {
        const email = await req.params.email;
        console.log(req.params)
        const query = {userEmail : email}
        const result = await careRequestCollection.find(query).toArray()
        res.send(result)
    })

    //Admin Related API's

    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin })
    });

    // verify or reject caregiver
    const { ObjectId } = require("mongodb");
    app.patch("/allCareGiverApplyReq/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body; // Get the status from the request body
      const filter = { _id: new ObjectId(id) }; // Create filter with ObjectId
      const updatedDoc = {
        $set: {
          status: status, // Update the status based on the request body
        },
      };
      const result = await careGiverRequestCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });

    //Delete Request
    // DELETE caregiver request by ID
    app.delete("/allCareGiverApplyReq/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }; // Create filter using the request ID

      try {
        const result = await careGiverRequestCollection.deleteOne(filter); // Delete the document
        res.send(result); // Send the result back to the client
      } catch (error) {
        console.error("Failed to delete caregiver request:", error);
        res.status(500).send({ message: "Failed to delete caregiver request" });
      }
    });

    //CareGiver Related API's

    //apply as caregiver

    app.post("/careGiverRequest", async (req, res) => {
      const applyRequest = req.body;
      const result = await careGiverRequestCollection.insertOne(applyRequest);
      res.send(result);
    });

    app.get("/verifiedCareGiver/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { careGiverEmail: email };
      const result = await careGiverRequestCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    //careGiver request data on admin side
    app.get("/allCareGiverApplyReq", async (req, res) => {
      const result = await careGiverRequestCollection.find().toArray();
      res.send(result);
    });

    //
    app.get("/collectCare/:care", async (req, res) => {
      const care = await req.params.care;
      // console.log(care)
      const query = { expertise: care };
      console.log(care);
      const result = await careGiverRequestCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/acceptedCareClient/:id", async (req, res) => {
        const id = req.params.id;
        const { careStatus } = req.body; // Get the status from the request body
        const filter = { _id: new ObjectId(id) }; // Create filter with ObjectId
        const updatedDoc = {
          $set: {
            careStatus: careStatus, // Update the status based on the request body
          },
        };
        const result = await careRequestCollection.updateOne(
          filter,
          updatedDoc
        );
        res.send(result);
      });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Care Loom Server is Ongoing");
});
app.listen(port, () => {
  console.log(`Server is running on port${port}`);
});
