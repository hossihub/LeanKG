# LeanKG Benchmark Testing

End-to-end testing framework for LeanKG MCP tools via Kilo AI agent.

## Structure

```
tests/benchmark/
├── Makefile              # make benchmark commands
├── src/
│   ├── lib.rs           # Module exports
│   ├── mcp_tools.rs     # MCP tool unit tests
│   └── token_tracker.rs # Token tracking utilities
├── prompts/
│   └── queries.yaml     # Test queries with expected outcomes
├── scripts/
│   ├── run_benchmark.sh
│   ├── extract_tokens.py
│   └── compare_results.py
└── results/             # Generated results
```

## Commands

```bash
# Run all benchmarks
make -f tests/benchmark/Makefile benchmark

# Run MCP tool unit tests only
make -f tests/benchmark/Makefile benchmark-mcp

# Run E2E tests (manual Kilo interaction)
make -f tests/benchmark/Makefile benchmark-e2e

# Generate comparison report
make -f tests/benchmark/Makefile benchmark-ab

# Clean results
make -f tests/benchmark/Makefile benchmark-clean
```

## Kilo E2E Testing

1. Ensure LeanKG is indexed: `cargo run -- index ./src`
2. Start Kilo: `kilo`
3. Run queries and export sessions: `kilo export <session_id> > results/<query_id>.json`
4. Compare results: `python3 scripts/compare_results.py results/`

## Metrics

- Token savings (LeanKG vs baseline grep)
- Correctness (100% match to expected files/concepts)
- Tool invocation verification
