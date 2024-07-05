const accessModel = require("../models/accessModel");

const ratelimitng = async (req, res, next) => {
  const sid = req.session.id;
  console.log("session id==>>>>", sid);
  try {
    const accessDb = await accessModel.findOne({ sessionId: sid });
    console.log(accessDb);
    //this is the first req, create an entry in db
    if (!accessDb) {
      console.log("hoo");
      const accessObj = new accessModel({ sessionId: sid, time: Date.now() });
      await accessObj.save();
      next();
      return;
    }
    console.log((Date.now() - accessDb.time) / 1000);

    const diff = (Date.now() - accessDb.time) / 1000;

    //if it is less then your logic
    if (diff < 1 ) {
      // 1 req/sec
      return res
        .status(400)
        .json("Too many request, please wait for some time");
    }
     //req time is fine
     const db = await accessModel.findOneAndUpdate(
        { sessionId: sid },
        { time: Date.now() }
      );
      next();
  } catch (error) {
    console.log(error);
  }
};
module.exports = ratelimitng;
