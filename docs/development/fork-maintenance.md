# Fork Maintenance Guide

This guide helps maintain our Chat SDK fork while staying in sync with the upstream Next.js AI Chatbot repository. Following these practices will minimize conflicts and make rebasing easier.

## Core Principles

1. **Minimize merge conflicts** - Structure changes to avoid conflicts with upstream
2. **Contribute upstream** - Send improvements back to reduce maintenance burden
3. **Atomic commits** - One change per commit for easier rebasing
4. **Document divergence** - Track why we differ from upstream

## Development Best Practices

### 1. Atomic Commits

Each commit should do ONE thing:

```bash
# ✅ Good - Single purpose commits
git commit -m "feat: Add custom artifact type for spreadsheets"
git commit -m "fix: Correct streaming buffer overflow"
git commit -m "deps: Update @ai-sdk/react to 3.1.0"

# ❌ Bad - Multiple changes in one commit
git commit -m "Add spreadsheet artifact and update AI SDK and fix streaming"
```

**Why it matters**: When upstream updates the AI SDK, you can simply drop your update commit instead of resolving conflicts in a commit that also contains features.

### 2. Categorize Your Changes

Use clear commit prefixes to identify change types:

- `feat:` - New features unique to our fork
- `fix:` - Bug fixes (identify if upstream or downstream)
- `config:` - Configuration changes
- `temp:` - Temporary changes that should be removed later

Example:
```bash
# Downstream feature
git commit -m "feat: Add Excel import functionality"
```

### 3. File Organization Strategy

Structure your changes to minimize conflicts:

```
# Prefer adding new files over modifying existing ones
components/
├── chat/                    # Upstream components
│   └── chat-input.tsx      # Try to avoid modifying
├── custom/                  # Our additions
│   ├── excel-import.tsx    # New features here
│   └── advanced-chat.tsx   # Extensions here
```

When you must modify upstream files:
- Keep changes minimal and well-documented
- Add clear comments marking our modifications
- Consider using composition over modification

```tsx
// ❌ Avoid: Heavily modifying upstream component
export function ChatInput() {
  // 50 lines of upstream code mixed with 20 lines of our changes
}

// ✅ Better: Wrap or extend
import { ChatInput as UpstreamChatInput } from './chat-input';

export function ChatInput(props) {
  // Our pre-processing
  const enhancedProps = useEnhancedProps(props);

  return (
    <div className="our-wrapper">
      <UpstreamChatInput {...enhancedProps} />
      <OurCustomAddition />
    </div>
  );
}
```

### 4. Configuration Over Code Changes

Use environment variables and configuration files instead of hardcoding:

```typescript
// ❌ Avoid: Hardcoding our specific values
const API_ENDPOINT = 'https://our-api.example.com';

// ✅ Better: Configurable
const API_ENDPOINT = process.env.CUSTOM_API_ENDPOINT || 'https://api.example.com';
```

### 5. Track Upstream Changes

Maintain a document tracking our divergence:

```markdown
# Upstream Divergence Log

## Modified Files
- `app/api/chat/route.ts` - Added custom authentication (line 45-67)
- `components/chat.tsx` - Extended for Excel support (line 123-145)

## Why We Diverged
- Custom auth: Required for enterprise SSO integration
- Excel support: Core business requirement

## Upstream Contributions
- [ ] Streaming improvements (PR planned)
- [x] Bug fix for memory leak (PR #123 merged)
```

## Rebase Workflow

### 1. Prepare for Rebase

```bash
# Create a clean working branch
git checkout -b rebase-upstream-v2.0.0

# Ensure your main is up to date
git checkout main
git pull origin main

# Fetch upstream changes
git remote add upstream https://github.com/vercel/ai-chatbot.git
git fetch upstream
```

### 2. Identify Your Changes

```bash
# List all commits since last upstream sync
git log --oneline upstream/main..main

# Group commits by type
git log --oneline --grep="^feat:" upstream/main..main
git log --oneline --grep="^upstream-fix:" upstream/main..main
```

### 3. Clean Up Before Rebasing

Squash related commits:

```bash
# Interactive rebase to clean up our commits
git rebase -i upstream/main

# In the editor, squash fix commits into their features
pick abc123 feat: Add Excel import
squash def456 fix(downstream): Fix Excel parsing
squash ghi789 fix(downstream): Handle Excel edge case
pick jkl012 feat: Add custom artifacts
```

### 4. Perform the Rebase

```bash
# Rebase onto new upstream version
git rebase upstream/v2.0.0

# If conflicts occur, resolve them carefully
# After resolving each conflict:
git add .
git rebase --continue
```

