const http = require('http');
const mongoose = require('mongoose');
const url = require('url');
const fs = require('fs');
const path = require('path');

// MongoDB connection
mongoose.connect('mongodb+srv://hemanth372reddy:Zm4KV20j7ZNwRg6n@cluster1.plc5q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define the Car schema
const carSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  modelYear: { type: Number, required: true, min: 1886 },
  mileage: { type: Number, required: true, min: 0 },
  previousOwnerName: { type: String, default: 'First Owner', trim: true },
  rentPerMonth: { type: Number, required: true, min: 0 },
  priceToBuy: { type: Number, required: true, min: 0 },
  estimatedInsurance: { type: Number, required: true, min: 0 },
  anybodyRemarks: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true });

// Create the Car model
const Car = mongoose.model('Car', carSchema);

// Predefined car data
const cars = [
  { name: 'Accord', modelYear: 2020, mileage: 30000, previousOwnerName: 'John Doe', rentPerMonth: 500, priceToBuy: 25000, estimatedInsurance: 1200, anybodyRemarks: 'Well maintained, minor scratches.' },
  { name: 'HondaCRV', modelYear: 2019, mileage: 45000, previousOwnerName: 'Jane Smith', rentPerMonth: 550, priceToBuy: 23000, estimatedInsurance: 1100, anybodyRemarks: 'Comfortable ride, good condition.' },
];

// Function to insert cars into the database
async function insertCars() {
  try {
    const carCount = await Car.countDocuments();
    if (carCount === 0) {
      await Car.insertMany(cars);
      console.log('Car data inserted into the database.');
    } else {
      console.log('Car data already exists in the database.');
    }
  } catch (err) {
    console.error('Error while inserting car data:', err);
  }
}

// Populate the database on server start
insertCars();

// Define the folder containing your portfolio
const publicFolderPath = path.join(__dirname, 'src', 'public');

// Function to serve static files
const serveStaticFile = (filePath, res) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404: File Not Found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      let contentType = 'text/html'; // Default content type

      // Determine the content type
      switch (ext) {
        case '.html': contentType = 'text/html'; break;
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg':
        case '.jpeg': contentType = 'image/jpeg'; break;
        case '.gif': contentType = 'image/gif'; break;
        default: contentType = 'application/octet-stream'; break;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
};

// Create the HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  // Set headers to handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Route to fetch all car data
  if (method === 'GET' && parsedUrl.pathname === '/api') {
    try {
      const carList = await Car.find({});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(carList));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: err.message }));
    }
    return;
  }

  // Serve static files for the portfolio
  const requestedFilePath = path.join(publicFolderPath, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
  serveStaticFile(requestedFilePath, res);
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
