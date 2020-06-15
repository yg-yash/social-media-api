const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Friends = require("../models/friends");
const User = require("../models/user");

router.post("/addFriend/:id", auth, async (req, res) => {
  try {
    const owner = req.user.id;
    const user = await Friends.findOne({ owner });
    const obj = {
      friend: req.params.id
    };
    if (!user) {
      const list = [];

      list.push(obj);

      const newUser = new Friends({
        owner,
        friendsList: list
      });
      await newUser.save();
      return res.status("201").send("Friend Added");
    }
    const isExists = user.friendsList.find(friend => {
      return friend.friend == req.params.id;
    });
    if (!isExists) {
      user.friendsList.push(obj);
      await user.save();
      return res.status(201).send("Friend Added");
    }
    res.status(400).send("Friend Already Added");
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
});

router.post("/removeFriend/:id", auth, async (req, res) => {
  try {
    const owner = req.user.id;
    const user = await Friends.findOne({ owner });

    const findFriend = user.friendsList.find(friend => {
      return friend.friend == req.params.id;
    });
    if (!findFriend) {
      return res.status(404).send("Friends Not Exist");
    }

    const list = user.friendsList.filter(friend => {
      return friend.friend != req.params.id;
    });
    user.friendsList = list;

    user.save();
    res.status(200).send("Friend Removed");
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
});

//show friendsList
router.post("/showFriends", auth, async (req, res) => {
  try {
    const owner = req.user.id;
    const user = await Friends.findOne({ owner });
    let list = [];

    if (!user) {
      return res.status(404).send("No Friend Found");
    }

    const search = user.friendsList.filter(friend => {
      return friend.friend;
    });

    if (search.length <= 0) {
      return res.status(404).send("No Friend Found");
    }

    const userList = search.map(async friend => {
      const value = await User.findOne({ _id: friend.friend });

      return list.push(value);
    });
    await Promise.all(userList);

    res.status(200).send(list);
  } catch (error) {
    console.log(error);

    res.status(400).send(error);
  }
});

module.exports = router;
