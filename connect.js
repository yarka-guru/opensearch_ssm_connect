#!/usr/bin/env node

// Import necessary modules
import { spawn } from 'child_process'
import inquirer from 'inquirer'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { envPortMapping, REGION, DOMAIN_NAME } from './envPortMapping.js'

// Get the path to the AWS config file
const awsConfigPath = path.join(os.homedir(), '.aws', 'config')
const awsConfig = fs.readFileSync(awsConfigPath, 'utf-8')

// Extract environments from AWS config file
const ENVS = awsConfig.split('\n').filter(line => line.startsWith('[') && line.endsWith(']'))
  .map(line => line.slice(1, -1).replace('profile ', ''))

// Prompt the user to select an environment
inquirer.prompt([
  {
    type: 'list',
    name: 'ENV',
    message: 'Please select the environment:',
    choices: ENVS
  }
]).then((answers) => {
  const ENV = answers.ENV
  console.log(`You selected: ${ENV}`)

  const matchedSuffix = Object.keys(envPortMapping).find(suffix => ENV.endsWith(suffix))
  const portNumber = envPortMapping[matchedSuffix] || '9200'

  const awsVaultExecCommand = `aws-vault exec ${ENV} --`
  const opensearchEndpointCommand = `aws opensearch describe-domain --region ${REGION} --domain-name ${DOMAIN_NAME} --query 'DomainStatus.Endpoints.vpc' --output text`
  const command = `${awsVaultExecCommand} ${opensearchEndpointCommand}`

  const process = spawn('sh', ['-c', command])
  let sessionId = ''

  process.stdout.on('data', (data) => {
    const endpoint = data.toString().trim()
    const instanceIdCommand = `aws ec2 describe-instances --region ${REGION} --filters "Name=tag:Name,Values='*bastion*'" "Name=instance-state-name,Values=running" --query "Reservations[].Instances[].[InstanceId]" --output text`
    const instanceIdProcess = spawn('sh', ['-c', `${awsVaultExecCommand} ${instanceIdCommand}`])

    instanceIdProcess.stdout.on('data', (data) => {
      const INSTANCE_ID = data.toString().trim()
      if (!INSTANCE_ID) {
        console.error('Failed to find a running instance with tag Name=*bastion*.')
        return
      }

      const portForwardingCommand = `aws ssm start-session --target ${INSTANCE_ID} --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters "host=${endpoint},portNumber='443',localPortNumber='${portNumber}'" --cli-connect-timeout 0`
      const portForwardingProcess = spawn('sh', ['-c', `${awsVaultExecCommand} ${portForwardingCommand}`])

      portForwardingProcess.stderr.on('data', (data) => {
        console.error(`Port Forwarding Error: ${data.toString()}`)
      })
    })

    instanceIdProcess.stderr.on('data', (data) => {
      console.error(`Instance ID Error: ${data.toString()}`)
    })
  })

  process.stderr.on('data', (data) => {
    console.error(`Error: ${data.toString()}`)
  })

  process.on('close', () => {
    console.log(`You can access Kibana Dashboards by the link https://localhost:${portNumber}/_dashboards/`)
    console.log('Login: Admin')
    console.log('Password: Supersecret1!')
  })
})
