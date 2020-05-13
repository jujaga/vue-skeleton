module.exports = {
  UpdatedAt: Model => {
    return class extends Model {
      $beforeUpdate(queryContext) {
        super.$beforeUpdate(queryContext);
        this.updatedAt = new Date();
      }
    };
  }
};
