# Examples

## External Agent Plugin

An example external Agent plugin lives at:

- [`plugins/reverse-text.agent.mjs`](./plugins/reverse-text.agent.mjs)

To load it:

```bash
export AGENT_PLUGIN_PATHS="$(pwd)/examples/plugins/reverse-text.agent.mjs"
npm run dev:backend
```

Then call `reverse_text` through `/api/v1/agents/call`.
