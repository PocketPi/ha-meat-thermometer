#pragma once

#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>

void settings_nvs_init(void);

bool settings_wifi_configured(void);

void settings_set_wifi_configured(bool configured);

void settings_get_wifi_config(uint8_t *ssid, uint8_t *password);

void settings_set_wifi_config(const uint8_t *ssid, size_t ssid_len, const uint8_t *password, size_t password_len);

void settings_set_temp_target(int32_t temp_0, int32_t temp_1, int32_t temp_2, int32_t temp_3); 

void settings_get_temp_target(int32_t *temp_0, int32_t *temp_1, int32_t *temp_2, int32_t *temp_3);