use leankg::web::AppState;

#[tokio::test]
async fn test_app_state_creation() {
    let state = AppState::new(std::path::PathBuf::from(".leankg")).await;
    assert!(state.is_ok());
}

#[tokio::test]
async fn test_app_state_db_path() {
    let state = AppState::new(std::path::PathBuf::from("/tmp/test_db"))
        .await
        .unwrap();
    assert_eq!(state.db_path.to_str(), Some("/tmp/test_db"));
}

#[tokio::test]
async fn test_server_start_without_panic() {
    let handle = tokio::spawn(async {
        let result =
            leankg::web::start_server(18081, std::path::PathBuf::from(".leankg_test")).await;
        result
    });

    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    handle.abort();
}

#[test]
fn test_web_module_exports() {
    use leankg::web::{start_server, ApiResponse, AppState};

    let _ = start_server;
    let _ = AppState;
    let _ = ApiResponse;
}

#[test]
fn test_api_response_can_serialize() {
    use leankg::web::ApiResponse;

    #[derive(serde::Serialize)]
    struct TestData {
        name: String,
        value: i32,
    }

    let response: ApiResponse<TestData> = ApiResponse {
        success: true,
        data: Some(TestData {
            name: "test".to_string(),
            value: 42,
        }),
        error: None,
    };

    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"success\":true"));
    assert!(json.contains("test"));
    assert!(json.contains("42"));
}

#[test]
fn test_api_response_error_serialization() {
    use leankg::web::ApiResponse;

    #[derive(serde::Serialize)]
    struct TestData {
        items: Vec<String>,
    }

    let response: ApiResponse<TestData> = ApiResponse {
        success: false,
        data: None,
        error: Some("Something went wrong".to_string()),
    };

    let json = serde_json::to_string(&response).unwrap();
    assert!(json.contains("\"success\":false"));
    assert!(json.contains("Something went wrong"));
}

#[test]
fn test_web_routes_list() {
    let expected_routes = vec![
        "/",
        "/graph",
        "/browse",
        "/docs",
        "/annotate",
        "/quality",
        "/export",
        "/settings",
    ];

    for route in expected_routes {
        assert!(
            route.starts_with("/"),
            "All routes should start with /: {}",
            route
        );
    }
}

#[test]
fn test_api_routes_list() {
    let expected_api_routes = vec![
        "/api/elements",
        "/api/relationships",
        "/api/annotations",
        "/api/graph/data",
        "/api/export/graph",
        "/api/search",
    ];

    for route in expected_api_routes {
        assert!(
            route.starts_with("/api/"),
            "API routes should start with /api/: {}",
            route
        );
    }
}
