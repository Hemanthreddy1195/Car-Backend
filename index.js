const http = require('http');
const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL
const url = 'mongodb+srv://hemanth372reddy:zWsVVPfb9Mal67dI@cluster1.plc5q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';  // Replace with your MongoDB URL
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
        } else {
          res.writeHead(200);
          res.end(data);
        }
      });
    } else if (req.url === '/api') {
      // Fetch car data from MongoDB
      const client = new MongoClient(url);
      await client.connect();
      const db = client.db(dbName);
      const collection = db.collection('cars');
      
      const cars = await collection.find({}).toArray();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cars));
      client.close();
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
    console.error(err);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
