const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all equipment
router.get('/equipments', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM equipment_catalog');
    res.json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET a specific equipment by ID
router.get('/equipments/:id', async (req, res) => {
  const { id } = req.params; // Extract the ID from the route parameters

  try {
    // Query to fetch the equipment with the specified ID
    const { rows } = await db.query(
      'SELECT * FROM equipment_catalog WHERE equipment_id = $1',
      [parseInt(id)]
    );

    if (rows.length === 0) {
      // If no equipment is found with the given ID, return a 404 Not Found response
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // If a equipment is found, return it in the response
    res.json(rows[0]);
  } catch (error) {
    // Log the error and return a 500 Internal Server Error response if an error occurs
    console.error('Error fetching equipment:', error);
    res.status(500).json({ message: 'Error fetching equipment' });
  }
});

// POST a equipment
router.post('/equipments', async (req, res) => {
  console.log(req.body);
  try {
    const { equipment_name } = req.body;
    console.log(
      'Executing query:',
      'INSERT INTO equipment_catalog (equipment_name) VALUES ($1) RETURNING *'
    );

    const { rows } = await db.query(
      'INSERT INTO equipment_catalog (equipment_name) VALUES ($1) RETURNING *',
      [equipment_name]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PUT a equipment

router.put('/equipments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { equipment_name, equipment_name_image_id } = req.body;

    // Construct the update part of the query based on provided fields
    const updateParts = [];
    const queryValues = [];
    let queryIndex = 1;

    if (equipment_name !== undefined) {
      updateParts.push(`equipment_name = $${queryIndex++}`);
      queryValues.push(equipment_name);
    }

    if (equipment_name_image_id !== undefined) {
      updateParts.push(`equipment_name_image_id = $${queryIndex++}`);
      queryValues.push(equipment_name_image_id);
    }

    queryValues.push(id); // For the WHERE condition

    if (updateParts.length === 0) {
      return res.status(400).send('No update fields provided.');
    }

    const queryString = `UPDATE equipment_catalog SET ${updateParts.join(
      ', '
    )} WHERE equipment_id = $${queryIndex} RETURNING *`;

    const { rows } = await db.query(queryString, queryValues);

    if (rows.length === 0) {
      return res.status(404).send('Equipment not found.');
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;