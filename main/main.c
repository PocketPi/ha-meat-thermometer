#include "esp_log.h"
#include "nvs_flash.h"
#include "wifi.h"
#include "wifi_scan.h"

static const char *TAG = "main";

void app_main(void) {
    // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    wifi_init();

    wifi_ap_record_t ap_info[10];
    int number = wifi_scan(ap_info, 10);
    for (int i = 0; i < number; i++) {
        ESP_LOGI(TAG, "SSID \t\t%s", ap_info[i].ssid);
        ESP_LOGI(TAG, "RSSI \t\t%d\n", ap_info[i].rssi);
    }
}
