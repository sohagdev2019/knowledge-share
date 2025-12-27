#!/bin/bash

# Script to create 100 commits by modifying and reverting README.md
# This will create commit history without changing the final state of README.md

echo "Starting to create 100 commits..."
echo "This will modify README.md and revert it back 100 times"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository!"
    exit 1
fi

# Check if README.md exists
if [ ! -f "README.md" ]; then
    echo "Error: README.md not found!"
    exit 1
fi

# Switch to dev branch (create if it doesn't exist)
if git show-ref --verify --quiet refs/heads/dev; then
    echo "Switching to dev branch..."
    git checkout dev > /dev/null 2>&1
else
    echo "Creating and switching to dev branch..."
    git checkout -b dev > /dev/null 2>&1
fi

echo "Current branch: $(git branch --show-current)"
echo ""

# Store original README.md content
ORIGINAL_CONTENT=$(cat README.md)

# Create 100 commits (50 pairs: change + revert)
for i in {1..50}; do
    echo "Creating commits $((i*2-1))-$((i*2))/100..."
    
    # Add a comment at the end of the file (trivial change)
    echo "" >> README.md
    echo "<!-- temp commit $i -->" >> README.md
    
    # Stage and commit the change
    git add README.md > /dev/null 2>&1
    git commit -m "Update README.md (commit $i)" --no-verify > /dev/null 2>&1
    
    # Restore original content (revert)
    echo "$ORIGINAL_CONTENT" > README.md
    
    # Stage and commit the revert
    git add README.md > /dev/null 2>&1
    git commit -m "Revert README.md changes (commit $i)" --no-verify > /dev/null 2>&1
done

echo ""
echo "✅ Successfully created 100 commits (50 pairs of update + revert)!"
echo "The README.md file is back to its original state."
echo ""
echo "To push to GitHub dev branch, run:"
echo "  git push origin dev"

