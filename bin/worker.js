const amqp = require('amqplib/callback_api');
const request = require('request');
const bookmarks = require('../lib/db/bookmarks');
const config = require('config');

const updateStatus = function(id, status) {
  const params = {
    id: id,
    is_ok: status
  }
  bookmarks.updateStatus(params, (err, result) => {
    if (err) {
      console.log(err);
    }
  });
}

amqp.connect(config.get("rabbitConn"), function(err, conn) {
  conn.createChannel(function(err, ch) {
    let q = 'bookmarks';

    ch.assertQueue(q, {durable: false});
    ch.prefetch(config.get("prefetch"));
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
    ch.consume(q, function(msg) {

      const content = JSON.parse(msg.content);
      const options ={
        url: content.url,
        timeout: config.get("timeout")
      }
      request(content.url, function (error, response, body) {
        if (!error && response.statusCode < 400) {
          updateStatus(content.id, true);
        } else {
          updateStatus(content.id, false);
        }
        console.log(`url ${content.url} checked`);
        ch.ack(msg);
      })
    }, {noAck: false});
  });
});
