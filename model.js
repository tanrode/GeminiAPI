const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();

const inputFile = "input.csv";
const outputFile = "output.txt"; // Output file name
const rows = [];
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function run() {
  const outputStream = fs.createWriteStream(outputFile); // Create a write stream

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on("data", (row) => {
      // Process each row
      rows.push(row["Prompt"]);
    })
    .on("end", async () => {
      for (const prompt of rows) {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        outputStream.write(
          text + "\n----------------------------------------\n"
        ); // Write to the output stream
      }
      outputStream.end(); // Close the write stream
      console.log(
        "CSV file successfully processed. Output written to",
        outputFile
      );
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error.message);
    });
}

run();
