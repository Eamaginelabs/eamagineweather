# Use smaller base image and optimize for Railway
FROM golang:1.22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go mod files first (for better caching)
COPY go.mod go.sum ./

# Download dependencies with timeout
RUN go mod download

# Copy only necessary files to reduce context
COPY . .

# Generate Prisma client and build in one step
RUN go run github.com/steebchen/prisma-client-go generate && \
    CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

# Use distroless for minimal production image
FROM alpine:3.18

# Install only essential packages
RUN apk --no-cache add ca-certificates tzdata && \
    addgroup -g 1001 -S golang && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G golang -g golang golang

WORKDIR /app

# Copy binary with correct permissions
COPY --from=builder --chown=golang:golang /app/main /app/main

# Switch to non-root user
USER golang

# Expose port
EXPOSE 8080

# Command to run
CMD ["/app/main"]