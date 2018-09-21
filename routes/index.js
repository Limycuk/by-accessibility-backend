var express = require('express');
var axios = require('axios');
var cors = require('cors');

var router = express.Router();

/* GET home page. */
router.get('/', cors(), async (req, res, next) => {
  console.log('req.params == ', req.params);
  try {
    const response = await axios({
      url: 'https://www.tut.by',
      method: 'get'
    });

    res.send({
      html: response.data
    });
  } catch (error) {
    console.log('error == ', error);
    next(new Error(error));
  }
});

module.exports = router;
