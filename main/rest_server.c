#include <string.h>
#include <fcntl.h>
#include "esp_http_server.h"
#include "esp_chip_info.h"
#include "esp_log.h"
#include "esp_vfs.h"
#include "cJSON.h"
#include "wifi_scan.h"
#include "wifi_sta.h"
#include "settings.h"
#include "temperature.h"

static const char *REST_TAG = "esp-rest";
#define REST_CHECK(a, str, goto_tag, ...)                                              \
    do                                                                                 \
    {                                                                                  \
        if (!(a))                                                                      \
        {                                                                              \
            ESP_LOGE(REST_TAG, "%s(%d): " str, __FUNCTION__, __LINE__, ##__VA_ARGS__); \
            goto goto_tag;                                                             \
        }                                                                              \
    } while (0)

#define FILE_PATH_MAX (ESP_VFS_PATH_MAX + 128)
#define SCRATCH_BUFSIZE (10240)

typedef struct rest_server_context {
    char base_path[ESP_VFS_PATH_MAX + 1];
    char scratch[SCRATCH_BUFSIZE];
} rest_server_context_t;

#define CHECK_FILE_EXTENSION(filename, ext) (strcasecmp(&filename[strlen(filename) - strlen(ext)], ext) == 0)

/* Set HTTP response content type according to file extension */
static esp_err_t set_content_type_from_file(httpd_req_t *req, const char *filepath)
{
    const char *type = "text/plain";
    if (CHECK_FILE_EXTENSION(filepath, ".html")) {
        type = "text/html";
    } else if (CHECK_FILE_EXTENSION(filepath, ".js")) {
        type = "application/javascript";
    } else if (CHECK_FILE_EXTENSION(filepath, ".css")) {
        type = "text/css";
    } else if (CHECK_FILE_EXTENSION(filepath, ".png")) {
        type = "image/png";
    } else if (CHECK_FILE_EXTENSION(filepath, ".ico")) {
        type = "image/x-icon";
    } else if (CHECK_FILE_EXTENSION(filepath, ".svg")) {
        type = "text/xml";
    }
    return httpd_resp_set_type(req, type);
}

/* Send HTTP response with the contents of the requested file */
static esp_err_t rest_common_get_handler(httpd_req_t *req)
{
    char filepath[FILE_PATH_MAX];
    char uri_path[256];

    rest_server_context_t *rest_context = (rest_server_context_t *)req->user_ctx;
    strlcpy(filepath, rest_context->base_path, sizeof(filepath));
    
    // Copy URI and strip query parameters
    strlcpy(uri_path, req->uri, sizeof(uri_path));
    char *query_start = strchr(uri_path, '?');
    if (query_start) {
        *query_start = '\0';  // Remove query parameters
    }
    
    ESP_LOGI(REST_TAG, "URI: %s, base_path: %s", uri_path, rest_context->base_path);
    
    if (uri_path[strlen(uri_path) - 1] == '/') {
        strlcat(filepath, "/index.html", sizeof(filepath));
    } else {
        strlcat(filepath, uri_path, sizeof(filepath));
        
        // Check if the file exists, if not try adding /index.html for SPA routing
        int test_fd = open(filepath, O_RDONLY, 0);
        if (test_fd == -1) {
            // File doesn't exist, try with /index.html for directory routes
            strlcat(filepath, "/index.html", sizeof(filepath));
        } else {
            close(test_fd);
        }
    }
    
    ESP_LOGI(REST_TAG, "Final filepath: %s", filepath);
    
    int fd = open(filepath, O_RDONLY, 0);
    if (fd == -1) {
        ESP_LOGE(REST_TAG, "Failed to open file : %s", filepath);
        /* Respond with 500 Internal Server Error */
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to read existing file");
        return ESP_FAIL;
    }

    set_content_type_from_file(req, filepath);

    char *chunk = rest_context->scratch;
    ssize_t read_bytes;
    do {
        /* Read file in chunks into the scratch buffer */
        read_bytes = read(fd, chunk, SCRATCH_BUFSIZE);
        if (read_bytes == -1) {
            ESP_LOGE(REST_TAG, "Failed to read file : %s", filepath);
        } else if (read_bytes > 0) {
            /* Send the buffer contents as HTTP response chunk */
            if (httpd_resp_send_chunk(req, chunk, read_bytes) != ESP_OK) {
                close(fd);
                ESP_LOGE(REST_TAG, "File sending failed!");
                /* Abort sending file */
                httpd_resp_sendstr_chunk(req, NULL);
                /* Respond with 500 Internal Server Error */
                httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to send file");
                return ESP_FAIL;
            }
        }
    } while (read_bytes > 0);
    /* Close file after sending complete */
    close(fd);
    ESP_LOGI(REST_TAG, "File sending complete: %s", filepath);
    /* Respond with an empty chunk to signal HTTP response completion */
    httpd_resp_send_chunk(req, NULL, 0);
    return ESP_OK;
}

/* Simple handler for getting system handler */
static esp_err_t system_info_get_handler(httpd_req_t *req)
{
    httpd_resp_set_type(req, "application/json");
    cJSON *root = cJSON_CreateObject();
    esp_chip_info_t chip_info;
    esp_chip_info(&chip_info);
    cJSON_AddStringToObject(root, "version", IDF_VER);
    cJSON_AddNumberToObject(root, "cores", chip_info.cores);
    const char *sys_info = cJSON_Print(root);
    httpd_resp_sendstr(req, sys_info);
    free((void *)sys_info);
    cJSON_Delete(root);
    return ESP_OK;
}

/* Simple handler for getting temperature data */
static esp_err_t temperature_data_get_handler(httpd_req_t *req)
{
    httpd_resp_set_type(req, "application/json");
    cJSON *root = cJSON_CreateObject();
    cJSON_AddNumberToObject(root, "temp_0", temperature_get_value(0));
    cJSON_AddNumberToObject(root, "temp_1", temperature_get_value(1));
    cJSON_AddNumberToObject(root, "temp_2", temperature_get_value(2));
    cJSON_AddNumberToObject(root, "temp_3", temperature_get_value(3));

    int32_t temp_0, temp_1, temp_2, temp_3;
    settings_get_temp_target(&temp_0, &temp_1, &temp_2, &temp_3);
    cJSON_AddNumberToObject(root, "temp_0_target", temp_0);
    cJSON_AddNumberToObject(root, "temp_1_target", temp_1);
    cJSON_AddNumberToObject(root, "temp_2_target", temp_2);
    cJSON_AddNumberToObject(root, "temp_3_target", temp_3);

    const char *sys_info = cJSON_Print(root);
    httpd_resp_sendstr(req, sys_info);
    free((void *)sys_info);
    cJSON_Delete(root);
    return ESP_OK;
}

/* Handler for setting target temperature */
static esp_err_t temperature_set_target_handler(httpd_req_t *req) {
    int total_len = req->content_len;
    int cur_len = 0;
    char *buf = ((rest_server_context_t *)(req->user_ctx))->scratch;
    int received = 0;
    if (total_len >= SCRATCH_BUFSIZE) {
        /* Respond with 500 Internal Server Error */
        httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "content too long");
        return ESP_FAIL;
    }
    while (cur_len < total_len) {
        received = httpd_req_recv(req, buf + cur_len, total_len);
        if (received <= 0) {
            /* Respond with 500 Internal Server Error */
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to post control value");
            return ESP_FAIL;
        }
        cur_len += received;
    }
    buf[total_len] = '\0';

    cJSON *root = cJSON_Parse(buf);
    cJSON *temp_0 = cJSON_GetObjectItem(root, "temp_0");
    cJSON *temp_1 = cJSON_GetObjectItem(root, "temp_1");
    cJSON *temp_2 = cJSON_GetObjectItem(root, "temp_2");
    cJSON *temp_3 = cJSON_GetObjectItem(root, "temp_3");
    ESP_LOGI(REST_TAG, "Target temperature set to %d", temp_0->valueint);
    ESP_LOGI(REST_TAG, "Target temperature set to %d", temp_1->valueint);
    ESP_LOGI(REST_TAG, "Target temperature set to %d", temp_2->valueint);
    ESP_LOGI(REST_TAG, "Target temperature set to %d", temp_3->valueint);
    cJSON_Delete(root);
    settings_set_temp_target(temp_0->valueint, temp_1->valueint, temp_2->valueint, temp_3->valueint);
    httpd_resp_sendstr(req, "targets updated");
    return ESP_OK;
}

