#!/bin/sh

# This script creates the necessary tables in the database. It will only run once

if [ ! -f "./tables_created" ]; then
    echo "Setting up database..."
    node ./database_setup.js || {
        echo "Failed to set up the database. Please check the logs for errors."
        exit 1
    }
    touch "./tables_created"
fi