#pragma once

#include "esp_netif.h"

/**
 * @brief Initialize soft AP
 *
 * @return esp_netif_t*
 */
esp_netif_t *wifi_init_softap(void);
