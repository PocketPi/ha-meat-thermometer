#include "wifi_scan.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include <assert.h>
#include <string.h>

static const char *TAG = "scan";

static int compare_rssi(const void *a, const void *b) {
    return ((wifi_ap_record_t *)b)->rssi - ((wifi_ap_record_t *)a)->rssi;
}

int wifi_scan(wifi_ap_record_t *ap_info, int size) {
    uint16_t number = size;
    uint16_t ap_count = 0;
    memset(ap_info, 0, sizeof(ap_info));

    // disconnect from any AP if connected to allow scan
    esp_wifi_disconnect();

    esp_wifi_scan_start(NULL, true);

    ESP_LOGI(TAG, "Max AP number ap_info can hold = %u", number);
    ESP_ERROR_CHECK(esp_wifi_scan_get_ap_num(&ap_count));
    ESP_ERROR_CHECK(esp_wifi_scan_get_ap_records(&number, ap_info));
    ESP_LOGI(TAG, "Total APs scanned = %u, actual AP number ap_info holds = %u", ap_count, number);

    // sort the ap_info by rssi
    qsort(ap_info, number, sizeof(wifi_ap_record_t), compare_rssi);

    for (int i = 0; i < number; i++) {
        ESP_LOGI(TAG, "SSID \t\t%s", ap_info[i].ssid);
        ESP_LOGI(TAG, "RSSI \t\t%d\n", ap_info[i].rssi);
    }

    return number;
}
