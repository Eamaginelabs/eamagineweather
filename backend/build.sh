#!/bin/bash

echo "Generating Prisma client..."
go run github.com/steebchen/prisma-client-go generate

echo "Building application..."
go build -o main .

echo "Build complete!"