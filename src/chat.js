import OpenAI from "openai";
import dotenv from 'dotenv';
import * as readline from 'node:readline/promises';
import {Configuration} from "openai-edge";

dotenv.config();

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI(config);

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

//const messages = [];
var threadId = null;

async function Chat(userInput) {
    var reponse = '';
  while (true) {
    console.log('User:', userInput);
    threadId = threadId ?? (await openai.beta.threads.create());
    
    console.log("This is the thread object: ", threadId, "\n");

    const message = await openai.beta.threads.messages.create(
        threadId.id,
        {
          role: "user",
          content: userInput
        }
    );

    let run = await openai.beta.threads.runs.createAndPoll(
        threadId.id,
        { 
          assistant_id: process.env.ASSISTANT_ID,
          instructions: ""
        }
    );


    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
          run.thread_id
        );
        const lastMessageContent = messages.data[0].content[0].text.value;
        reponse = lastMessageContent;
        console.log("Assistant: " + reponse);
        return reponse;
      } else {
        console.log(run.status);
        return 'error';
    }
  }
}


export default Chat;