/* Handler for WiFi scan */
static esp_err_t wifi_scan_get_handler(httpd_req_t *req)
{
    httpd_resp_set_type(req, "application/json");
    
    // Maximum number of APs to scan
    #define MAX_AP_SCAN 10
    wifi_ap_record_t ap_info[MAX_AP_SCAN];

    ESP_LOGI(REST_TAG, "Performing WiFi scan");
    
    // Perform WiFi scan
    int ap_count = wifi_scan(ap_info, MAX_AP_SCAN);
    ESP_LOGI(REST_TAG, "WiFi scan complete");
    
    cJSON *root = cJSON_CreateObject();
    cJSON *networks = cJSON_CreateArray();
    ESP_LOGI(REST_TAG, "Creating JSON response");

    for (int i = 0; i < ap_count; i++) {
        cJSON *network = cJSON_CreateObject();
        cJSON_AddStringToObject(network, "ssid", (char*)ap_info[i].ssid);
        cJSON_AddNumberToObject(network, "rssi", ap_info[i].rssi);
        cJSON_AddNumberToObject(network, "authmode", ap_info[i].authmode);
        cJSON_AddItemToArray(networks, network);
    }
    
    cJSON_AddItemToObject(root, "networks", networks);
    cJSON_AddNumberToObject(root, "count", ap_count);
    ESP_LOGI(REST_TAG, "JSON response created");
    
    ESP_LOGI(REST_TAG, "Sending response");
    const char *response = cJSON_Print(root);
    httpd_resp_sendstr(req, response);
    free((void *)response);
    cJSON_Delete(root);
    ESP_LOGI(REST_TAG, "Response sent");
    return ESP_OK;
}

