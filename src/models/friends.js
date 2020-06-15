const mongoose = require("mongoose");

const FriendsSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  friendsList: [
    {
      friend: {
        type: mongoose.Schema.Types.ObjectId
      }
    }
  ]
});

const Friends = mongoose.model("Friends", FriendsSchema);

module.exports = Friends;
