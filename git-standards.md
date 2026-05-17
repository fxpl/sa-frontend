---
description: Git policy for branching, commits, pushes, PRs, rebases, merges, gitignore, large-file checks, history rewrites, branch protection, and repository workflow.
---

## 0) Repository Structure

The GitHub repository's root contains `sa-frontend` as its first-level project folder. All Git operations (status, diff, add, commit, etc.) MUST resolve to a working directory that is at least the `sa-frontend` folder or a subfolder within it. 

## 1) Non-Negotiable Rules

- Branch name MUST be `kand_type_issue` with exactly one slash (no nested branch names).
- Ticket IDs are OPTIONAL in commit messages and MUST NOT appear in branch names.
- MUST run pull-first sync (`git pull origin <current-branch>`) before pushing or running any write operation that depends on remote branch state (see Section 6 for exemptions on local-only operations and new branches).
- MUST NEVER directly push to `main` by default; changes to `main` MUST go through a PR from another branch.

## 2) Branch Naming

Allowed types:
`feature`, `bugfix`, `hotfix`, `chore`, `docs`, `refactor`, `test`, `ci`, `release`

Rules:
- MUST be lowercase.
- MUST be kebab-case after `/`.
- MUST contain exactly one `/`.
- MUST NOT include ticket IDs.
- MUST branch from a user-confirmed base branch.
- If base branch is unspecified, assistant SHOULD suggest current branch and MUST ask user to confirm intended base branch before branch creation.

Examples:

```bash
# valid
kand/feature/user-authentication
kand/bugfix/login-validation-error
kand/chore/update-eslint-config

# invalid
Feature_UserAuth
feature_user_auth
feature/IS-123-login-fix
login-fix
```

## 3) Commit Messages

Preferred summary:
- `<type>: <summary>`
- optional ticket suffix: `<type>: <summary> [IS-123]`

Valid commit types (mapped from branch prefixes):

| Branch prefix | Commit type |
|---|---|
| `feature` | `feat` |
| `bugfix` | `fix` |
| `hotfix` | `fix` |
| `chore` | `chore` |
| `docs` | `docs` |
| `refactor` | `refactor` |
| `test` | `test` |
| `ci` | `ci` |
| `release` | `release` |

Additional commit-only types (no branch prefix equivalent): `style`, `perf`, `build`, `revert`.

Rules:
- Commit type MUST be one of the types listed above.
- Ticket ID is OPTIONAL (never mandatory).
- Summary MUST be imperative present tense.
- Summary SHOULD be <= 72 chars.
- Non-trivial commits SHOULD include body: why, approach/tradeoffs, side effects.

Required pre-commit context:

```bash
git status
git diff
git diff --staged
git log --oneline -10
```

## 4) `.gitignore` Policy

- The active repository root (lowest working folder tracked by Git) MUST have a `.gitignore`.

## 5) PR Gate

Before PR:
- rebased on latest base branch
- tests pass
    run them with command: yarn test
    if changes been made, update snapshots with " -u " flag.
- scope is relevant to branch name
- no accidental merge commits

Merge strategy: MUST use **squash merge** when merging PRs. This keeps the base branch history linear with one commit per PR.

Verification (replace `<base-branch>` with the actual base, e.g. `master`):

```bash
git pull origin <current-branch>
git log --oneline --merges origin/<base-branch>..HEAD
git diff --name-only origin/<base-branch>...HEAD
git log --oneline origin/<base-branch>..HEAD
```

PR description SHOULD include: what changed, why, testing, rollback notes.

## 6) Canonical Flow - Steps to push changes to Master

```bash

git checkout <base-branch>
git pull origin <base-branch>
git checkout -b feature/<short-description>

git status
git add <specific-files>
git diff --staged

# run large/data and .gitignore checks (sections 4-5)

git commit -m "add <summary>"

# sync with base branch before push
git fetch origin
git rebase origin/<base-branch>

# first push (branch is new, no remote tracking yet):
git push -u origin <branch-name>
# subsequent pushes (branch already exists on remote):
git pull origin <current-branch>
git push origin <branch-name>
# after rebase (history has diverged, force-with-lease required — do NOT pull first):
git push --force-with-lease

#If steps or error messages are unclear, check with Agent!

```

## 9) Non-Destructive Purge of Large Files from Current Branch History

Use only when large files were accidentally committed to the current branch.
*Note: Deleting a file in a new commit does not remove it from Git history. `git filter-repo` acts like a time machine, completely erasing the file from the branch's history as if it never existed.*

**Prerequisite:** `git filter-repo` is a third-party Python script. Assistant MUST verify it is installed (or ask the user to install it via `brew install git-filter-repo` or `pip install git-filter-repo`) before attempting to use it.

**Side effect:** `git filter-repo` removes the `origin` remote from the local config after rewrite. Assistant MUST re-add it (`git remote add origin <url>`) before pushing.

Hard rules:
- MUST ask for explicit user approval before rewrite.
- MUST scope rewrite to current branch only.
- MUST create backup branch before rewrite.
- MUST verify changes affect only intended files/commits.
- MUST NOT modify `main` or other branches.

Safe procedure:

```bash
git branch --show-current
git branch backup/<current-branch>-before-purge
git filter-repo --force --refs <current-branch> --path <large-file-path> --invert-paths
```

Multiple files:

```bash
git filter-repo --force --refs <current-branch> \
  --path file1 --path file2 --path file3 --invert-paths
```

Post-rewrite verification:

```bash
git log --oneline -- <large-file-path>
git rev-list --objects HEAD | grep "<large-file-or-pattern>"
git diff --name-only origin/main...HEAD
```

Required pre-push ask:
> "Rewrite is ready on `<branch>`, backup `<backup-branch>` exists, checks are clean. Approve `git push --force-with-lease`?"

If rewrite not approved (fallback):
1. `git rm --cached <file>`
2. add pattern to `.gitignore`
3. commit cleanup
4. document in PR that historical artifact remains in old commits

## 10) Recovery Quick Ops

Accidental merge commit from `main`:

```bash
git fetch origin
git rebase origin/main
```

Started branch from wrong base:

```bash
git checkout main
git pull origin main
git checkout -b feature/<new-branch>
git cherry-pick <commit1> <commit2>
```

Rebase conflict:

```bash
git status
git add <resolved-files>
git rebase --continue
# or
git rebase --abort
```

Delete old branch only after migration verification and explicit approval.

## 11) Repo Protection Baseline

`main` SHOULD enforce:
- required PR reviews
- required status checks
- no direct pushes
- no force pushes
- no deletion
