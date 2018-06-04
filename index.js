#! /usr/bin/env node

/**
 * Import third party packages
 */
const program = require('commander');
const fetch = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const uuid = require('uuid');

const colors = {
  priorities: {
    4: 'red',
    3: 'yellowBright',
    2: 'yellow',
    1: 'white',
  },
};

/**
 * App has started, notify the user
 */
// console.log(chalk.green('Todoist CLI ✨ '));

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

const printer = tasks => {
  console.log(
    tasks
      .sort((a, b) => {
        return parseInt(b.priority) - parseInt(a.priority);
      })
      .map(task => {
        const {content, priority} = task;
        const pCol = colors.priorities[priority];
        return `${chalk[pCol](`p${priority}`)} ${content}`;
      })
      .join('\n')
      .toString()
  );
};

const restApi = (options = {}, params = {}) => {
  const spinner = ora(options.msg).start();
  const request = {
    url: 'https://beta.todoist.com/API/v8/tasks?token=' + token,
    method: 'get',
    params,
    ...options,
  };

  return fetch(request)
    .then(({data}) => {
      console.log('\n');
      printer(data);
      console.log();
      spinner.succeed('Done.');
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
      {
        filter: `${project}`,
      }
    );
  });

program
  .command('today')
  .alias('t')
  .action(project => {
    restApi(
      {
        msg: 'Listing tasks due today',
      },
      {
        filter: '(overdue | today)',
      }
    );
  });

program.parse(process.argv);
