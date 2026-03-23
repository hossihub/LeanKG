pub struct TemplateEngine;

impl TemplateEngine {
    pub fn render_agents_template(elements: &[String]) -> String {
        let mut output = String::from("# AGENTS.md\n\n");
        output.push_str("```\n");
        output.push_str("## Codebase Structure\n\n");

        for element in elements {
            output.push_str(&format!("- {}\n", element));
        }

        output.push_str("```\n");
        output
    }

    pub fn render_claude_template(context: &str) -> String {
        let mut output = String::from("# CLAUDE.md\n\n");
        output.push_str("## Project Context\n\n");
        output.push_str(context);
        output.push('\n');
        output
    }

    pub fn render_file_summary(
        file_path: &str,
        elements: &[String],
        relationships: &[String],
    ) -> String {
        let mut output = String::new();
        output.push_str(&format!("# {}\n\n", file_path));
        output.push_str("## Elements\n\n");
        for elem in elements {
            output.push_str(&format!("- {}\n", elem));
        }
        output.push_str("\n## Relationships\n\n");
        for rel in relationships {
            output.push_str(&format!("- {}\n", rel));
        }
        output
    }
}
