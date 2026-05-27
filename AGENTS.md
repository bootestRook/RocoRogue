# Agent Notes

- Test/verification screenshots must not be saved in the repository root. If screenshots need to be written, use a dedicated artifact directory such as `test-results/screenshots/`, or delete temporary screenshots after verification.
- For UI-visible changes, final verification must use the actual `run.bat` entrypoint. Run `cmd /c run.bat`, use the URL it opens/writes via `.rocorogue-port`, and verify that page; do not treat a different localhost URL, query string, or alternate server as sufficient.
- Do not invent project facts, data values, defaults, or user intent. Use the actual project files and tables as the source of truth; if the source is missing or inconsistent, report that directly instead of guessing, fabricating fallback values, or silently changing semantics.
- 禁止乱动用户要求修改的功能以外的文件、行为、资源、样式、默认值、文案、数据或功能。
