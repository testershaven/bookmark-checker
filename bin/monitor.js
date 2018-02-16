// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-2'});
const amqp = require("amqplib");
const config = require("config");

// Create CloudWatch service object
var cw = new AWS.CloudWatch({apiVersion: '2010-08-01'});

// Create parameters JSON for putMetricData
var params = {
  MetricData: [
    {
      MetricName: 'PAGES_LEFT',
      Dimensions: [
        {
          Name: 'PAGES',
          Value: 'URLS'
        },
      ],
      Unit: 'None'
      //Value: 1.0
    },
  ],
  Namespace: 'BOOKMARK/MONITOR'
};

async function measureQueueSize() {
  try {
    const conn = await amqp.connect(config.get("rabbitConn"));
    const ch = await conn.createChannel();
    const q = "bookmarks";
    const interval = config.get("monitor").time;

    console.log(" [*] Monitoring %s queue size every %sms. To exit press CTRL+C", q, interval);

    let getQueueSize = async () => {
      try {
        let chInfo = await ch.assertQueue(q, { durable: false });
        let queueSize = chInfo.messageCount
        params.MetricData.Value = queueSize;

        if (process.env.NODE_ENV === "production") {
          cw.putMetricData(params, function(err, data) {
            if (err) {
              console.log("Error", err);
          } else {
            console.log("Success", data);
          }
          })
        } else {
          console.log("Queue size is: %s", queueSize);
        }
      } catch (e) {
        console.log(e);
        process.exit(1);
      }
    }

    setInterval(getQueueSize, interval);
  } catch (e) {
    console.log(e);
    conn.close();
  }
}

measureQueueSize();