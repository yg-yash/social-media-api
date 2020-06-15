const express = require("express");
const router = express.Router();
const Posts = require("../models/posts");
const auth = require("../middleware/auth");

//create post
router.post("/post", auth, async (req, res) => {
  try {
    const post = new Posts({
      ...req.body,
      owner: req.user._id
    });

    await post.save();
    res.status(201).send("Post Created");
  } catch (error) {
    res.status(400).send(error);
  }
});

//show all posts

router.get("/posts/me", auth, async (req, res) => {
  try {
    const post = await Posts.find({ owner: req.user.id });

    res.status(200).send(post);
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
});

//update a post
router.patch("/post/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;

    const post = await Posts.findById({ _id });
    if (req.user._id.toString() !== post.owner.toString()) {
      return res.status(400).send("Not Authorized");
    }
    if (!post) {
      return res.status(404).send("No Post Found");
    }
    post.postText = req.body.text;
    await post.save();
    res.status(201).send("Post updated");
  } catch (error) {
    res.status(400).send("error in post update");
  }
});

//delete a post
router.delete("/post/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const post = await Posts.findByIdAndDelete({ _id });
    if (req.user._id.toString() !== post.owner.toString()) {
      return res.status(400).send("Not Authorized");
    }
    if (!post) {
      return res.status(404).send("No Posts Found");
    }
    res.status(200).send("Post Deleted");
  } catch (error) {
    res.status(400).send("error in delete post");
  }
});

//comments related

//add comment in a post
router.post("/addComment/:id", auth, async (req, res) => {
  try {
    const obj = {
      commentUser: req.user._id,
      commentBody: req.body.commentBody
    };

    const post = await Posts.findById({ _id: req.params.id });

    post.comments.push(obj);
    await post.save();

    res.status(201).send("Comment Added");
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
});

//edit comment

router.patch("/editComment/:pId/:cId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;

    const post = await Posts.findById({ _id });
    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }

    if (req.user._id.toString() === isExists.commentUser.toString()) {
      isExists.commentBody = req.body.commentBody;

      await post.save();

      res.status(200).send("Comment Updated");
    } else {
      return res.status(400).send("not Authorized");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//comment delete
router.delete("/deleteComment/:pId/:cId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;

    const post = await Posts.findById({ _id });
    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }

    if (
      req.user._id.toString() === isExists.commentUser.toString() ||
      req.user._id.toString() === post.owner.toString()
    ) {
      const del = post.comments.filter(comment => {
        return _commentId !== comment._id.toString();
      });
      post.comments = del;

      await post.save();

      res.status(200).send("Comment Deleted");
    } else {
      return res.status(400).send("not Authorized");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//likes on comment
//add like
router.post("/addLike/:pId/:cId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;

    const post = await Posts.findById({ _id });
    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }
    let value = false;
    isExists.commentLikes.forEach(user => {
      if (user.user.toString() === req.user._id.toString()) {
        value = true;
      }
    });

    if (value) {
      return res.status(200).send("Already Liked");
    } else {
      isExists.commentLikes.push({
        user: req.user.id,
        likeValue: true
      });

      await post.save();

      return res.status(200).send("Like Added");
    }
  } catch (error) {
    console.log(error);

    console.log("error in add like");

    res.status(400).send(error);
  }
});

//remove like
router.post("/removeLike/:pId/:cId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;

    const post = await Posts.findById({ _id });
    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }
    let value = false;
    isExists.commentLikes.forEach(user => {
      if (user.user.toString() === req.user._id.toString()) {
        value = true;
      }
    });

    if (value) {
      const userList = isExists.commentLikes.filter(user => {
        return user.user.toString() !== req.user._id.toString();
      });
      isExists.commentLikes = userList;
      await post.save();
      return res.status(200).send("Like Removed");
    } else {
      return res.status(200).send("Like Cant Be Removed");
    }
  } catch (error) {
    console.log("error in add like");

    res.status(400).send(error);
  }
});

