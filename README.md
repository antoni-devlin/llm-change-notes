# Change note generator

This is a change note generator written in Node that uses the OpenAI API (currently gpt 3.5-turbo).

<img width="1515" alt="Screenshot 2024-09-25 at 13 35 11" src="https://github.com/user-attachments/assets/0658b121-2df7-44df-824b-178683cd8ef3">

## Before you start

You'll need node and npm installed to run this project. Confirmed working on node 9.5.1.

## Setup

Clone this repo, and create a file called `.env` in the project root containing the following environment variables:

```env
OPENAI_API_KEY=YOUR_OPEN_AI_API_KEY
OPENAI_ORG=YOUR_OPENAI_ORG_ID
OPENAI_PROJECT=YOUR_OPENAI_PROJECT_ID
```

Then run `npm install` from the project root to install dependencies.

## Usage

Run `npm start` to start the express server at `localhost:3000`. Nodemon will automatically restart the server after any changes you make.

The system prompts and few-shot examples are in `prompts.yaml`.

OpenAI completions settings are in `app.js`.
