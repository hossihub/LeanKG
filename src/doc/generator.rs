use crate::db::models::CodeElement;
use crate::graph::GraphEngine;
use std::path::PathBuf;

pub struct DocGenerator {
    graph: GraphEngine,
    output_path: PathBuf,
}

impl DocGenerator {
    pub fn new(graph: GraphEngine, output_path: PathBuf) -> Self {
        Self { graph, output_path }
    }

    pub async fn generate_for_element(
        &self,
        qualified_name: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        let element = self.graph.find_element(qualified_name).await?;
        
        let mut output = String::new();
        output.push_str(&format!("# {}\n\n", qualified_name));
        output.push_str(&format!("**Type:** {}\n", element.as_ref().map(|e| e.element_type.as_str()).unwrap_or("unknown")));
        output.push_str(&format!("**File:** {}\n", element.as_ref().map(|e| e.file_path.as_str()).unwrap_or("unknown")));
        output.push_str(&format!("**Lines:** {}-{}\n\n", 
            element.as_ref().map(|e| e.line_start).unwrap_or(0),
            element.as_ref().map(|e| e.line_end).unwrap_or(0)
        ));

        let relationships = self.graph.get_relationships(qualified_name).await?;
        if !relationships.is_empty() {
            output.push_str("## Relationships\n\n");
            for rel in relationships {
                output.push_str(&format!("- {}: {}\n", rel.rel_type, rel.target_qualified));
            }
        }

        Ok(output)
    }

    pub async fn generate_agents_md(&self) -> Result<String, Box<dyn std::error::Error>> {
        let elements = self.graph.all_elements().await?;
        let mut content = String::from("# Codebase Context\n\n");
        content.push_str("This codebase contains the following key components:\n\n");

        let mut files: Vec<&CodeElement> = elements.iter().filter(|e| e.element_type == "file").collect();
        files.sort_by_key(|e| &e.file_path);

        content.push_str("## Files\n\n");
        for elem in files {
            content.push_str(&format!("- `{}`\n", elem.file_path));
        }

        content.push_str("\n## Functions\n\n");
        let mut funcs: Vec<&CodeElement> = elements.iter().filter(|e| e.element_type == "function").collect();
        funcs.sort_by_key(|e| &e.qualified_name);
        for elem in funcs.iter().take(50) {
            content.push_str(&format!("- `{}` ({}:{})\n", elem.qualified_name, elem.file_path, elem.line_start));
        }

        Ok(content)
    }

    pub async fn generate_claude_md(&self) -> Result<String, Box<dyn std::error::Error>> {
        let elements = self.graph.all_elements().await?;
        let relationships = self.graph.all_relationships().await?;
        
        let mut content = String::from("# CLAUDE.md\n\n");
        content.push_str("## Project Context\n\n");
        content.push_str(&format!("This codebase has {} elements and {} relationships.\n\n", 
            elements.len(), relationships.len()));

        content.push_str("## Key Files\n\n");
        let mut files: Vec<&CodeElement> = elements.iter().filter(|e| e.element_type == "file").collect();
        files.sort_by_key(|e| &e.file_path);
        for elem in files.iter().take(10) {
            content.push_str(&format!("- `{}`\n", elem.file_path));
        }

        Ok(content)
    }
}
