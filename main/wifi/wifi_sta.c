#include "esp_event.h"
#include "esp_log.h"
#include "esp_wifi.h"
#include "settings.h"

static const char *TAG = "wifi_sta";

#define STA_MAXIMUM_RETRY 10

/* Initialize wifi station */
esp_netif_t *wifi_init_sta(void) {
    esp_netif_t *esp_netif_sta = esp_netif_create_default_wifi_sta();

    wifi_config_t wifi_sta_config = {
        .sta =
            {
                .ssid = {0},
                .password = {0},
                .scan_method = WIFI_ALL_CHANNEL_SCAN,
                .failure_retry_cnt = STA_MAXIMUM_RETRY,
                /* Authmode threshold resets to WPA2 as default if password matches WPA2 standards (password len => 8).
                 * If you want to connect the device to deprecated WEP/WPA networks, Please set the threshold value
                 * to WIFI_AUTH_WEP/WIFI_AUTH_WPA_PSK and set the password with length and format matching to
                 * WIFI_AUTH_WEP/WIFI_AUTH_WPA_PSK standards.
                 */
                .threshold.authmode = WIFI_AUTH_WPA2_PSK,
                .sae_pwe_h2e = WPA3_SAE_PWE_BOTH,
            },
    };

    settings_get_wifi_config(wifi_sta_config.sta.ssid, wifi_sta_config.sta.password);


    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_sta_config));

    ESP_LOGI(TAG, "wifi_init_sta finished.");

    ESP_LOGI(TAG, "Connecting to WiFi (SSID: %s) ...", wifi_sta_config.sta.ssid);

    esp_wifi_start();

    return esp_netif_sta;
}


void wifi_get_station_ssid(uint8_t *ssid, size_t ssid_len) {
    wifi_ap_record_t ap_info;
    esp_wifi_sta_get_ap_info(&ap_info);
    memcpy(ssid, ap_info.ssid, ssid_len);
}