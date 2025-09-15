#pragma once

#include "esp_wifi.h"

/**
 * @brief Scan for WiFi networks
 *
 * @param ap_info Pointer to the array of WiFi access points
 * @param size Size of the array
 * @return int Number of WiFi access points found
 */
int wifi_scan(wifi_ap_record_t *ap_info, int size);
