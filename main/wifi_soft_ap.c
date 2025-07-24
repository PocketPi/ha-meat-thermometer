#include "esp_event.h"
#include "esp_log.h"
#include "esp_mac.h"
#include "esp_wifi.h"
#include "freertos/task.h"
#include <string.h>

#define AP_SSID            "ha-meat-thermometer"
#define AP_PASSWORD        "12345678"
#define AP_CHANNEL         11
#define AP_MAX_CONNECTIONS 1

static const char *TAG = "wifi softAP";

static void wifi_event_handler(void *arg, esp_event_base_t event_base, int32_t event_id, void *event_data) {
    if (event_id == WIFI_EVENT_AP_STACONNECTED) {
        wifi_event_ap_staconnected_t *event = (wifi_event_ap_staconnected_t *)event_data;
        ESP_LOGI(TAG, "station " MACSTR " join, AID=%d", MAC2STR(event->mac), event->aid);
    } else if (event_id == WIFI_EVENT_AP_STADISCONNECTED) {
        wifi_event_ap_stadisconnected_t *event = (wifi_event_ap_stadisconnected_t *)event_data;
        ESP_LOGI(TAG, "station " MACSTR " leave, AID=%d, reason=%d", MAC2STR(event->mac), event->aid, event->reason);
    }
}

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

    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_AP, &wifi_ap_config));

    ESP_LOGI(TAG, "wifi_init_softap finished. SSID:%s password:%s channel:%d", AP_SSID, AP_PASSWORD, AP_CHANNEL);

    return esp_netif_ap;
}
