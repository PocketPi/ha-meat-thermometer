#include "settings.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "esp_err.h"
#include "esp_log.h"
#include <stdint.h>
#include <stdbool.h>

static const char *TAG = "settings";

nvs_handle_t settings_nvs_handle;


static int get_blob(const char *key, void *value, size_t *size) {
    size_t required_size = 0;
    esp_err_t rc = nvs_get_blob(settings_nvs_handle, key, NULL, &required_size);
    if (rc == ESP_ERR_NVS_NOT_FOUND) {
        *size = 0;
        return -1;
    }
    if (rc != ESP_OK) {
        ESP_LOGE(TAG, "Failed to get blob size, key: %s, err: 0x%x", key, rc);
        return -1;
    }
    if (required_size > *size) {
        ESP_LOGE(TAG, "Blob is too long for buffer. Required size: %d, buffer size: %d", required_size, *size);
        return -1;
    }

    rc = nvs_get_blob(settings_nvs_handle, key, value, &required_size);
    if (rc != ESP_OK) {
        ESP_LOGE(TAG, "Failed to get blob value, key: %s, err: 0x%x", key, rc);
        return -1;
    }

    *size = required_size;
    return 0;
}

void settings_nvs_init(void) {
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    // Open the pre-filled NVS partition called "nvs"
    ESP_LOGI(TAG, "Opening Non-Volatile Storage (NVS) handle");
    esp_err_t err = nvs_open_from_partition("nvs", "storage", NVS_READWRITE, &settings_nvs_handle);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Error (%s) opening NVS handle!\n", esp_err_to_name(err));
        return;
    }
    ESP_LOGI(TAG, "The NVS handle successfully opened");
}

bool settings_wifi_configured(void) {
    uint8_t wifi_configured;
    nvs_get_u8(settings_nvs_handle, "wifi_configured", &wifi_configured);
    return wifi_configured == 1;
}

void settings_set_wifi_configured(bool configured) {
    nvs_set_u8(settings_nvs_handle, "wifi_configured", configured ? 1 : 0);
    nvs_commit(settings_nvs_handle);
}

void settings_get_wifi_config(uint8_t *ssid, uint8_t *password) {
    uint8_t data[64];
    size_t size = sizeof(data);
    get_blob("ssid", data, &size);
    memcpy(ssid, data, size);
    size = sizeof(data);
    get_blob("password", data, &size);
    memcpy(password, data, size);
}

void settings_set_wifi_config(const uint8_t *ssid, size_t ssid_len, const uint8_t *password, size_t password_len) {
    nvs_set_blob(settings_nvs_handle, "ssid", ssid, ssid_len);
    nvs_set_blob(settings_nvs_handle, "password", password, password_len);
    nvs_commit(settings_nvs_handle);
}