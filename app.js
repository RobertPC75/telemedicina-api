const express = require('express');
const { Pool } = require('pg'); // Importa Pool de pg
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    connectionString: 'postgresql://plataforma_telemedicina_user:jVROaA57BpsEqIsxhBmLcdd0XyI01rPK@dpg-crmceha3esus73fqu7r0-a.oregon-postgres.render.com/plataforma_telemedicina',
    ssl: {
        rejectUnauthorized: false, // Permite conexiones no verificadas; usar con precaución
    },
});

// Ruta de ejemplo para obtener todos los médicos
app.get('/api/medicos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Medico;');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener médicos:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta para crear un nuevo médico
app.post('/api/medico', async (req, res) => {
    const { nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, especializacion } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO Medico (nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, especializacion)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;
        `, [nombre, apellido, cedula, telefono, direccion, fecha_nacimiento, especializacion]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al crear médico:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Endpoint para obtener todas las especializaciones únicas de los médicos
app.get('/api/especializaciones', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT especializacion FROM Medico WHERE especializacion IS NOT NULL;');
        const especializaciones = result.rows.map(row => row.especializacion);
        res.json(especializaciones);
    } catch (error) {
        console.error('Error al obtener especializaciones:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Endpoint para buscar un médico por su ID
app.get('/api/medico/:id', async (req, res) => {
    const id = parseInt(req.params.id); // Obtener el ID del parámetro de la URL

    if (isNaN(id)) {
        return res.status(400).send('El ID debe ser un número válido');
    }

    try {
        const result = await pool.query('SELECT * FROM Medico WHERE id_medico = $1;', [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Médico no encontrado');
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener médico por ID:', error);
        res.status(500).send('Error en el servidor');
    }
});

// Iniciar servidor en el puerto 5000
app.listen(5000, () => {
    console.log('API escuchando en el puerto 5000');
});
