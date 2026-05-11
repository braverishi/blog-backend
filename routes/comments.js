const express = require('express');
const { listForPost, create, remove } = require('../controllers/commentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/post/:postId', listForPost);
router.post('/post/:postId', requireAuth, create);
router.delete('/:id', requireAuth, remove);

module.exports = router;
