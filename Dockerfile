FROM rust:1-bookworm as builder
WORKDIR /app

# Install Node.js for UI build
RUN apt-get update && apt-get install -y clang git curl && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# Copy UI source (for build)
COPY ui/ ./ui/
COPY Cargo.toml Cargo.lock ./

# Build UI
WORKDIR /app/ui
RUN npm install && npm run build

# Build Rust
WORKDIR /app
COPY src ./src
RUN cargo build --release && strip target/release/leankg

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates git && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/leankg /usr/local/bin/
COPY --from=builder /app/ui/dist /app/ui/dist

ENV PORT=8080
EXPOSE 8080

CMD ["leankg", "web"]
