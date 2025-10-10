This is an n8n node. There are actually 3 nodes:
- The main OneShot.node.ts with the majority of the methods. 
- OneShotSynch.node.ts, which duplicates functions from the main node, but has 2 exit paths, one for success and one for failure.
- OneShotWebhook.node.ts, which is a webhook reciever/trigger node.

m2mGatewaySpec.yaml is the actual API we build against, and should always be referenced.

There are two major divisions in the source, which is in nodes/OneShot, "descriptions" and "executions". Both are divided by the major themes of 1Shot API, which are:
- Chains
- Contract Events
- Contract Methods
- Prompts
- Structs
- Transactions
- Wallets
- Webhooks

Executions is tied to actual API calls, with 2 versions.
- apiMethod(): A function that just wraps the API call
- apiMethodOperation(): A function that takes the parameters from the n8n node form and packages them for the apiMethod() call.

Descriptions defines the n8n form.
