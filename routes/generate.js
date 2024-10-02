import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

import fs from "fs";
import yaml from "js-yaml";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
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

let messages = [];
messages.unshift({ role: "system", content: `${systemPrompt}` });

// Iterate over the few_shots array and add the system prompt and fewShots to messages object
fewShots.forEach((fewShot, index) => {
  messages.push(
    { role: "user", content: fewShot.user },
    { role: "assistant", content: fewShot.assistant }
  );
});

async function runCompletion(currentContent, updatedContent) {
  console.log("Call 1: Getting description of changes");
  // Step 1 Get a description of the difference between the two pieces of content
  let descriptionOfChanges = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Describe the difference between the following two pieces of markdown content. Make sure you flag whether each change is a CHANGE, REMOVAL or DIFFERENCE in a new bullet point:\n\n---CURRENT CONTENT---\n\n${currentContent}\n\n---NEW CONTENT---\n\n${updatedContent}`,
      },
    ],
    temperature: 0.7,
    model: "gpt-4o-mini",
  });
  // Add description prompt to the system prompt so LLM can use it as a guide when creating change notes
  descriptionOfChanges = descriptionOfChanges.choices[0].message.content;
  messages.splice(1, 0, {
    role: "user",
    content: `Use this text description of the changes between these two specific versions of the content to guide the change notes, and ensure they  are accurate and you haven't missed anything:\n${descriptionOfChanges}`,
  });

  // Step 2 Generate change notes for the two pieces of content
  console.log("Call 2: Generating change notes");
  messages.push({
    role: "user",
    content: `---CURRENT CONTENT---\n\n${currentContent}\n\n---NEW CONTENT---\n\n${updatedContent}`,
  });
  let changeNotes = await openai.chat.completions.create({
    messages: messages,
    temperature: 0.7,
    model: "gpt-4o-mini",
  });
  changeNotes = changeNotes.choices[0].message.content;
  // Step 3 Check the changes notes against the description of changes, and return an accuracy statement
  console.log("Call 3: Checking accuracy");
  let accuracyCheck = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Check that the following ==Change notes== accurately represent the changes made to the markdown content described in the ==Description of Changes== section. If they match, return only "Change notes look good". If they don't match, return only "Change notes are probably not accurate." Never say anything else. Here is the information for you to analyse.\n\n==Change notes==\n\n${changeNotes}\n\n==Description of changes==\n\n${descriptionOfChanges}`,
      },
    ],
    temperature: 0.7,
    model: "gpt-4o-mini",
  });

  accuracyCheck = accuracyCheck.choices[0].message.content;

  return { descriptionOfChanges, changeNotes, accuracyCheck };
}

router.post("/", async (req, res) => {
  const { currentContent, updatedContent } = req.body;
  try {
    const { descriptionOfChanges, changeNotes, accuracyCheck } =
      await runCompletion(currentContent, updatedContent);
    res.json({
      descriptionOfChanges,
      changeNotes,
      accuracyCheck,
    });
    console.log("Result returned");
  } catch (error) {
    console.log("Something went wrong:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
