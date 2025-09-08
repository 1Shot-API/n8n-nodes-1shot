[![Watch the tutorial](https://img.youtube.com/vi/WLkwqC4B2r4/maxresdefault.jpg)](https://youtu.be/WLkwqC4B2r4)

# n8n-nodes-1shot

The [1Shot API](https://1shotapi.com) n8n node lets you read and write to any EVM blockchain from your n8n workflows. 1Shot API is a powerful managed wallet and transaction service for the EVM ecosystem; it ensures transactions are confirmed (handling retries and gas optimization) and sends webhook callbacks when they are finalized, making it perfect for use in any AI workflow platform. 

It also allows smart contract functions to be used like tools by agents; 1Shot Prompts provides a contract library with detailed prompts at the contract, function, input and output level so that agents and LLMs can better reason about how to use smart contracts to fullfil a user task. Additionally, 1Shot Prompts lets humans and agents search for smart contracts semantically, so you don't have manually find your target smart contract by parsing through blockscanners. 

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  <!-- delete if no auth needed -->  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history)  <!-- delete if not using this section -->  

## Installation

<p align="center">
  <img src="/static/install.gif" alt="Install the 1Shot API node">
</p>

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

To install the 1Shot API node, go to your user settings and select *Community nodes* in the left-hand navigation bar. Search for `n8n-nodes-1shot`. Click install.

## Operations

The 1Shot API node supports the following operations:
- manage your 1Shot API wallets
- semantically search for smart contracts on specific networks and import them to your account as tools
- read data from and execute transaction on smart contract functions

## Credentials

<p align="center">
  <img src="/static/credentials.gif" alt="Authenticating your 1Shot API node">
</p>

You must authenticate your 1Shot API node against your business account in 1Shot API. Create a free account then create a new [API key and secret](https://app.1shotapi.com/api-keys). Then grab your business id from the [business' details](https://app.1shotapi.com/organizations) page. 

Enter these three quantities into the 1Shot node to connect n8n. 

## Compatibility

The n8n 1Shot API community node is compatible with n8n version 1.95.3 or later. 

## Usage

Check out our [documentation](https://docs.1shotapi.com/automation/n8n.html) for more information and examples of how you can use 1Shot API to automate onchain tasks with n8n.

### x402 Workflow 

<p align="center">
  <img src="/static/n8n-x402.gif" alt="x402 workflow">
</p>

Try out the [x402 workflow](https://n8n.io/workflows/5389-monetize-workflows-with-x402-payment-protocol-and-1shot-api/) to see how 1Shot API can simulate and execute onchain transactions. Import the json file directly into an n8n workflow, then authenticate the 1Shot API nodes against your 1Shot API account. Be sure to set the correct *Contract Method Name* in the 1Shot API selector box for both the Simulate and Submit stages as explained in the [tutorial video](https://youtu.be/m3ThthLtj3g). 

```sh
# example curl call to your n8n webhook endpoint
# be sure to change the URL to your n8n webhook url and set a proper x-payment header
curl -X GET \
  https://hook.us2.make.com/5qimwe147tq9ew7k9bwarnb3rtr6hi3g \
  -H "x-payment: eyJ4NDAyVmVyc2lvbiI6MSwic2NoZW1lIjoiZXhhY3QiLCJuZXR3b3JrIjoiYmFzZS1zZXBvbGlhIiwicGF5bG9hZCI6eyJzaWduYXR1cmUiOiIweDE0ZjNkNGUyODNlMTgyNTdiMTBlMTkyNzRlNzgyZTU0YTQyOWExZDkzZDgzYTczYjY5YTAyOTYxY2IyNDYzOTI1ODU0M2Y3NjhmYTQyMzVkNTQzYzM2MWQ4ZGRhNTE2MzdjMWE3OWY1MTY0YTkyYTRhZGYxZDE4ZTBhYjQ4YzQyMWIiLCJhdXRob3JpemF0aW9uIjp7ImZyb20iOiIweDU1NjgwYzZiNjlkNTk4YzBiNDJmOTNjZDUzZGZmM2QyMGUwNjliNWIiLCJ0byI6IjB4RTkzNmU4RkFmNEE1NjU1NDY5MTgyQTQ5YTUwNTA1NUI3MUMxNzYwNCIsInZhbHVlIjoiNTAwMDAiLCJ2YWxpZEFmdGVyIjoiMTc1MTU3NDI2MiIsInZhbGlkQmVmb3JlIjoiMTc1MTU3NDM4MiIsIm5vbmNlIjoiMHg4NDA5NmMwODBkNDg5NTg1MmRiNGRkZGVmN2Q3NmM1MzM4OWVmZjE4YWIwMTk0MGJhY2EwYmRhYmQ4OTRhZmYxIn19fQ==" \
  -H "User-Agent: CustomUserAgent/1.0" \
  -H "Accept: application/json"

curl -X GET \
  https://n8n.1shotapi.dev/webhook-test/92c5ca23-99a7-437d-85da-84aef8bd2a25 \
  -H "x-payment: eyJ4NDAyVmVyc2lvbiI6MSwic2NoZW1lIjoiZXhhY3QiLCJuZXR3b3JrIjoiYmFzZS1zZXBvbGlhIiwicGF5bG9hZCI6eyJzaWduYXR1cmUiOiIweDE0ZjNkNGUyODNlMTgyNTdiMTBlMTkyNzRlNzgyZTU0YTQyOWExZDkzZDgzYTczYjY5YTAyOTYxY2IyNDYzOTI1ODU0M2Y3NjhmYTQyMzVkNTQzYzM2MWQ4ZGRhNTE2MzdjMWE3OWY1MTY0YTkyYTRhZGYxZDE4ZTBhYjQ4YzQyMWIiLCJhdXRob3JpemF0aW9uIjp7ImZyb20iOiIweDU1NjgwYzZiNjlkNTk4YzBiNDJmOTNjZDUzZGZmM2QyMGUwNjliNWIiLCJ0byI6IjB4RTkzNmU4RkFmNEE1NjU1NDY5MTgyQTQ5YTUwNTA1NUI3MUMxNzYwNCIsInZhbHVlIjoiNTAwMDAiLCJ2YWxpZEFmdGVyIjoiMTc1MTU3NDI2MiIsInZhbGlkQmVmb3JlIjoiMTc1MTU3NDM4MiIsIm5vbmNlIjoiMHg4NDA5NmMwODBkNDg5NTg1MmRiNGRkZGVmN2Q3NmM1MzM4OWVmZjE4YWIwMTk0MGJhY2EwYmRhYmQ4OTRhZmYxIn19fQ==" \
  -H "User-Agent: CustomUserAgent/1.0" \
  -H "Accept: application/json"
```

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* See the [1Shot API documentation](https://docs.1shotapi.com) for more information on its features. 

## Version history

latest version: `1.0.12`
