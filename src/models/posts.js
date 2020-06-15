const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  postText: {
    type: String,
    required: true
  },
  comments: [
    {
      commentUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      commentBody: {
        type: String,
        required: true
      },
      commentLikes: [
        {
          user: mongoose.Schema.Types.ObjectId,
          likeValue: {
            type: Boolean,
            default: false
          }
        }
      ],
      replies: [
        {
          replyUser: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
          },
          replyText: {
            type: String,
            required: true
          },
          replyLikes: [
            {
              user: mongoose.Schema.Types.ObjectId,
              likeValue: {
                type: Boolean,
                default: false
              }
            }
          ]
        }
      ]
    }
  ],
  privacy: {
    type: String,

    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

const Posts = mongoose.model("Posts", PostSchema);
module.exports = Posts;
