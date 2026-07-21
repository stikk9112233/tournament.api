const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TournamentParticipant = sequelize.define('TournamentParticipant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tournament_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('registered', 'active', 'eliminated', 'winner'),
      defaultValue: 'registered',
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
    tableName: 'tournament_participants',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['tournament_id', 'user_id'],
      },
    ],
  });

  TournamentParticipant.associate = (models) => {
    TournamentParticipant.belongsTo(models.Tournament, {
      foreignKey: 'tournament_id',
    });
    TournamentParticipant.belongsTo(models.User, {
      foreignKey: 'user_id',
    });
  };

  return TournamentParticipant;
};
