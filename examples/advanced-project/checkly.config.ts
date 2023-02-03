const config = {
  projectName: 'Advanced Example Project',
  logicalId: 'advanced-example-project',
  repoUrl: 'https://github.com/checkly/checkly-cli',
  checks: {
    locations: [ 'us-east-1', 'eu-west-1' ],
    tags: ['mac'],
    runtimeId: '2022.10',
    checkMatch: '**/*.check.ts',
    browserChecks: {
      testMatch: '**/__checks__/*.spec.ts', // this matches any Playwright spec-files and automagically creates a Browser check
    },
  },
  cli: {
    runLocation: 'eu-west-1',
  },
}

module.exports = config