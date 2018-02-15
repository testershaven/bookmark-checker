const bookmarks = require('./lib/db/bookmarks');
const amqp = require('amqplib/callback_api');

/**
 * Gets a batch of bookmarks to send to the queue
 * the batch are the 100 with the oldest checked timestamp
 * @return send the date to the queue
 */
bookmarks.findBatch(function(err, result) {
  if (err) { return next(err); }
  for(let row of result) {

    amqp.connect('amqp://localhost', function(err, conn) {
      conn.createChannel(function(err, ch) {
        let q = 'bookmarks';
        let msg = `${row.id} - ${row.url}`;

        ch.assertQueue(q, {durable: false});
        // Note: on Node 6 Buffer.from(msg) should be used
        ch.sendToQueue(q, new Buffer(msg));
        console.log(" [x] Sent %s", msg);
      });
      setTimeout(function() { conn.close(); process.exit(0) }, 500);
    });
  }
});

