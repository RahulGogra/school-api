const db = require('../config/db.js');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
    
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

exports.addSchool = async (req, res) => {
  console.log('📦 Incoming request:', req.body);

  const {id, name, address, latitude, longitude } = req.body;

  if (!id || !name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid input data.' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO schools (id, name, address, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [id, name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added.', schoolId: id });
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
};

exports.listSchools = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid coordinates.' });
  }

  try {

    const [schools] = await db.execute('SELECT * FROM schools');

    const sortedSchools = schools.map((school) => ({
      ...school,
      distance: haversineDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        school.latitude,
        school.longitude
      )
    })).sort((a, b) => a.distance - b.distance);

    res.json(sortedSchools);
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
};
