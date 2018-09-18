var express = require('express');
var axios = require('axios');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  axios({
    url: 'https://www.tut.by',
    method: 'get'
  })
    .then(function(response) {
      res.json({
        html: response.data
      });
    })
    .catch(function() {
      res.json({
        success: false,
        message: 'Интернет сайт недоступен'
      });
    });
});

module.exports = router;
