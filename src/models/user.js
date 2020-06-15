const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Post = require("./posts");
const Friends = require("./friends");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      default: 0,
      //custome validator
      validate(value) {
        if (value < 0) {
          throw new Error("Age Must be a Postive Number");
        }
      }
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      //using validator npm module
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password cant cotain 'password'");
        }
      }
    },

    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.virtual("posts", {
  ref: "Posts",
  localField: "_id",
  foreignField: "owner"
});

userSchema.virtual("friends", {
  ref: "Friends",
  localField: "_id",
  foreignField: "owner"
});

userSchema.methods.toJSON = function() {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;
  return userObj;
};
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = await jwt.sign(
    { _id: user.id.toString() },
    "thisismynewcourse"
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable To Login");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Unable to Login");
  }
  return user;
};

//hash the plain text password before saving
userSchema.pre("save", async function(next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  //make sure next get called to tell this middleware has done its work
  next();
});

//delete user posts when user is removed
userSchema.pre("remove", async function(next) {
  const user = this;
  await Post.deleteMany({ owner: user._id });

  next();
});

//creating a User database model
const User = mongoose.model("User", userSchema);

module.exports = User;