/* Handler for SSID of current connected station */
static esp_err_t wifi_station_get_handler(httpd_req_t *req) {
    httpd_resp_set_type(req, "application/json");
    cJSON *root = cJSON_CreateObject();
    uint8_t ssid[32];
    wifi_get_station_ssid(ssid, sizeof(ssid));
    cJSON_AddStringToObject(root, "ssid", (char *)ssid);
    const char *response = cJSON_Print(root);
    httpd_resp_sendstr(req, response);
    free((void *)response);
    cJSON_Delete(root);
    return ESP_OK;
}

/* Handler for setting wifi credentials */
static esp_err_t wifi_credentials_set_handler(httpd_req_t *req) {
    int total_len = req->content_len;
    int cur_len = 0;
    char *buf = ((rest_server_context_t *)(req->user_ctx))->scratch;
    int received = 0;
    
    // Check for valid content length
    if (total_len <= 0) {
        ESP_LOGE(REST_TAG, "Invalid content length: %d", total_len);
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Invalid content length");
        return ESP_FAIL;
    }
    
    if (total_len >= SCRATCH_BUFSIZE) {
        ESP_LOGE(REST_TAG, "Content too long: %d bytes", total_len);
        httpd_resp_send_err(req, HTTPD_413_CONTENT_TOO_LARGE, "content too long");
        return ESP_FAIL;
    }
    
    // Receive the request body
    while (cur_len < total_len) {
        received = httpd_req_recv(req, buf + cur_len, total_len - cur_len);
        if (received <= 0) {
            ESP_LOGE(REST_TAG, "Failed to receive data, received: %d", received);
            httpd_resp_send_err(req, HTTPD_500_INTERNAL_SERVER_ERROR, "Failed to receive data");
            return ESP_FAIL;
        }
        cur_len += received;
    }
    buf[total_len] = '\0';

    // Parse JSON
    cJSON *root = cJSON_Parse(buf);
    if (root == NULL) {
        ESP_LOGE(REST_TAG, "Failed to parse JSON");
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Invalid JSON");
        return ESP_FAIL;
    }

    // Get SSID and password from JSON
    cJSON *ssid = cJSON_GetObjectItem(root, "ssid");
    cJSON *password = cJSON_GetObjectItem(root, "password");
    
    // Validate JSON objects
    if (!cJSON_IsString(ssid) || !cJSON_IsString(password)) {
        ESP_LOGE(REST_TAG, "Invalid JSON structure - ssid or password not found or not strings");
        cJSON_Delete(root);
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Invalid JSON structure");
        return ESP_FAIL;
    }
    
    // Validate string lengths
    size_t ssid_len = strlen(ssid->valuestring);
    size_t password_len = strlen(password->valuestring);
    
    if (ssid_len == 0 || ssid_len > 32) {
        ESP_LOGE(REST_TAG, "Invalid SSID length: %d", ssid_len);
        cJSON_Delete(root);
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Invalid SSID length");
        return ESP_FAIL;
    }
    
    if (password_len > 63) {
        ESP_LOGE(REST_TAG, "Invalid password length: %d", password_len);
        cJSON_Delete(root);
        httpd_resp_send_err(req, HTTPD_400_BAD_REQUEST, "Invalid password length");
        return ESP_FAIL;
    }

    ESP_LOGI(REST_TAG, "Setting WiFi credentials - SSID: %s, Password length: %d", ssid->valuestring, password_len);
    
    settings_set_wifi_config((uint8_t *)ssid->valuestring, ssid_len + 1, (uint8_t *)password->valuestring, password_len + 1);
    
    // Mark WiFi as configured
    settings_set_wifi_configured(true);
    
    ESP_LOGI(REST_TAG, "WiFi credentials successfully stored");
    
    // Create response JSON
    cJSON *response = cJSON_CreateObject();
    cJSON_AddStringToObject(response, "message", "credentials updated");
    cJSON_AddBoolToObject(response, "success", true);
    
    const char *response_str = cJSON_Print(response);
    httpd_resp_set_type(req, "application/json");
    httpd_resp_sendstr(req, response_str);
    
    free((void *)response_str);
    cJSON_Delete(response);
    cJSON_Delete(root);
    return ESP_OK;
}

