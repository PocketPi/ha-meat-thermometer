#pragma once

#include "esp_netif.h"

/**
 * @brief Initialize WiFi station
 *
 * @return esp_netif_t*
 */
esp_netif_t *wifi_init_sta(void);
