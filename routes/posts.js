const express = require('express');
const { body } = require('express-validator');
const { list, getOne, create, update, remove, toggleLike } = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', list);
router.get('/:id', getOne);

router.post(
  '/',
  requireAuth,
  [
    body('title').isString().trim().isLength({ min: 3, max: 200 }),
    body('content').isString().isLength({ min: 10 }),
  ],
  create
);

router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);
router.post('/:id/like', requireAuth, toggleLike);

module.exports = router;
