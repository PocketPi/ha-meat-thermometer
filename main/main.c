#include "esp_log.h"
#include "mdns.h"
#include "lwip/apps/netbiosns.h"
#include "esp_littlefs.h"
#include "console/console.h"
#include "settings/settings.h"
#include "esp_wifi.h"
#include "wifi/wifi.h"
#include "wifi/wifi_soft_ap.h"
#include "wifi/wifi_sta.h"

static const char *TAG = "main";

#define MDNS_INSTANCE "esp home web server"

#define FS_MOUNT_POINT "/www"
#define MDNS_HOST_NAME "dashboard"

esp_err_t start_rest_server(const char *base_path);

static void initialise_mdns(void)
{
    mdns_init();
    mdns_hostname_set(MDNS_HOST_NAME);
    mdns_instance_name_set(MDNS_INSTANCE);

    mdns_txt_item_t serviceTxtData[] = {
        {"board", "esp32"},
        {"path", "/"}
    };

    ESP_ERROR_CHECK(mdns_service_add("ESP32-WebServer", "_http", "_tcp", 80, serviceTxtData,
                                     sizeof(serviceTxtData) / sizeof(serviceTxtData[0])));
}

void app_main(void) {
    // Initialize NVS
    settings_nvs_init();

    esp_vfs_littlefs_conf_t conf = {
        .base_path = "/www",
        .partition_label = "www",
        .format_if_mount_failed = true,
        .dont_mount = false,
    };

    esp_vfs_littlefs_register(&conf);

    console_init();

    wifi_init();

    if (settings_wifi_configured()) {
        wifi_init_sta();
        ESP_LOGI(TAG, "wifi_init_sta finished.");
    } else {
        wifi_init_softap();
        ESP_LOGI(TAG, "wifi_init_softap finished.");
    }
    
    initialise_mdns();
    netbiosns_init();
    netbiosns_set_name("esp32");

    ESP_ERROR_CHECK(start_rest_server(FS_MOUNT_POINT));

}
