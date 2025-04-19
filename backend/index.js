const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());

// 1) Ensure uploads folder exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
// 2) Serve uploaded images statically
app.use("/uploads", express.static(UPLOADS_DIR));

// 3) Multer setup
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    // keep original ext
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});
const upload = multer({ storage });

const DATA_FILE = path.join(__dirname, "hotels.json");
// Auto‑create hotels.json if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

// Helpers
function loadHotels() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function saveHotels(hotels) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(hotels, null, 2));
}

// GET all hotels
app.get("/api/hotels", (req, res) => {
  try {
    res.json(loadHotels());
  } catch {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// inside your upload.single('image') route:
app.post("/api/hotels", upload.single("image"), (req, res) => {
  const { hotelName, description, province, town, email, tp, password } =
    req.body;

  // validate
  if (
    !hotelName ||
    !description ||
    !province ||
    !town ||
    !email ||
    !tp ||
    !password ||
    !req.file
  ) {
    return res.status(400).json({
      error: "Missing required hotel data or image",
    });
  }

  const hotels = loadHotels();
  const newHotel = {
    hotelId: uuidv4(),
    hotelName,
    description,
    location: { province, town },
    email,
    tp,
    // WARNING: storing plaintext passwords is insecure! this is just for demo.
    password,
    packages: [],
    halls: [],
    imageUrl: `/uploads/${req.file.filename}`,
    createdAt: new Date().toISOString(),
  };

  hotels.push(newHotel);
  saveHotels(hotels);
  res.status(201).json(newHotel);
});

// New: Hotel‑user login by email/password
app.post("/api/hotels/login", express.json(), (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const hotels = loadHotels();
  const hotel = hotels.find(
    (h) => h.email === email && h.password === password
  );
  if (!hotel) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  // success → send back hotelId (and anything else you might need)
  res.json({ hotelId: hotel.hotelId });
});

// GET a single hotel by hotelId
app.get("/api/hotels/:hotelId", (req, res) => {
  try {
    const hotels = loadHotels();
    const hotel = hotels.find((h) => h.hotelId === req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: "Failed to read data" });
  }
});

// near the top, after your existing multer/storage setup:
const hallUpload = upload.single('image'); // reuse multer instance

// GET all halls for a given hotel
app.get('/api/hotels/:hotelId/halls', (req, res) => {
  try {
    const hotels = loadHotels();
    const hotel = hotels.find(h => h.hotelId === req.params.hotelId);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json(hotel.halls || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// POST a new hall under a given hotel
app.post(
  '/api/hotels/:hotelId/halls',
  hallUpload,
  (req, res) => {
    const { hallName, description, price } = req.body;
    if (!hallName || !description || !price || !req.file) {
      return res.status(400).json({ error: 'Missing hall fields or image' });
    }

    const hotels = loadHotels();
    const hotel = hotels.find(h => h.hotelId === req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const newHall = {
      hallid:      uuidv4(),
      hallName,
      description,
      price:       parseFloat(price),
      imageUrl:    `/uploads/${req.file.filename}`
    };

    hotel.halls = hotel.halls || [];
    hotel.halls.push(newHall);
    saveHotels(hotels);

    res.status(201).json(newHall);
  }
);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`)
);
