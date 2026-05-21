# Contributing to Inflection

Thank you for taking the time to contribute. This document covers how to get started, what kinds of contributions are most useful, and how to submit your work.

---

## Before you start

Please open an issue before beginning significant work. This gives the maintainers a chance to confirm the direction is right and prevents you from spending time on something that will not be merged.

For small fixes — typos, documentation corrections, obvious bugs — you can open a pull request directly.

---

## What is most useful right now

- **Framework feedback** — if you think a dimension is wrong, missing, or should be weighted differently, open an issue and explain your reasoning. These are the discussions that improve the model.
- **New assessment questions** — well-reasoned additions or refinements to the 21 questions across the 7 dimensions.
- **Translations** — the assessment in other languages so more teams can use it.
- **Bug reports** — clear, reproducible descriptions of problems.
- **Documentation improvements** — anything that makes the project easier to understand or run locally.

---

## Getting the code running locally

Follow the setup instructions in [README.md](README.md). If you run into a step that is unclear or broken, that is worth a pull request too.

---

## Submitting a pull request

1. Fork the repository.
2. Create a branch with a short, descriptive name: `fix/assessment-scoring` or `feature/french-translation`.
3. Make your changes. Keep commits focused — one logical change per commit.
4. Make sure the project still runs and typechecks: `pnpm run typecheck`.
5. Open a pull request against `main`. Fill in the template — describe what changed and why.

---

## Code style

- TypeScript strict mode is on. No `any` without a comment explaining why.
- No `console.log` in server code — use the request logger.
- Keep components focused. If a file is getting long, that is usually a sign it should be split.
- Tailwind classes over custom CSS wherever possible.

---

## Reporting a bug

Open an issue and include:

- What you did
- What you expected to happen
- What actually happened
- Your Node.js version, OS, and browser if relevant

---

## Code of conduct

Be direct, be respectful, and be constructive. Disagreement about the framework is welcome and expected. Personal attacks are not. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for the full policy.

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
