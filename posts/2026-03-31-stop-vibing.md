---
title: Stop Vibing - How I Actually Use Claude Code
date: 2026-03-31
tags: [claude, claude-code, ai]
excerpt: How I leverage AI to quickly investigate issues for my team
---

## The workflow

Here is my core workflow in 3 simple steps.

1. Pull in context, file pointers, logs, metrics, traces, get Claude familiar with the problem and where the code lives.
2. Ask follow up questions, steer the investigation and try to come up with a plan for the changes, or the locate where the root cause of the bug lives.
3. Generate next steps, write a doc, ticket or prompt.

The other day I noticed that we had a background task take 17 minutes to complete, the P99 for this area of our codebase is typically under 2 minutes. So I grabbed the trace id from datadog and asked Claude `Hey, can you investigate this trace X using the datadog mcp?` Then off to the races while I made some coffee.

It was able to read all the logs around that trace, pull in the waterfall graphs and due to my setup it was reading the code related to the trace. After a few minutes and a couple follow up questions it was able to identify 6 areas of improvement each around N+1 query issues for a larger customer import. Lastly I asked Claude to write a ticket for each of these issues and assign it to the Performance Improvement Epic in our Jira backlog. I was able to complete this work in 15 minutes.

## The setup

### Claude Rules

This seems to be a little known feature of Claude, but I've seen consistent adherence to the rules I've written. This will need to be specific to your codebase and how you like to write code but please take advantage of these. They are really effective when you've setup appropriate paths using the YAML formatter. You can learn more about [rules](https://code.claude.com/docs/en/memory#set-up-rules) and I've found a few blogs that have some more deep dives into them [How Claude Code rules actually work](https://joseparreogarcia.substack.com/p/how-claude-code-rules-actually-work)

For me I've setup a basic "workflow" and "testing" rule that do most of the heavy lifting.

```
# Workflow

- Always write tests before making any changes
- Always build and typecheck the project when you've made code changes
- Always run tests related to the code changes before you are done
- Prefer running single tests, and not the whole test suite, for performance
```

```
# Testing

- Keep all tests simple and minimal
- Prefer writing parameterized tests over multiple describe / it blocks
- Repeated test setup code should be abstracted to a shared function
- Do not make any assertions on log statements
- Do not write tests that do not add value that simple TS typechecking provides
```

### MCP servers

Recently I've experienced a huge benefit from having MCP servers for Jira, Datadog & Notion. Being able to reach for and pull in context from Datadog, especially looking at traces and waterfalls, has made identifying performance issues easier and more efficient. I highly suggest looking into setting up the [Datadog](https://docs.datadoghq.com/bits_ai/mcp_server/), [Jira](https://www.atlassian.com/blog/announcements/remote-mcp-server), and [Notion](https://github.com/makenotion/notion-mcp-server) MCP servers — the combination of all three has been a force multiplier for investigation work.

### Skills

I've also discovered that Claude has a few plugins and skills that have helped improve my workflow. The "superpowers" plugin kicks off frequently and has been really powerful. Then I found a few others: `skill-improver` and `claude-md-management`.

I've used the skill-improver to help generate 3 custom skills — `write:doc`, `write:ticket`, `write:prompt` — each representing the final state of an investigation with Claude:

- **`write:prompt`** — if I feel I could quickly fix the issue (small bug or simple refactor), I'll use this and kick off a separate CI process to implement the change
- **`write:ticket`** — if the work needs more investigation and dedicated sprint time, this leverages the Jira MCP and creates the ticket with all fields filled out
- **`write:doc`** — if I'm not quite sure what to do next, I'll write a doc and save it to my [Obsidian](https://obsidian.md) vault for future reference

### CLAUDE.md

I've used the `claude-md-management` skill to generate a personal CLAUDE.md file that helps Claude understand the products, features, and keywords I use — with a mapping of where that code lives in our monorepo. This has helped me write more casual prompts without always needing to provide file pointers as references.
