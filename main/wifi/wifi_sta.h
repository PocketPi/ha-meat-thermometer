#pragma once

#include "esp_netif.h"

/**
 * @brief Initialize WiFi station
 *
 * @return esp_netif_t*
 */
esp_netif_t *wifi_init_sta(void);

/**
 * @brief Get the SSID of the current connected station
 *
 * @param ssid Pointer to the array of SSID
 * @param ssid_len Size of the array
 */
void wifi_get_station_ssid(uint8_t *ssid, size_t ssid_len);