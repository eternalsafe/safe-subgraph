#!/bin/bash

NETWORK=mainnet
PROJECT_ID=safe-subgraph
ACCESS_TOKEN=$THEGRAPH_ACCESS_TOKEN
DEBUG=0

while (( "$#" )); do
  case "$1" in
    -n|--network)
      if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
        NETWORK=$2
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    -a|--access-token)
      if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
        ACCESS_TOKEN=$2
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    -d|--debug)
      if [ -n "$2" ] && [ ${2:0:1} != "-" ]; then
        DEBUG=1
        DEBUG_FORK=$2
        shift 2
      else
        echo "Error: Argument for $1 is missing" >&2
        exit 1
      fi
      ;;
    -*|--*=) # unsupported flags
      echo "Error: Unsupported flag $1" >&2
      exit 1
      ;;
    *) # preserve positional arguments
      PARAMS="$PARAMS $1"
      shift
      ;;
  esac
done

eval set -- "$PARAMS"

graph auth --studio $ACCESS_TOKEN

if [ $DEBUG -eq "1" ]; then
    graph deploy --studio $PROJECT_ID --network $NETWORK --debug-fork $DEBUG_FORK
else
    graph deploy --studio $PROJECT_ID --network $NETWORK
fi

echo "success!"
