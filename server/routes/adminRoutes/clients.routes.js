const express = require('express');
const router = express.Router();
const clientsController = require('../../controller/admin/clients.controller');

// GET ALL CLIENTS (with search, filter, pagination)
router.get('/', clientsController.getAllClients);

// GET CLIENTS STATS
router.get('/stats', clientsController.getClientsStats);

// GET SINGLE CLIENT
router.get('/:id', clientsController.getSingleClient);

// DELETE CLIENT
router.delete('/:id', clientsController.deleteClient);

module.exports = router;
