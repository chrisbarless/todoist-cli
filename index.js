#! /usr/bin/env node

/**
 * Import third party packages
 */
const program = require('commander');
const fetch = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const uuid = require('uuid');

/**
 * App has started, notify the user
 */
console.log(chalk.green('Todoist CLI ✨'));

/**
 * In order to do anything we must first have a valid API token, let's try and find one.
 */
const token = process.env.TODOIST_TOKEN;
if (!token) {
  console.log(chalk.red.bold('NO API TOKEN FOUND.'));
  console.log(
    'Please add a valid token to your environment as `TODOIST_TOKEN`, eg. by running `export TODOIST_TOKEN="MY_API_TOKEN"`.'
  );
  console.log(
    'You can find your token at: https://todoist.com/Users/viewPrefs?page=authorizations.'
  );
  process.exit(1);
}

const restApi = (options = {}, data = []) => {
  const spinner = ora(options.name).start();

  const url = 'https://beta.todoist.com/API/v8/tasks?token=' + token;

  return fetch(url, {
    method: 'GET',
  })
    .then(({data}) => {
      console.log(data);
      spinner.succeed(JSON.stringify(data));
    })
    .catch(e => {
      console.log(e);
      spinner.fail(`${e}`);
      process.exit(1);
    });
};
program
  .command('list <project>')
  .alias('l')
  .action(project => {
    restApi(
      {
        msg: `Listing tasks from ${project}`,
      },
      {filter: `${project}`}
    );
  });

program.parse(process.argv);
