// server.js

const express = require("express");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const app = express();

// Middleware to parse URL-encoded and JSON bodies
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// Serve the main page
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "index.html"), (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

// Serve the profile picture with proper error handling
app.get("/profile-picture", function (req, res) {
  const imgPath = path.join(__dirname, "images/profile-1.jpg");

  fs.readFile(imgPath, (err, img) => {
    if (err) {
      console.error("Error reading profile picture:", err);
      return res.status(500).send("Error loading profile picture.");
    }

    res.writeHead(200, { "Content-Type": "image/jpg" });
    res.end(img, "binary");
  });
});

// Determine MongoDB URL based on environment
const mongoUrlLocal = process.env.DOCKER_ENV
  ? "mongodb://admin:password@mongodb:27017/my-db?authSource=admin"
  : "mongodb://admin:password@localhost:27017/my-db?authSource=admin";

// MongoDB client options
const mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// Database name
const databaseName = "my-db";

/**
 * POST /update-profile
 * Updates or inserts a user profile in the MongoDB database.
 */
app.post("/update-profile", function (req, res) {
  const userObj = req.body;
  userObj["userid"] = 1;

  MongoClient.connect(
    mongoUrlLocal,
    mongoClientOptions,
    function (err, client) {
      if (err) {
        console.error("MongoDB connection error (update-profile):", err);
        return res.status(500).send("Database connection failed.");
      }

      const db = client.db(databaseName);
      const myquery = { userid: 1 };
      const newvalues = { $set: userObj };

      db.collection("users").updateOne(
        myquery,
        newvalues,
        { upsert: true },
        function (updateErr, updateResult) {
          if (updateErr) {
            console.error("Error updating profile:", updateErr);
            client.close();
            return res.status(500).send("Failed to update profile.");
          }

          console.log("Profile updated successfully:", updateResult);
          client.close();
          res.status(200).send(userObj);
        }
      );
    }
  );
});

/**
 * GET /get-profile
 * Retrieves a user profile from the MongoDB database.
 */
app.get("/get-profile", function (req, res) {
  MongoClient.connect(
    mongoUrlLocal,
    mongoClientOptions,
    function (err, client) {
      if (err) {
        console.error("MongoDB connection error (get-profile):", err);
        return res.status(500).send("Database connection failed.");
      }

      const db = client.db(databaseName);
      const myquery = { userid: 1 };

      db.collection("users").findOne(myquery, function (findErr, result) {
        if (findErr) {
          console.error("Error fetching profile:", findErr);
          client.close();
          return res.status(500).send("Failed to retrieve profile.");
        }

        client.close();
        if (result) {
          console.log("Profile retrieved successfully:", result);
          res.status(200).json(result);
        } else {
          console.log("No profile found for userid 1.");
          res.status(404).send("Profile not found.");
        }
      });
    }
  );
});

// Handle 404 - Not Found
app.use((req, res, next) => {
  res.status(404).send("404: Page Not Found");
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send("Internal Server Error");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
});