### 5. Test Thoroughly

After rebasing:
- Run all tests: `pnpm test:e2e`
- Test all custom features manually
- Verify upstream features still work
- Check for any subtle behavior changes

## Contributing Upstream

### What to Contribute

1. **Bug fixes** that affect the original functionality
2. **Performance improvements** that benefit all users
3. **General features** that align with project goals
4. **Documentation improvements**

### How to Contribute

1. **Isolate the change**:
   ```bash
   # Create a clean branch from upstream
   git checkout -b upstream-contribution upstream/main

   # Cherry-pick only the relevant commit
   git cherry-pick <commit-hash>
   ```

2. **Ensure it meets upstream standards**:
   - Follows their coding style
   - Includes tests
   - Has proper documentation

3. **Submit PR with context**:
   - Explain the problem/improvement
   - Show before/after if applicable
   - Reference any related issues

## Maintenance Schedule

- **Weekly**: Review and categorize new commits
- **Bi-weekly**: Check for upstream updates
- **Monthly**: Clean up and squash related commits
- **Quarterly**: Major rebase and cleanup

## Emergency Procedures

### When Rebase Fails

1. **Save your progress**:
   ```bash
   git branch backup-rebase-attempt
   ```

2. **Abort and analyze**:
   ```bash
   git rebase --abort
   git diff upstream/main...main --name-only
   ```

3. **Consider alternatives**:
   - Cherry-pick specific commits
   - Recreate features on fresh upstream
   - Temporarily maintain two branches

### Conflict Resolution Strategy

1. **Understand both changes** - Read upstream changes and our modifications
2. **Prefer upstream when possible** - Reduce future conflicts
3. **Document resolution** - Add comments explaining conflict resolution
4. **Test thoroughly** - Conflicts often introduce subtle bugs

## Best Practices Summary

1. **Write atomic commits** - One change per commit
2. **Categorize changes clearly** - Use consistent prefixes
3. **Minimize upstream file changes** - Add rather than modify
4. **Document divergence** - Track what and why
5. **Contribute back** - Reduce maintenance burden
6. **Rebase regularly** - Don't let changes accumulate
7. **Test thoroughly** - After every rebase
8. **Maintain relationships** - Engage with upstream maintainers

Following these practices will make maintaining our fork sustainable and reduce the time spent on conflict resolution.

## Handling Breaking Changes

When upstream introduces breaking changes:

### 1. Assess Impact Early

```bash
# Check upstream changelog
git log upstream/main --oneline --grep="BREAKING"

# Diff the dangerous files
git diff v2.0.0..upstream/main -- package.json tsconfig.json next.config.js
```

### 2. Plan Migration Strategy

Create a migration plan before rebasing:

```markdown
# Breaking Change: AI SDK v3 Migration

## Impact Assessment
- All `useChat` hooks need updating
- Streaming API has changed
- Provider configuration restructured

## Migration Steps
1. Update our custom hooks first
2. Modify streaming handlers
3. Update provider configuration
4. Run full test suite

## Rollback Plan
- Keep branch `pre-ai-sdk-v3` as backup
- Can revert via patch if needed
```

### 3. Consider Gradual Migration

For major breaking changes, consider:
- Maintaining compatibility layers temporarily
- Using feature flags to toggle between old/new
- Gradual rollout with monitoring

## Quick Reference

### Common Commands

```bash
# Add upstream remote (one-time setup)
git remote add upstream https://github.com/vercel/ai-chatbot.git

# Fetch latest upstream changes
git fetch upstream

# See commits unique to our fork
git log upstream/main..main --oneline

# Check how far behind upstream we are
git rev-list --count HEAD..upstream/main

# Interactive rebase to clean up commits
git rebase -i upstream/main

# Cherry-pick specific upstream commits
git cherry-pick <commit-hash>

# Create a patch file of our changes
git format-patch upstream/main --stdout > our-changes.patch

# See which files we've modified
git diff upstream/main --name-only

# Compare specific file with upstream
git diff upstream/main -- path/to/file.tsx
```

### Commit Message Examples

```bash
# Feature unique to our fork
git commit -m "feat: Add Excel import functionality for data analysis"

# Fix for our custom feature
git commit -m "fix: Correct Excel date parsing in import"

# Fix that should go upstream
git commit -m "upstream-fix: Prevent memory leak in streaming handler"

# Temporary workaround
git commit -m "temp: Disable problematic test until upstream fix"

# Configuration change
git commit -m "config: Add environment variable for custom API endpoint"
```