/* Handler for restarting the device */
static esp_err_t restart_device_handler(httpd_req_t *req) {
    ESP_LOGI(REST_TAG, "Restart request received, restarting device in 1 second...");
    
    // Send response before restarting
    httpd_resp_set_type(req, "application/json");
    httpd_resp_sendstr(req, "{\"message\":\"Device restarting...\",\"success\":true}");
    
    // Give time for response to be sent before restarting
    vTaskDelay(pdMS_TO_TICKS(1000));
    
    ESP_LOGI(REST_TAG, "Restarting device now");
    esp_restart();
    return ESP_OK;
}

esp_err_t start_rest_server(const char *base_path)
{
    REST_CHECK(base_path, "wrong base path", err);
    rest_server_context_t *rest_context = calloc(1, sizeof(rest_server_context_t));
    REST_CHECK(rest_context, "No memory for rest context", err);
    strlcpy(rest_context->base_path, base_path, sizeof(rest_context->base_path));

    httpd_handle_t server = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    config.uri_match_fn = httpd_uri_match_wildcard;

    ESP_LOGI(REST_TAG, "Starting HTTP Server");
    REST_CHECK(httpd_start(&server, &config) == ESP_OK, "Start server failed", err_start);

    /* URI handler for fetching system info */
    httpd_uri_t system_info_get_uri = {
        .uri = "/api/v1/system/info",
        .method = HTTP_GET,
        .handler = system_info_get_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &system_info_get_uri);

    /* URI handler for fetching temperature data */
    httpd_uri_t temperature_data_get_uri = {
        .uri = "/api/v1/temp/current",
        .method = HTTP_GET,
        .handler = temperature_data_get_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &temperature_data_get_uri);


    /* URI handler for setting target temperature */
    httpd_uri_t temperature_set_uri = {
        .uri = "/api/v1/temp/target",
        .method = HTTP_POST,
        .handler = temperature_set_target_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &temperature_set_uri);
    
    /* URI handler for WiFi scan */
    httpd_uri_t wifi_scan_get_uri = {
        .uri = "/api/v1/wifi/scan",
        .method = HTTP_GET,
        .handler = wifi_scan_get_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &wifi_scan_get_uri);

    /* URI handler for SSID of current connected station */
    httpd_uri_t wifi_station_get_uri = {
        .uri = "/api/v1/wifi/station",
        .method = HTTP_GET,
        .handler = wifi_station_get_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &wifi_station_get_uri);

    /* URI for setting wifi credentials */
    httpd_uri_t wifi_credentials_set_uri = {
        .uri = "/api/v1/wifi/credentials",
        .method = HTTP_POST,
        .handler = wifi_credentials_set_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &wifi_credentials_set_uri);

    /* URI handler for restarting the device */
    httpd_uri_t restart_device_uri = {
        .uri = "/api/v1/device/restart",
        .method = HTTP_POST,
        .handler = restart_device_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &restart_device_uri);

    /* URI handler for getting web server files */
    httpd_uri_t common_get_uri = {
        .uri = "/*",
        .method = HTTP_GET,
        .handler = rest_common_get_handler,
        .user_ctx = rest_context
    };
    httpd_register_uri_handler(server, &common_get_uri);

    return ESP_OK;
err_start:
    free(rest_context);
err:
    return ESP_FAIL;
}
