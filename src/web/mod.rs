pub mod handlers;

use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post, put},
    Json, Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use surrealdb::engine::local::Db;
use surrealdb::Surreal;
use tokio::sync::RwLock;

use crate::db;
use crate::db::models::{BusinessLogic, CodeElement, Relationship};
use crate::graph::GraphEngine;

#[derive(Clone)]
pub struct AppState {
    pub db_path: std::path::PathBuf,
    db: Arc<RwLock<Option<Surreal<Db>>>>,
}

impl AppState {
    pub async fn new(db_path: std::path::PathBuf) -> Result<Self, Box<dyn std::error::Error>> {
        Ok(Self {
            db_path,
            db: Arc::new(RwLock::new(None)),
        })
    }

    pub async fn init_db(&self) -> Result<(), Box<dyn std::error::Error>> {
        let db = db::init_db(&self.db_path).await?;
        let mut lock = self.db.write().await;
        *lock = Some(db);
        Ok(())
    }

    pub async fn get_db(&self) -> Result<Surreal<Db>, Box<dyn std::error::Error>> {
        let lock = self.db.read().await;
        lock.clone()
            .ok_or_else(|| "Database not initialized".into())
    }

    pub async fn get_graph_engine(&self) -> Result<GraphEngine, Box<dyn std::error::Error>> {
        let db = self.get_db().await?;
        Ok(GraphEngine::new(db))
    }
}

#[derive(serde::Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T: serde::Serialize> IntoResponse for ApiResponse<T> {
    fn into_response(self) -> Response {
        let status = if self.success {
            StatusCode::OK
        } else {
            StatusCode::BAD_REQUEST
        };
        (status, Json(self)).into_response()
    }
}

pub async fn start_server(
    port: u16,
    db_path: std::path::PathBuf,
) -> Result<(), Box<dyn std::error::Error>> {
    let state = AppState::new(db_path).await?;
    state.init_db().await?;

    let app = Router::new()
        .route("/", get(handlers::index))
        .route("/graph", get(handlers::graph))
        .route("/browse", get(handlers::browse))
        .route("/docs", get(handlers::docs))
        .route("/annotate", get(handlers::annotate))
        .route("/quality", get(handlers::quality))
        .route("/export", get(handlers::export_page))
        .route("/settings", get(handlers::settings))
        .route("/api/elements", get(handlers::api_elements))
        .route("/api/relationships", get(handlers::api_relationships))
        .route("/api/annotations", get(handlers::api_annotations))
        .route("/api/annotations", post(handlers::api_create_annotation))
        .route(
            "/api/annotations/:element",
            get(handlers::api_get_annotation),
        )
        .route(
            "/api/annotations/:element",
            put(handlers::api_update_annotation),
        )
        .route("/api/export/graph", get(handlers::api_export_graph))
        .route("/api/search", get(handlers::api_search))
        .route("/api/graph/data", get(handlers::api_graph_data))
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("Web UI listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
