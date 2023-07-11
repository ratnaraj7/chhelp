#!/usr/bin/env node
import inquirer from "inquirer";
import kleur from "kleur";
import ora from "ora";

function getRepeatCharWidth(character) {
  const screenWidth = process.stdout.columns;
  const line = character.repeat(screenWidth - 2);
  return line;
}

const spinner = ora("Asking....");
const fetchOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
};

const model = "gpt-3.5-turbo";
const OPENAI_CHAT_COMPLETION_ENDPOINT =
  "https://api.openai.com/v1/chat/completions";

function ask(messages) {
  const body = JSON.stringify({ model, messages });
  return fetch(OPENAI_CHAT_COMPLETION_ENDPOINT, { ...fetchOptions, body });
}

async function run() {
  let messages = [];
  while (true) {
    const { text: content } = await inquirer.prompt([
      {
        type: "editor",
        name: "text",
        message: "Enter to open editor",
        filter: (input) => {
          return input.replace(/\n$/, "");
        },
      },
    ]);
    messages.push({ role: "user", content });
    spinner.start();
    const apiResponse = await ask(messages);
    const data = await apiResponse.json();
    spinner.stop();
    messages.push(data.choices[0].message);
    console.clear();
    for (let index = 0; index < messages.length; index++) {
      const message = messages[index];
      console.log(
        message.role === "user"
          ? kleur.bold().black().bgYellow(` ${message.role} `)
          : kleur.bold().black().bgMagenta(` ${message.role} `),
        " => ",
        kleur.red(` ${message.content} `)
      );
      console.log(
        message.role === "assistant"
          ? `\n${kleur.bgBlack(` ${getRepeatCharWidth("=")} `)}\n`
          : ""
      );
    }
  }
}

run();
