var express = require('express');
var axios = require('axios');
var cors = require('cors');
var AWS = require('aws-sdk');
var redis = require('redis');

var router = express.Router();
const client = redis.createClient();

client.on('error', function(err) {
  console.log('Redis Error ' + err);
});

/* GET home page. */
router.get('/', cors(), async (req, res, next) => {
  try {
    const cache = await new Promise((resolve) =>
      client.get(req.query.url, function(error, res) {
        resolve(res);
      })
    );

    if (cache) {
      return res.json(JSON.parse(cache));
    }

    AWS.config = new AWS.Config();
    AWS.config.region = 'eu-central-1';
    AWS.config.accessKeyId = '';
    AWS.config.secretAccessKey = '';

    const fireHose = new AWS.Firehose();
    fireHose.putRecord(
      {
        DeliveryStreamName: 'labatestKinesis',
        Record: {
          Data: new Buffer(JSON.stringify({ url: req.query.url }))
        }
      },
      (err, data) => {
        console.log('kinesis === ', err, data);
      }
    );

    const response = await axios({
      url: req.query.url,
      method: 'get'
    });

    const html = response.data;

    const navTags = html
      .toString()
      .replace(/\s/g, '')
      .match(/<\s*nav[^>]*>(.*?)<\s*\/\s*nav>/g);

    let result = {
      positive: [],
      negative: []
    };

    if (navTags) {
      result.positive.push('Тег навигации присутствует');

      if (navTags[0].includes('<ul')) {
        result.positive.push('Список меню присутствует');
      } else {
        result.negative.push('Список меню отсутствует');
      }

      if (navTags[0].includes('<li')) {
        result.positive.push('Пункты меню присутствуют');
      } else {
        result.negative.push('Пункты меню отсутствуют');
      }

      if (navTags[0].includes('<a')) {
        result.positive.push('Ссылки в меню присутствуют');
      } else {
        result.negative.push('Ссылки в меню отсутствуют');
      }

      if (navTags[0].includes('aria-current="page"')) {
        result.positive.push('Aria тег текущей страницы присутвует');
      } else {
        result.negative.push('Aria тег текущей страницы отсутвует');
      }
    } else {
      result.negative.push('Навигация отсутствует');
    }

    client.set(req.query.url, JSON.stringify(result));
    res.send(result);
  } catch (error) {
    console.log('error == ', error);
    next(new Error(error));
  }
});

module.exports = router;
