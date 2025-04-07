#!/bin/bash

# Check if .env file exists
echo "Checking .env file..."
if [ -f ".env" ]; then
    echo ".env file exists"
    # List the variables without showing their values
    cat .env | grep -v "=" | sort
else
    echo ".env file does not exist"
fi

# Check if .env.example exists
echo "\nChecking .env.example file..."
if [ -f ".env.example" ]; then
    echo ".env.example file exists"
    # List the variables without showing their values
    cat .env.example | grep -v "=" | sort
else
    echo ".env.example file does not exist"
fi
