const uuid = require('uuid').v4;

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuid(),
      primaryKey: true,
    },
    users: {
      // лучше хранить в JSONB
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
  });

  return Group;
};