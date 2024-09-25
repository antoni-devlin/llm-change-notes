# Change note generator

This is a change note generator written in Node that uses the OpenAI API (currently gpt 3.5-turbo).

## Setup

Clone this repo, and create a file called `.env` in the project root containing the following environment variables:

```env
OPENAI_API_KEY=YOUR_OPEN_AI_API_KEY
OPENAI_ORG=YOUR_OPENAI_ORG_ID
OPENAI_PROJECT=YOUR_OPENAI_PROJECT_ID
```

Then run `npm install` from the project root to install dependencies.

## Usage

Run `npm start` to start the express server at `localhost:3000`.

The system prompts and few-shot examples are in `prompts.yaml`.
