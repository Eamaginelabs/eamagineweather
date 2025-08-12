# Use the official Go image
FROM golang:1.22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Generate Prisma client
RUN go run github.com/steebchen/prisma-client-go generate

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Production stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy schema for runtime
COPY --from=builder /app/schema.prisma .

# Expose port
EXPOSE 8080

# Command to run
CMD ["./main"]