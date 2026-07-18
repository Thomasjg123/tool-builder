## General Guidelines

- For any command expected to run $>5$s or produce voluminous output, use the tmux workflow in @how-to-run-long-running-programs.md to enable background execution and multitasking.
- Do not use `nohup` or `&` to run commands in the background; instead, use the tmux workflow.

## Repository exploration

Never use:

- ls -R
- find . without exclusions
- tree from the repository root

These produce excessive output.

Instead use:

- git ls-files
