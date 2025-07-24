idf_component_register(SRCS main.c wifi_scan.c wifi_soft_ap.c wifi.c wifi_sta.c
                    PRIV_REQUIRES esp_wifi nvs_flash
                    INCLUDE_DIRS ".")
