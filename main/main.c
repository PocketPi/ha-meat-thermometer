#include "esp_log.h"
#include "nvs_flash.h"
#include "mdns.h"
#include "lwip/apps/netbiosns.h"
#include "esp_littlefs.h"
#include "wifi.h"
#include "wifi_scan.h"

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
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    esp_vfs_littlefs_conf_t conf = {
        .base_path = "/www",
        .partition_label = "www",
        .format_if_mount_failed = true,
        .dont_mount = false,
    };

    esp_vfs_littlefs_register(&conf);
    
    initialise_mdns();
    netbiosns_init();
    netbiosns_set_name("esp32");

    ESP_ERROR_CHECK(start_rest_server(FS_MOUNT_POINT));

    wifi_init();

    wifi_ap_record_t ap_info[10];
    int number = wifi_scan(ap_info, 10);
    for (int i = 0; i < number; i++) {
        ESP_LOGI(TAG, "SSID \t\t%s", ap_info[i].ssid);
        ESP_LOGI(TAG, "RSSI \t\t%d\n", ap_info[i].rssi);
    }
}
