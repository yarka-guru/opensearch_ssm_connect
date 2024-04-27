# AWS Environment Selector and Command Executor

This Node.js application allows you to select an AWS environment and execute various AWS commands within that environment. The environments are read from your AWS configuration file, and the application uses the `aws-vault` tool to manage your AWS credentials securely.

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js: You can download it from the [official website](https://nodejs.org/).
- `aws-vault` tool: You can install it following the instructions on the [official GitHub page](https://github.com/99designs/aws-vault).
- AWS CLI: You can install it following the instructions on the [official AWS page](https://aws.amazon.com/cli/).

Also, ensure that your AWS configuration file (`~/.aws/config`) is appropriately set up with the environments you want to use.

## Installation

You can install this application globally using npm:

```bash
npm install -g opensearch_ssm_connect
```

1. Select the environment you want to use. The application will then execute a series of AWS commands within that environment.

Given your provided code, here's how to connect to the database:

## Connecting to the OpenSearch

1. Invoke `opensearch_ssm_connect` in your terminal:

   ```bash
   opensearch_ssm_connect
   ```

   The application will read your AWS configuration file and prompt you to select an environment.

2. Select the environment you want to connect to. The application will then execute a series of AWS commands within that environment. It will do the following:

   - Extract the environments from the AWS configuration file
   - Display the connection credentials and the connection url
   - Get the ID of the bastion instance
   - Get the endpoint of the OpenSearch domain
   - Start a port forwarding session to the OpenSearch domain

3. After you've selected an environment and the AWS commands have been executed, you will receive the connection information. Here is an example of the output:

   ```
   You can access Kibana Dashboards by the link https://localhost:<port>/_dashboards/
   Login: <login>
   Password: <password>
   ```

4. Use the provided connection string and password to connect to your Kibana dashboards via browser of your choice.

Please note: Make sure you accept certificate on the first connection. 

## Requirements

This application requires the following Node.js modules:

- `child_process`: For spawning child processes to execute AWS commands.
- `inquirer`: For prompting the user to select an environment.
- `fs`: For reading the AWS configuration file.
- `os`: For getting the user's home directory.
- `path`: For working with file paths.

These modules will be installed automatically when you install the application with npm.

## How It Works

The application first reads the AWS configuration file and extracts the environments from it. It then prompts the user to select an environment.

After the user selects an environment, the application executes a series of AWS commands within that environment using `aws-vault`. These commands include:

- Describing EC2 instances to get the ID of the bastion instance.
- Describing OpenSearch domain to get the endpoint.
- Starting an AWS SSM session to forward a local port to the OpenSearch domain.

The application logs the output of each command and any errors that occur.