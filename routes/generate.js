import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

import fs from "fs";
import yaml from "js-yaml";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-TBT0kyFALjpxp1vdY2sY9Xe2",
  project: "proj_OL13brx9UFSCUdDKqopdVJj9",
});

// Function to read and parse YAML file
const readYamlFile = () => {
  try {
    // Read the file content
    const fileContent = fs.readFileSync("prompts.yaml", "utf8");

    // Parse the YAML content
    const data = yaml.load(fileContent);

    // Return the parsed data
    return data;
  } catch (e) {
    console.error("Error reading or parsing YAML file:", e);
  }
};
const prompts = readYamlFile().prompts;
const systemPrompt = prompts.system_prompt;
const fewShots = prompts.few_shots;

// console.log(fewShots);

let messages = [];
messages.unshift({ role: "system", content: `${systemPrompt}` });

// Iterate over the few_shots array
prompts.few_shots.forEach((fewShot, index) => {
  messages.push(
    { role: "user", content: fewShot.user },
    { role: "assistant", content: fewShot.assistant }
  );
});

router.post("/", async (req, res) => {
  const { currentContent, updatedContent } = req.body;

  messages.push({
    role: "user",
    content: `---CURRENT CONTENT---\n\n${currentContent}\n\n---NEW CONTENT---\n\n${updatedContent}`,
  });

  try {
    console.log(messages);
    console.log("Starting completion");
    const completion = await openai.chat.completions.create({
      messages: messages,
      temperature: 0.7,
      model: "gpt-3.5-turbo",
    });

    const result = completion.choices[0].message.content;
    res.json({ result });
    console.log("Completion returned");
    return completion.choices[0];
  } catch (error) {
    console.error("Error generating change notes:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating change notes." });
  }
});

export default router;
