const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../models');

// GET all tournaments
router.get('/', async (req, res) => {
  try {
    const tournaments = await db.Tournament.findAll({
      include: [
        {
          model: db.User,
          as: 'organizer',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: db.TournamentParticipant,
          as: 'participants',
          attributes: ['id', 'user_id'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// GET single tournament
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await db.Tournament.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'organizer',
          attributes: ['id', 'username', 'email'],
        },
        {
          model: db.TournamentParticipant,
          as: 'participants',
          include: [
            {
              model: db.User,
              attributes: ['id', 'username', 'email'],
            },
          ],
        },
      ],
    });

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

// POST create tournament
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, game, max_participants, prize_pool, registration_deadline, start_date } = req.body;

    if (!name || !description || !game) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const tournament = await db.Tournament.create({
      name,
      description,
      game,
      max_participants: max_participants || 16,
      prize_pool: prize_pool || 0,
      registration_deadline,
      start_date,
      organizer_id: req.user.id,
    });

    const result = await db.Tournament.findByPk(tournament.id, {
      include: [
        {
          model: db.User,
          as: 'organizer',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

// PUT update tournament
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, game, max_participants, prize_pool, status, registration_deadline, start_date } = req.body;

    const tournament = await db.Tournament.findByPk(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if user is organizer
    if (tournament.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this tournament' });
    }

    await tournament.update({
      name: name || tournament.name,
      description: description || tournament.description,
      game: game || tournament.game,
      max_participants: max_participants || tournament.max_participants,
      prize_pool: prize_pool !== undefined ? prize_pool : tournament.prize_pool,
      status: status || tournament.status,
      registration_deadline: registration_deadline || tournament.registration_deadline,
      start_date: start_date || tournament.start_date,
    });

    const result = await db.Tournament.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'organizer',
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: 'Failed to update tournament' });
  }
});

// DELETE tournament
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = await db.Tournament.findByPk(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if user is organizer
    if (tournament.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this tournament' });
    }

    await tournament.destroy();

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

// GET tournament participants
router.get('/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;

    const participants = await db.TournamentParticipant.findAll({
      where: { tournament_id: id },
      include: [
        {
          model: db.User,
          attributes: ['id', 'username', 'email'],
        },
      ],
    });

    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// POST register for tournament
router.post('/:id/register', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const tournament = await db.Tournament.findByPk(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Check if already registered
    const existing = await db.TournamentParticipant.findOne({
      where: { tournament_id: id, user_id: userId },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already registered for this tournament' });
    }

    // Check if tournament is full
    const participantCount = await db.TournamentParticipant.count({
      where: { tournament_id: id },
    });

    if (participantCount >= tournament.max_participants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    const participant = await db.TournamentParticipant.create({
      tournament_id: id,
      user_id: userId,
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({ error: 'Failed to register for tournament' });
  }
});

// DELETE unregister from tournament
router.delete('/:id/register', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await db.TournamentParticipant.findOne({
      where: { tournament_id: id, user_id: userId },
    });

    if (!participant) {
      return res.status(404).json({ error: 'Not registered for this tournament' });
    }

    await participant.destroy();

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    console.error('Error unregistering from tournament:', error);
    res.status(500).json({ error: 'Failed to unregister from tournament' });
  }
});

module.exports = router;
