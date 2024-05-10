//const morgan = require('morgan');
//const logger = require('./logger');
// Import des modules
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');



// Configuration de la connexion à la base de données MySQL
const connection = mysql.createPool({
  namedPlaceholders: true,
  host: 'localhost',
   user: 'root',
    password: '00242c4',
    database: 'user_db',
});

// Création de l'application Express
const app = express();
const PORT = 3030;

// Configuration de body-parser pour analyser les corps de requêtes JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Utilisation de Morgan pour enregistrer les requêtes HTTP dans les logs
//app.use(morgan('combined', { stream: logger.stream }));

// Route pour récupérer tous les utilisateurs
app.get('/users', async (req, res) => {
  try {
    const [rows, fields] = await connection.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});


app.post('/users', async (req, res) => {
  try {
    const { username, email } = req.body;

    // Vérifier si req.body est vide
    if (!username || !email) {
      //logger.warning('Données de la requête POST incomplètes');
      console.log('Données de la requête POST incomplètes')
      return res.status(400).send({ error: 'Username and email are required' });
    }

    //logger.info(`Données de la requête POST : ${JSON.stringify(req.body)}`);
    console.log('Données de la requête POST : ${JSON.stringify(req.body)}')

    // Insérer l'utilisateur dans la base de données
    await connection.execute('INSERT INTO users (username, email) VALUES (?, ?)', [username, email]);

    res.status(201).send({ message: 'User added successfully' });
  } catch (error) {
    //logger.error(`Une erreur est survenue : ${error.message}`);
    //console.error('Error:', error);
    console.log('Erreur')
    res.status(500).send({ error: 'An error occurred while processing your request' });
  }
});


// Route pour mettre à jour un utilisateur existant
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  try {
    await connection.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, id]);
    res.send('Utilisateur mis à jour avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// Route pour supprimer un utilisateur existant
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await connection.query('DELETE FROM users WHERE id = ?', [id]);
    res.send('Utilisateur supprimé avec succès');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur serveur');
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
