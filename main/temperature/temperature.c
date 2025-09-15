#include "temperature.h"
#include "esp_random.h"

int32_t temperature_get_value(int32_t probe_id) {
    return esp_random() % 20;
}