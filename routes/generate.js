import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: "org-TBT0kyFALjpxp1vdY2sY9Xe2",
  project: "proj_OL13brx9UFSCUdDKqopdVJj9",
});

router.post("/", async (req, res) => {
  const { currentContent, updatedContent } = req.body;

  const systemPrompt = `You are an assistant for the Government Digital Service Content Designers. Your task is to produce detailed change notes by analyzing the differences between two versions of the same markdown content.

  Guidelines:
  
  1: Source-Based Changes Only: Your notes must strictly reflect the differences between the two provided versions. Do not introduce external knowledge or suggest changes not present in the user's content. Do not give any explanatory notes of any kind, ever.
  2: Structured Change Notes: Break the differences into separate changes, numbering them like this: [1].
  3: Template Adherence: Use the provided CHANGE/TO/SUMMARY format without prose. Always maintain markdown formatting given (e.g., headings, links).
  4: No Conversations: If asked for anything other than change notes, reply: "I'm sorry, I can't help you with that. Please give me two versions of a piece of content so I can write you some change notes."
  5: Markdown Preservation: Ensure your answer preserves the markdown formatting from the provided content.
  6: Batch Small Changes: If small changes occur close together (e.g., bullet points or minor figures), batch them under one number.
  7: Specify Location: Each change must specify the heading under which it occurs, like this: LOCATION: ##Tax credits.
  8: Comprehensive Capture: Document all changes. Omissions will be penalized.
  9: Include lead-in Lines: For bullet point changes, include the lead-in line before the list.
  10: IMPORTANT: Never duplicate changes. If you have already documented a change, do not mention it again in a different change it overlaps with.
  11: Always write the change notes in the order they appear in the content.`;

  let few_shot_example_1 = `
  
  Example 1
  
  ---CURRENT CONTENT---
  
  ##What happens next
  
  If your application is approved, NHS Student Bursaries will send you an email when your bursary is available for you to view in your NHS bursary account.
  
  If you get an NHS bursary you can apply separately for a reduced rate loan from Student Finance England. Check which loans you’re eligible for using the student finance calculator.
  
  ---NEW CONTENT---
  
  ##What happens next
  
  If your application is approved, NHS Student Bursaries will send you an email when your bursary is available for you to view in your NHS bursary account.
  
  If you get an NHS bursary you can apply separately for a reduced rate loan from Student Finance England. Estimate how much you could get using the student finance calculator.`;

  let example_1_output = `
  CHANGE NOTES
  
  [1]
  LOCATION: ##What happens next
  
  CHANGE
  
  If you get an NHS bursary you can apply separately for a reduced rate loan from Student Finance England. Check which loans you’re eligible for using the student finance calculator.
  
  TO
  
  If you get an NHS bursary you can apply separately for a reduced rate loan from Student Finance England. Estimate how much you could get using the student finance calculator.
  
  SUMMARY
  
  Change "Check which loans you're eligible for" to "Estimate how much you could get".`;

  let few_shot_example_2 = `
  Example 2
  
  ---CURRENT CONTENT---
  
  #What's exempt
  You don’t have to report anything to HM Revenue and Customs (HMRC) or deduct and pay tax and National Insurance if both the following apply:
  
  you provide your employee with only one mobile phone or SIM card
  the phone contract is between you and the supplier
  ##Salary sacrifice arrangement
  
  You do have to report employees' mobile phone costs if they are part of a salary sacrifice arrangement.
  
  ##What to report and pay
  If telephone expenses aren't exempt, you must report them to HM Revenue and Customs (HMRC) and may have to deduct and pay tax and National Insurance on them.
  
  ^Some mobile phone expenses are covered by exemptions (which have replaced dispensations). This means you won’t have to include them in your end-of-year reports.^
  
  ---NEW CONTENT---
  
  #What's exempt
  You do not have to report anything to HM Revenue and Customs (HMRC) or deduct and pay tax and National Insurance if both the following apply:
  
  you provide your employee with only one mobile phone or SIM card
  the phone contract is between you and the supplier
  ##Salary sacrifice arrangement
  
  You do have to report employees' mobile phone costs if they are part of a salary sacrifice arrangement.
  
  ##What to report and pay
  If telephone expenses are not exempt, you must report them to HM Revenue and Customs (HMRC) and may have to deduct and pay tax and National Insurance on them.
  
  ^Some mobile phone expenses are covered by exemptions (which have replaced dispensations). This means you will not have to include them in your end-of-year reports.^`;

  let example_2_output = `
CHANGE NOTES

[1]
  LOCATION: #What's exempt
  
  CHANGE
  
  You don’t have to report anything to HM Revenue and Customs (HMRC) or deduct and pay tax and National Insurance if both the following apply:
  
  TO
  
  You do not have to report anything to HM Revenue and Customs (HMRC) or deduct and pay tax and National Insurance if both the following apply:

  SUMMARY

  Changed "don't" to "do not" in this sentence.
  
  [2]
  LOCATION: ##What to report and pay
  
  CHANGE
  
  If telephone expenses aren't exempt, you must report them to HM Revenue and Customs (HMRC) and may have to deduct and pay tax and National Insurance on them.
  
  TO
  
  If telephone expenses are not exempt, you must report them to HM Revenue and Customs (HMRC) and may have to deduct and pay tax and National Insurance on them.

  SUMMARY

  Changed "aren't" to "are not".
  
  [3]
  
  LOCATION: ##What to report and pay
  CHANGE
  
  ^Some mobile phone expenses are covered by exemptions (which have replaced dispensations). This means you won’t have to include them in your end-of-year reports.^
  
  TO
  
  ^Some mobile phone expenses are covered by exemptions (which have replaced dispensations). This means you will not have to include them in your end-of-year reports.^
  
  SUMMARY

  Change "won't" to "will not".`;

  try {
    console.log("Starting completion");
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: `${systemPrompt}` },
        { role: "user", content: few_shot_example_1 },
        { role: "assistant", content: example_1_output },
        { role: "user", content: few_shot_example_2 },
        { role: "assistant", content: example_2_output },
        {
          role: "user",
          content: `---CURRENT CONTENT---\n\n${currentContent}\n\n---NEW CONTENT---\n\n${updatedContent}`,
        },
      ],
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
