-- {{DB_NAME}} will be replaced at runtime
CREATE DATABASE IF NOT EXISTS {{DB_NAME}};

-- Table for logs
CREATE TABLE IF NOT EXISTS {{DB_NAME}}.logs
(
    timestamp DateTime64(3) DEFAULT now64(),
    source LowCardinality(String),
    log_lvl LowCardinality(String),
    log_type LowCardinality(String),
    description Nullable(String),

    orgId UInt32,
    project_id UInt32,
    prompt_id UInt32,
    user_id Nullable(UInt32),
    api_key_id Nullable(UInt32),
    testcase_id Nullable(UInt32),

    vendor LowCardinality(String),
    model String,
    tokens_in UInt32,
    tokens_out UInt32,
    tokens_sum UInt32,
    cost Float64,
    response_ms UInt32,

    in String,
    out String,
    memory_key Nullable(String),

    stage LowCardinality(String) DEFAULT 'production'
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (orgId, project_id, timestamp)
SETTINGS index_granularity = 8192;
