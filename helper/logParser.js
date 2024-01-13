const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const fs = require("fs");
const csv = require("csv-parse");

// Function to parse CSV data within a worker thread
const parseCsvInWorker = (csvData, callback) => {
  csv.parse(csvData, { columns: true, trim: true }, (csvErr, output) => {
    if (csvErr) {
      callback(csvErr, null);
      return;
    }
    callback(null, output);
  });
};

exports.parseData = (numThreads = 4) => {
  return new Promise((resolve, reject) => {
    fs.readFile("./resource/accessLog.csv", "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const chunkSize = Math.ceil(data.length / numThreads);
      const chunks = [];

      for (let i = 0; i < numThreads; i++) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        chunks.push(data.slice(start, end));
      }

      const workers = [];
      const results = [];

      const onWorkerMessage = (message) => {
        results.push(...message);

        if (results.length === numThreads) {
          resolve(results);
        }
      };

      const onWorkerError = (error) => {
        reject(error);
      };

      const onWorkerExit = () => {
        // Ensure that all workers have exited before resolving
        if (workers.every((worker) => worker.exited)) {
          resolve(results);
        }
      };

      for (let i = 0; i < numThreads; i++) {
        const worker = new Worker(__filename, {
          workerData: { csvData: chunks[i], threadId: i + 1 },
        });

        worker.on("message", onWorkerMessage);
        worker.on("error", onWorkerError);
        worker.on("exit", onWorkerExit);

        workers.push(worker);
      }
    });
  });
};

// If the script is being run in a worker thread, parse the CSV data
if (!isMainThread) {
  parseCsvInWorker(workerData.csvData, (err, output) => {
    if (err) {
      console.error(err);
      parentPort.postMessage({ error: err });
    } else {
      parentPort.postMessage({ data: output });
    }
    // Terminate the worker thread
    workerData.threadId === 1 && process.exit();
  });
}