//replies
//add reply in a post
router.post("/addReply/:id/:cId", auth, async (req, res) => {
  try {
    const obj = {
      replyUser: req.user._id,
      replyText: req.body.replyText
    };

    const post = await Posts.findById({ _id: req.params.id });
    const comment = post.comments.find(comment => {
      return req.params.cId.toString() === comment._id.toString();
    });
    if (comment) {
      comment.replies.push(obj);
      await post.save();

      return res.status(201).send("Reply Added");
    }
    if (!comment) {
      return res.status(404).send("Comment Not Found to Reply");
    }
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
});

//edit Reply

router.patch("/editReply/:pId/:cId/:rId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;
    const _replyId = req.params.rId;

    const post = await Posts.findById({ _id });
    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }
    const replyExists = isExists.replies.find(reply => {
      return _replyId.toString() === reply._id.toString();
    });
    if (!replyExists) {
      return res.status(404).send("Reply Not Found");
    }
    if (req.user._id.toString() === replyExists.replyUser.toString()) {
      replyExists.replyText = req.body.replyText;

      await post.save();

      res.status(200).send("Reply Updated");
    } else {
      return res.status(401).send("not Authorized");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete Reply

router.delete("/deleteReply/:pId/:cId/:rId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;
    const _replyId = req.params.rId;

    const post = await Posts.findById({ _id });

    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }
    const replyExists = isExists.replies.find(reply => {
      return _replyId.toString() === reply._id.toString();
    });
    if (!replyExists) {
      return res.status(404).send("Reply Not Found");
    }
    if (req.user._id.toString() === replyExists.replyUser.toString()) {
      const del = isExists.replies.filter(reply => {
        return reply._id !== replyExists._id;
      });
      isExists.replies = del;

      await post.save();

      res.status(200).send("Reply Deleted");
    } else {
      return res.status(401).send("not Authorized");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

//likes on replies
//add like
router.post("/addLike/:pId/:cId/:rId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;
    const _replyId = req.params.rId;

    const post = await Posts.findById({ _id });
    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }

    let value = false;
    isExists.replies.forEach(reply => {
      if (reply._id.toString() === _replyId.toString()) {
        if (Array.isArray(reply.replyLikes) && reply.replyLikes.length <= 0) {
          reply.replyLikes.push({
            user: req.user.id,
            likeValue: true
          });
          value = true;
          return;
        }

        reply.replyLikes.find(user => {
          if (user.user.toString() === req.user._id.toString()) {
            value = false;
            return;
          } else {
            reply.replyLikes.push({
              user: req.user.id,
              likeValue: true
            });
            value = true;
            return;
          }
        });
      }
    });
    if (value) {
      await post.save();

      return res.status(200).send("Like Added");
    } else {
      return res.status(200).send("Already Liked");
    }
  } catch (error) {
    console.log(error);

    console.log("error in add like");

    res.status(400).send(error);
  }
});

//remove like
router.post("/removeLike/:pId/:cId/:rId", auth, async (req, res) => {
  try {
    const _id = req.params.pId;
    const _commentId = req.params.cId;
    const _replyId = req.params.rId;
    const post = await Posts.findById({ _id });
    //search if comment exists
    const isExists = post.comments.find(comment => {
      return _commentId === comment._id.toString();
    });
    if (!isExists) {
      return res.status(404).send("Comment Not Found");
    }

    let value = false;
    isExists.replies.forEach(reply => {
      if (reply._id.toString() === _replyId.toString()) {
        if (Array.isArray(reply.replyLikes) && reply.replyLikes.length <= 0) {
          value = false;
          return;
        }

        const likeUser = reply.replyLikes.find(user => {
          if (user.user.toString() === req.user._id.toString()) {
            value = true;
            return user;
          }
        });

        const list = reply.replyLikes.filter(user => {
          return likeUser !== user;
        });
        reply.replyLikes = list;
        value = true;
      }
    });
    if (value) {
      await post.save();

      return res.status(200).send("Like Removed");
    } else {
      return res.status(200).send("No Likes to Be Removed");
    }
  } catch (error) {
    console.log("error in add like");

    res.status(400).send(error);
  }
});

module.exports = router;
