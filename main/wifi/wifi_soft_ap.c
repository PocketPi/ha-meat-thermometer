#include "esp_log.h"
#include "esp_wifi.h"
#include <string.h>

#define AP_SSID            "ha-meat-thermometer"
#define AP_PASSWORD        "1234567890"
#define AP_CHANNEL         11
#define AP_MAX_CONNECTIONS 1

static const char *TAG = "wifi softAP";

/* Initialize soft AP */
esp_netif_t *wifi_init_softap(void) {
    esp_netif_t *esp_netif_ap = esp_netif_create_default_wifi_ap();

    wifi_config_t wifi_ap_config = {
        .ap =
            {
                .ssid = AP_SSID,
                .ssid_len = strlen(AP_SSID),
                .channel = AP_CHANNEL,
                .password = AP_PASSWORD,
                .max_connection = AP_MAX_CONNECTIONS,
                .authmode = WIFI_AUTH_WPA2_PSK,
            },
    };

    if (strlen(AP_PASSWORD) == 0) {
        wifi_ap_config.ap.authmode = WIFI_AUTH_OPEN;
    }

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_APSTA) );

    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));

    ESP_ERROR_CHECK(esp_wifi_start());

    ESP_LOGI(TAG, "wifi_init_softap finished. SSID:%s password:%s channel:%d", AP_SSID, AP_PASSWORD, AP_CHANNEL);

    return esp_netif_ap;
}
