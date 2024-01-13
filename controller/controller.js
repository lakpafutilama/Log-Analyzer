const { parseData } = require("../helper/logParser");

const fetchData = async (req, res) => {
  try {
    const dataa = await parseData();

    const [browserCounts, countryCounts, osCounts, timeCounts] =
      await Promise.all([
        calculateBrowserCounts(dataa),
        calculateCountryCounts(dataa),
        calculateOsCounts(dataa),
        calculateTimeCounts(dataa),
      ]);

    const ipCounts = countryCounts;

    const result = {
      browser: browserCounts,
      country: countryCounts,
      os: osCounts,
      ip: ipCounts,
      time: timeCounts,
    };

    res.status(200).json({ data: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to calculate browser counts
const calculateBrowserCounts = async (dataa) => {
  return dataa.reduce((counts, item) => {
    const browser = item.browser;
    counts[browser] = (counts[browser] || 0) + 1;
    return counts;
  }, {});
};

// Helper function to calculate country counts
const calculateCountryCounts = async (dataa) => {
  return dataa.reduce((counts, item) => {
    const country = item.country;
    counts[country] = (counts[country] || 0) + 1;
    return counts;
  }, {});
};

// Helper function to calculate OS counts
const calculateOsCounts = async (dataa) => {
  return dataa.reduce((counts, item) => {
    const os = item.os;
    counts[os] = (counts[os] || 0) + 1;
    return counts;
  }, {});
};

// Helper function to calculate time counts
const calculateTimeCounts = async (dataa) => {
  return dataa.reduce((counts, item) => {
    const day = item.day;
    const time = item.time;

    if (!counts[day]) {
      counts[day] = {};
    }

    counts[day][time] = (counts[day][time] || 0) + 1;

    return counts;
  }, {});
};

module.exports = {
  fetchData,
};
