const http = require('http');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB connection URL (Replace with your MongoDB Atlas URL)
const url = 'mongodb+srv://hemanth372reddy:t2G8r8rlwTde0Ih7@cluster1.plc5q.mongodb.net/?retryWrites=true&w=majority';  
const dbName = 'portfolio';  // Replace with your DB name

// Create HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Serve static files
    if (req.url === '/') {
      const filePath = path.join(__dirname, 'public', 'index.html');
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading index.html');
          console.error("Error reading index.html:", err);  // Log error to the console
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else if (req.url === '/index.css') {
      const filePath = path.join(__dirname, 'public', 'index.css');
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading index.css');
          console.error("Error reading index.css:", err);  // Log error to the console
        } else {
          res.writeHead(200, { 'Content-Type': 'text/css' });
          res.end(data);
        }
      });
    } else if (req.url.startsWith('/assets/')) {
      const filePath = path.join(__dirname, 'public', req.url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File not found');
          console.error("Error reading asset file:", err);  // Log error to the console
        } else {
          res.writeHead(200);
          res.end(data);
        }
      });
    } else if (req.url === '/api') {
      // Handle MongoDB connection and fetch data
      const client = new MongoClient(url);

      console.log("Attempting to connect to MongoDB...");

      try {
        // Attempt to connect to MongoDB
        await client.connect();
        console.log("Successfully connected to MongoDB!");

        // Access the database and collection
        const db = client.db(dbName);
        const collection = db.collection('car');
        
        // Fetch all car data from the collection
        const cars = await collection.find({}).toArray();
        
        // Send the car data as a JSON response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cars));

        // Close the connection after the data is fetched
        client.close();
      } catch (err) {
        console.error("Failed to connect to MongoDB:", err);  // Log detailed MongoDB connection error
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to connect to MongoDB database. Please check your connection settings.');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
    console.error("Server error:", err);  // Log any server-related errors
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
