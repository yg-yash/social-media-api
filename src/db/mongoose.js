const mongoose = require('mongoose');

//creating a database
mongoose
  .connect('Your Mongo URI', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log('database connected'))
  .catch(() => console.log('database error', error));
