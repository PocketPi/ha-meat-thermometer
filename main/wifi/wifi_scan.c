#include "wifi_scan.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include <string.h>

static const char *TAG = "wifi scan";

int wifi_scan(wifi_ap_record_t *ap_info, int size) {
    uint16_t number = size;
    uint16_t ap_count = 0;
    memset(ap_info, 0, sizeof(ap_info));

    // disconnect from any AP if connected to allow scan
    // esp_wifi_disconnect();

    esp_wifi_scan_start(NULL, true);

    ESP_LOGD(TAG, "Max AP number ap_info can hold = %u", number);
    ESP_ERROR_CHECK(esp_wifi_scan_get_ap_num(&ap_count));
    ESP_ERROR_CHECK(esp_wifi_scan_get_ap_records(&number, ap_info));
    ESP_LOGD(TAG, "Total APs scanned = %u, actual AP number ap_info holds = %u", ap_count, number);

    for (int i = 0; i < number; i++) {
        ESP_LOGD(TAG, "SSID \t\t%s", ap_info[i].ssid);
        ESP_LOGD(TAG, "RSSI \t\t%d\n", ap_info[i].rssi);
    }

    return number;
}
