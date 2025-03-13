#!/bin/bash

# This script pushes the Reel Maker repository to GitHub

# Set up the remote repository
git remote add origin https://github.com/leoasa/reel-maker.git

# Push the code to GitHub
git push -u origin main

echo "Repository pushed to GitHub successfully!"
echo "Visit https://github.com/leoasa/reel-maker to see your repository." 