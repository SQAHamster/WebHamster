#!/bin/bash
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
docker run -it --rm -v $SCRIPT_DIR:/data node:14 bash -c "cd /data; npm i -g typescript; npm i; tsc; rm .gitignore; rm -rf .git;"
