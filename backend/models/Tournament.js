const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tournament = sequelize.define('Tournament', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    game: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    max_participants: {
      type: DataTypes.INTEGER,
      defaultValue: 16,
      validate: {
        min: 2,
      },
    },
    prize_pool: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('registration', 'active', 'completed', 'cancelled'),
      defaultValue: 'registration',
    },
    registration_deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    organizer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'tournaments',
    timestamps: true,
    underscored: true,
  });

  Tournament.associate = (models) => {
    Tournament.belongsTo(models.User, {
      foreignKey: 'organizer_id',
      as: 'organizer',
    });
    Tournament.hasMany(models.TournamentParticipant, {
      foreignKey: 'tournament_id',
      as: 'participants',
    });
  };

  return Tournament;
};
