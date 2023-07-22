const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const getToken = require('../middleware/getToken');
const { checkRole } = require('../middleware/authorize');
const { getAllActions } = require('../api/actionsAPI');

router.get('/', auth, getToken, checkRole, getAllActions);

module.exports = router;