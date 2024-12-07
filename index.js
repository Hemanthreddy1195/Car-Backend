const http = require('http');
const mongoose = require('mongoose');
const url = require('url');



// MongoDB connection
mongoose.connect('mongodb+srv://hemanth372reddy:Zm4KV20j7ZNwRg6n@cluster1.plc5q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1', {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

const carSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true, // Ensure the car name is mandatory
      trim: true, // Remove whitespace
    },
    modelYear: {
      type: Number,
      required: true, // Ensure model year is mandatory
      min: 1886, // The year the first car was made
    },
    mileage: {
      type: Number,
      required: true,
      min: 0, // Mileage should not be negative
    },
    previousOwnerName: {
      type: String,
      default: 'First Owner', // Default value for first-owner cars
      trim: true,
    },
    rentPerMonth: {
      type: Number,
      required: true,
      min: 0, // Rent cannot be negative
    },
    priceToBuy: {
      type: Number,
      required: true,
      min: 0, // Price cannot be negative
    },
    estimatedInsurance: {
      type: Number,
      required: true,
      min: 0, // Insurance cannot be negative
    },
    anybodyRemarks: {
      type: String,
      trim: true,
      maxlength: 500, // Limit the remarks to 500 characters
    },
  }, {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  });
  
  // Export the schema as a model
  const Car = mongoose.model('Car', carSchema);
  const cars = [
    { name: 'Accord', modelYear: 2020, mileage: 30000, previousOwnerName: 'John Doe', rentPerMonth: 500, priceToBuy: 25000, estimatedInsurance: 1200, anybodyRemarks: 'Well maintained, minor scratches.' },
    { name: 'HondaCRV', modelYear: 2019, mileage: 45000, previousOwnerName: 'Jane Smith', rentPerMonth: 550, priceToBuy: 23000, estimatedInsurance: 1100, anybodyRemarks: 'Comfortable ride, good condition.' },
    { name: 'HYHybrid', modelYear: 2022, mileage: 15000, previousOwnerName: 'Alice Johnson', rentPerMonth: 600, priceToBuy: 28000, estimatedInsurance: 1300, anybodyRemarks: 'Hybrid model, fuel-efficient.' },
    { name: 'HYTucson', modelYear: 2021, mileage: 25000, previousOwnerName: 'Mark Brown', rentPerMonth: 530, priceToBuy: 26000, estimatedInsurance: 1250, anybodyRemarks: 'Spacious SUV, smooth drive.' },
    { name: 'FordFocus', modelYear: 2018, mileage: 60000, previousOwnerName: 'David Lee', rentPerMonth: 450, priceToBuy: 15000, estimatedInsurance: 1000, anybodyRemarks: 'Reliable, some wear and tear.' },
    { name: 'ToyataAygo', modelYear: 2017, mileage: 70000, previousOwnerName: 'Linda Green', rentPerMonth: 400, priceToBuy: 12000, estimatedInsurance: 950, anybodyRemarks: 'Small city car, fuel-efficient.' },
    { name: 'VKJetta', modelYear: 2020, mileage: 20000, previousOwnerName: 'Chris White', rentPerMonth: 550, priceToBuy: 27000, estimatedInsurance: 1150, anybodyRemarks: 'Sporty, low mileage.' },
    { name: 'VKTaigo', modelYear: 2022, mileage: 10000, previousOwnerName: 'Rachel Black', rentPerMonth: 580, priceToBuy: 30000, estimatedInsurance: 1350, anybodyRemarks: 'New model, pristine condition.' }
  ];
  
  // Function to insert cars into the database
  async function insertCars() {
    try {
      const existingCars = await Car.countDocuments(); // Check if cars are already in the database
      if (existingCars === 0) {
        await Car.insertMany(cars); // Insert the random cars if the collection is empty
        console.log('Cars inserted into the database!');
      } else {
        console.log('Cars already exist in the database!');
      }
    } catch (err) {
      console.error('Error inserting cars:', err);
    }
  }
  
  // Call insertCars function when the server starts
  insertCars();

  // Create server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;

  // Handle CORS preflight requests
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

// Get car details by name
if (method === 'GET' && parsedUrl.pathname.startsWith('/api/cars/')) {
  const carName = parsedUrl.pathname.split('/').pop();

  try {
    const car = await Car.findOne({ name: carName });
    console.log(car);

    if (car) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(car));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Car not found' }));
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: err.message }));
  }

  return;
}

// Default route
res.writeHead(404, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ message: 'Route not found' }));
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));