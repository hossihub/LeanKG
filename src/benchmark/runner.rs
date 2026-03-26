use crate::benchmark::data::{BenchmarkResult, OverheadResult};
use regex::Regex;
use std::error::Error;
use std::path::PathBuf;
use std::process::Command;

use crate::benchmark::data::PromptCategory;

pub struct BenchmarkRunner {
    opencode_path: PathBuf,
    output_dir: PathBuf,
}

impl BenchmarkRunner {
    pub fn new(output_dir: PathBuf) -> Self {
        Self {
            opencode_path: PathBuf::from("opencode"),
            output_dir,
        }
    }

    pub fn run_with_leankg(&self, prompt: &str) -> BenchmarkResult {
        let mut cmd = Command::new(&self.opencode_path);
        cmd.arg(prompt);

        let output = cmd.output().expect("Failed to execute opencode");

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        self.parse_opencode_output(&stdout, &stderr)
    }

    pub fn run_without_leankg(&self, prompt: &str) -> BenchmarkResult {
        let mut cmd = Command::new(&self.opencode_path);
        cmd.arg(prompt);
        cmd.env("LEANKG_DISABLED", "1");

        let output = cmd.output().expect("Failed to execute opencode");

        let stdout = String::from_utf8_lossy(&output.stdout);
        let stderr = String::from_utf8_lossy(&output.stderr);

        self.parse_opencode_output(&stdout, &stderr)
    }

    fn parse_opencode_output(&self, stdout: &str, stderr: &str) -> BenchmarkResult {
        let combined = format!("{}\n{}", stdout, stderr);

        let mut tokens = 0u32;
        let mut percent = 0f32;
        let mut time = 0f32;

        if let Some(token_match) = Regex::new(r"(\d{1,3}(?:,\d{3})*)\s+(\d+)%")
            .unwrap()
            .captures(&combined)
        {
            tokens = token_match[1].replace(',', "").parse().unwrap_or(0);
            percent = token_match[2].parse().unwrap_or(0f32);
        }

        if let Some(time_match) = Regex::new(r"Build.*?(\d+\.?\d*)s")
            .unwrap()
            .captures(&combined)
        {
            time = time_match[1].parse().unwrap_or(0f32);
        }

        BenchmarkResult {
            total_tokens: tokens,
            token_percent: percent,
            build_time_seconds: time,
            success: true,
        }
    }

    pub fn save_result(&self, result: &BenchmarkResult, name: &str) -> Result<(), Box<dyn Error>> {
        let json_path = self.output_dir.join(format!("{}.json", name));
        let md_path = self.output_dir.join(format!("{}.md", name));

        let json = serde_json::to_string_pretty(result)?;
        std::fs::write(&json_path, json)?;

        let md = format!(
            "# Benchmark Result: {}\n\nTokens: {}\nToken %: {}%\nTime: {}s\n",
            name, result.total_tokens, result.token_percent, result.build_time_seconds
        );
        std::fs::write(&md_path, md)?;

        Ok(())
    }

    pub fn save_comparison(
        &self,
        with_leankg: &BenchmarkResult,
        without_leankg: &BenchmarkResult,
        name: &str,
    ) -> Result<(), Box<dyn Error>> {
        let overhead = with_leankg.overhead(without_leankg);

        let comparison = serde_json::json!({
            "task": name,
            "with_leankg": with_leankg,
            "without_leankg": without_leankg,
            "overhead": overhead,
        });

        let json_path = self.output_dir.join(format!("{}-comparison.json", name));
        std::fs::write(&json_path, serde_json::to_string_pretty(&comparison)?)?;

        let md_path = self.output_dir.join(format!("{}-comparison.md", name));
        let md = format!(
            "# Benchmark Comparison: {}\n\n## With LeanKG\n- Tokens: {}\n- Token %: {}%\n- Time: {}s\n\n## Without LeanKG\n- Tokens: {}\n- Token %: {}%\n- Time: {}s\n\n## Overhead\n- Token Delta: {}\n- Token Delta %: {}%\n- Time Delta: {}s\n",
            name,
            with_leankg.total_tokens, with_leankg.token_percent, with_leankg.build_time_seconds,
            without_leankg.total_tokens, without_leankg.token_percent, without_leankg.build_time_seconds,
            overhead.token_delta, overhead.token_delta_percent, overhead.time_delta
        );
        std::fs::write(&md_path, md)?;

        Ok(())
    }
}
